'use strict';

// Cœur partagé du prerender : utilisé par client/scripts/prerender.mjs (build
// complet) et par src/services/prerenderService.js (régénération à la demande
// après modification d'un fournisseur dans le dashboard).
//
// Le mini-serveur statique répond aux routes /api/providers* directement
// depuis MySQL : aucune dépendance à un backend démarré, ni au build ni à la
// demande. Les autres /api/* reçoivent un 404 JSON (composants best-effort).

const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'client', 'dist');

const providerModel = require('../models/providerModel');
const htmlCache = require('./htmlCache');

// Playwright est une devDependency du client — résolution explicite.
function getChromium() {
  const { chromium } = require(path.join(PROJECT_ROOT, 'client', 'node_modules', 'playwright'));
  return chromium;
}

// Statics montés hors de dist/ en prod (cf. app.js) — le mini-serveur doit
// les servir aussi, sinon les logos 404ent au prerender et le snapshot
// capture le fallback initiales (mismatch d'hydratation garanti).
const EXTRA_MOUNTS = [
  { prefix: '/img/', dir: path.join(PROJECT_ROOT, 'img') },
  { prefix: '/uploads/', dir: path.join(PROJECT_ROOT, 'uploads') },
  { prefix: '/assets/videos/', dir: path.join(PROJECT_ROOT, 'assets', 'videos') },
  { prefix: '/assets/images/', dir: path.join(PROJECT_ROOT, 'assets', 'images') },
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
};

const BLOCKED_HOSTS = [
  'leadbooster-chat.pipedrive.com',
  'webforms.pipedrive.com',
  'pipedriveassets.com',
  'googletagmanager.com',
  'google-analytics.com',
];

function sendJson(res, status, payload) {
  res.writeHead(status, { 'content-type': MIME['.json'] });
  res.end(JSON.stringify(payload));
}

async function handleApi(p, res) {
  try {
    if (p === '/api/providers') {
      return sendJson(res, 200, { providers: await providerModel.getPublishedProviders() });
    }
    const match = p.match(/^\/api\/providers\/([a-z0-9-]+)$/i);
    if (match) {
      const provider = await providerModel.getPublishedProviderBySlug(match[1]);
      if (!provider) return sendJson(res, 404, { error: 'Fournisseur introuvable' });
      return sendJson(res, 200, provider);
    }
    return sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    return sendJson(res, 500, { error: err.message });
  }
}

function startServer(shellHtml) {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      try {
        const p = decodeURIComponent((req.url || '/').split('?')[0]);
        if (p.startsWith('/api/')) return handleApi(p, res);
        // Pas d'extension → shell SPA, le routeur client rend la route demandée.
        if (p === '/' || !path.extname(p)) {
          res.writeHead(200, { 'content-type': MIME['.html'] });
          res.end(shellHtml);
          return;
        }
        // Helper : lit un fichier résolu et répond, ou 404.
        async function serveFile(filePath) {
          try {
            const buf = await fs.readFile(filePath);
            const ct = MIME[path.extname(p).toLowerCase()] || 'application/octet-stream';
            res.writeHead(200, { 'content-type': ct });
            res.end(buf);
          } catch {
            res.writeHead(404, { 'content-type': 'text/plain' });
            res.end('Not found');
          }
        }

        // Mounts racine : /img/, /uploads/, /assets/videos/, /assets/images/
        const mount = EXTRA_MOUNTS.find((m) => p.startsWith(m.prefix));
        if (mount) {
          const filePath = path.join(mount.dir, p.slice(mount.prefix.length));
          // Sécurité traversée : le chemin résolu doit rester dans le répertoire du mount.
          if (!filePath.startsWith(mount.dir + path.sep)) {
            res.writeHead(404, { 'content-type': 'text/plain' });
            res.end('Not found');
            return;
          }
          return serveFile(filePath);
        }

        // Sécurité : rejeter tout chemin qui sortirait de DIST_DIR (traversée).
        const filePath = path.join(DIST_DIR, p);
        if (!filePath.startsWith(DIST_DIR + path.sep)) {
          res.writeHead(404, { 'content-type': 'text/plain' });
          res.end('Not found');
          return;
        }
        return serveFile(filePath);
      } catch {
        // decodeURIComponent ou autre erreur imprévue → 400 pour ne pas tuer Passenger.
        res.writeHead(400, { 'content-type': 'text/plain' });
        res.end('Bad request');
      }
    });
    // Port 0 → port éphémère : pas de conflit entre build et régénération.
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function routeToOutPath(route) {
  if (route === '/') return path.join(DIST_DIR, 'index.html');
  return path.join(DIST_DIR, route.replace(/^\//, ''), 'index.html');
}

// Shell SPA vierge produit par Vite. Préservé dans __shell.html dès le premier
// prerender (dist/index.html est ensuite écrasé par la home prérendue).
async function loadShell() {
  const shellPath = path.join(DIST_DIR, '__shell.html');
  if (fsSync.existsSync(shellPath)) return fs.readFile(shellPath, 'utf8');
  const html = await fs.readFile(path.join(DIST_DIR, 'index.html'), 'utf8');
  await fs.writeFile(shellPath, html);
  return html;
}

async function snapshot(page) {
  // Attend le montage React ET la fin des fetchs de données : les pages qui
  // chargent depuis l'API posent data-prerender-pending sur leur squelette.
  await page.waitForFunction(
    () => document.getElementById('root')?.children?.length > 0
      && !document.querySelector('[data-prerender-pending]'),
    { timeout: 20000 }
  );
  // Refuse de baker un état d'erreur : si la page a rendu un data-prerender-error,
  // on lève pour que la route atterrisse dans failures (l'HTML sur disque reste intact).
  const hasError = await page.evaluate(() => Boolean(document.querySelector('[data-prerender-error]')));
  if (hasError) {
    throw new Error('la page a rendu un état d\'erreur — snapshot refusé');
  }
  // Court délai pour le flush synchrone Helmet → <head>
  await page.waitForTimeout(150);
  // React pose `muted` en propriété DOM seulement — forcer l'attribut pour
  // que l'autoplay fonctionne sur le HTML servi avant hydratation.
  await page.evaluate(() => {
    document.querySelectorAll('video').forEach((v) => {
      if (v.muted) v.setAttribute('muted', '');
    });
  });
  let html = await page.evaluate(() => '<!DOCTYPE html>\n' + document.documentElement.outerHTML);
  // Sérialise les données API consommées par la page pour que l'hydratation
  // reparte du même état (cf. client/src/lib/providersApi.js). Échappement
  // de '<' pour empêcher toute sortie du <script> par le contenu.
  const data = await page.evaluate(() => window.__VOLTEA_DATA__ || null);
  if (data) {
    const json = JSON.stringify(data).replace(/</g, '\\u003c');
    html = html.replace('</head>', () => `<script>window.__VOLTEA_DATA__ = ${json}</script></head>`);
  }
  return html;
}

async function writeAtomic(outPath, html) {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  // Nom unique par PID + timestamp : deux processus (build + Passenger) peuvent
  // écrire la même route simultanément sans se marcher dessus.
  const tmp = `${outPath}.${process.pid}.${Date.now()}.tmp`;
  try {
    await fs.writeFile(tmp, html);
    await fs.rename(tmp, outPath);
  } catch (err) {
    await fs.rm(tmp, { force: true }).catch(() => {});
    throw err;
  }
  htmlCache.invalidate(outPath);
}

async function prerenderRoutes(routes, { includeNotFound = false, log = console } = {}) {
  const shellHtml = await loadShell();
  // getChromium() en premier : si playwright est absent, on échoue avant de
  // créer la moindre ressource (serveur, browser).
  const chromium = getChromium();
  const server = await startServer(shellHtml);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const failures = [];
  let okCount = 0;

  try {
    const browser = await chromium.launch();
    try {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        bypassCSP: true,
        userAgent: 'VolteaPrerender/1.0',
        extraHTTPHeaders: { 'x-prerender': '1' },
      });
      await context.route('**/*', (route) => {
        const url = route.request().url();
        if (BLOCKED_HOSTS.some((d) => url.includes(d))) return route.abort();
        return route.continue();
      });

      for (const route of routes) {
        const page = await context.newPage();
        page.on('pageerror', (err) => log.error(`[prerender] ${route} pageerror: ${err.message}`));
        try {
          await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
          const html = await snapshot(page);
          const outPath = routeToOutPath(route);
          await writeAtomic(outPath, html);
          log.log(`✓ ${route.padEnd(36)} (${(html.length / 1024).toFixed(1)} kB)`);
          okCount++;
        } catch (err) {
          log.error(`✗ ${route}: ${err.message}`);
          failures.push({ route, error: err.message });
        } finally {
          await page.close();
        }
      }

      // Page 404 prérendue (catch-all <Route path="*">) — build complet seulement.
      if (includeNotFound) {
        const page = await context.newPage();
        try {
          await page.goto(`${baseUrl}/__not-found`, { waitUntil: 'domcontentloaded', timeout: 20000 });
          const html = await snapshot(page);
          await writeAtomic(path.join(DIST_DIR, '__notfound.html'), html);
          log.log('✓ /__not-found → __notfound.html');
        } catch (err) {
          log.error(`[prerender] /__not-found failed: ${err.message}`);
        } finally {
          await page.close();
        }
      }
    } finally {
      // Ferme le browser même si newContext/route/crawl lève une erreur.
      await browser.close();
    }
  } finally {
    // Ferme le serveur HTTP dans tous les cas, y compris si browser.close() lève.
    await new Promise((r) => server.close(r));
  }

  return { okCount, failures };
}

async function removePrerenderedRoute(route) {
  if (route === '/') return; // jamais supprimer dist/index.html
  const outPath = routeToOutPath(route);
  await fs.rm(outPath, { force: true });
  htmlCache.invalidate(outPath);
  await fs.rmdir(path.dirname(outPath)).catch(() => {}); // best-effort si vide
}

module.exports = { prerenderRoutes, removePrerenderedRoute, routeToOutPath, DIST_DIR };
