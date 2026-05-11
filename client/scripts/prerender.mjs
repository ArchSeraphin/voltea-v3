#!/usr/bin/env node
// Build-time prerender. After `vite build`, crawl every known public route
// in a headless browser and write the rendered HTML to dist/<route>/index.html
// so search engines and AI crawlers (GPTBot, ClaudeBot, PerplexityBot,
// OAI-SearchBot, Google-Extended) see real content instead of the empty
// SPA shell. Hydration on the client picks up where prerender left off.

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '..', '..', 'client', 'dist');
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

// Pull the canonical route list from the same module Express uses,
// so prerender and runtime stay in lockstep.
const { STATIC_ROUTES, PROVIDER_ROUTES } = require(
  path.join(PROJECT_ROOT, 'src', 'config', 'routes.js')
);

const ROUTES = [
  ...STATIC_ROUTES.map((r) => r.path),
  ...PROVIDER_ROUTES.map((r) => r.path),
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

// Minimal static server — assets are served from disk, but every HTML
// request resolves to the in-memory SPA shell so client-side routing
// renders the requested route from a clean state. This is critical:
// once we start writing prerendered HTML to dist/, subsequent crawler
// hits would otherwise be served stale content and hydrate mismatched.
function startServer(port, shellHtml) {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      let p = decodeURIComponent((req.url || '/').split('?')[0]);
      // No file extension or root → always return the SPA shell so React
      // Router takes over for the requested route.
      if (p === '/' || !path.extname(p)) {
        res.writeHead(200, { 'content-type': MIME['.html'] });
        res.end(shellHtml);
        return;
      }
      try {
        const buf = await fs.readFile(path.join(DIST_DIR, p));
        const ct = MIME[path.extname(p).toLowerCase()] || 'application/octet-stream';
        res.writeHead(200, { 'content-type': ct });
        res.end(buf);
      } catch {
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('Not found');
      }
    });
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

function routeToOutPath(route) {
  if (route === '/') return path.join(DIST_DIR, 'index.html');
  // Strip leading slash and write to <route>/index.html so that Express
  // can serve dist/<route>/index.html on GET /<route>.
  return path.join(DIST_DIR, route.replace(/^\//, ''), 'index.html');
}

async function snapshot(page, route) {
  // Wait for the React tree to mount and Helmet to flush <title>/<meta>.
  await page.waitForFunction(
    () => document.getElementById('root')?.children?.length > 0,
    { timeout: 15000 }
  );
  // Tiny grace period for synchronous Helmet → <head> flush
  await page.waitForTimeout(150);
  // React renders <video muted /> as a DOM property only — the `muted`
  // attribute never lands in outerHTML, and Chrome/Brave on desktop then
  // refuse to autoplay the served HTML before React has a chance to
  // hydrate. Force the attribute onto every <video> before snapshotting.
  await page.evaluate(() => {
    document.querySelectorAll('video').forEach((v) => {
      if (v.muted) v.setAttribute('muted', '');
    });
  });
  const html = await page.evaluate(() => '<!DOCTYPE html>\n' + document.documentElement.outerHTML);
  return html;
}

async function main() {
  // Read the vite-produced empty SPA shell once and preserve it on disk
  // for Express (used as hydration target for admin, dynamic article slugs
  // and the 404 fallback when no prerendered file exists).
  const shellHtml = await fs.readFile(path.join(DIST_DIR, 'index.html'), 'utf8');
  await fs.writeFile(path.join(DIST_DIR, '__shell.html'), shellHtml);
  console.log('[prerender] saved SPA shell to dist/__shell.html');

  const PORT = 4317; // any free port
  const server = await startServer(PORT, shellHtml);
  console.log(`[prerender] static server on http://127.0.0.1:${PORT}`);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    bypassCSP: true,
    userAgent: 'VolteaPrerender/1.0',
    // Block third-party scripts at prerender time so we capture the
    // real first-paint without external trackers polluting the snapshot.
    extraHTTPHeaders: { 'x-prerender': '1' },
  });

  // Drop noisy/external requests during prerender — GA, Pipedrive chat,
  // Pipedrive forms — they don't need to be in the static snapshot.
  await context.route('**/*', (route) => {
    const url = route.request().url();
    const block = [
      'leadbooster-chat.pipedrive.com',
      'webforms.pipedrive.com',
      'pipedriveassets.com',
      'googletagmanager.com',
      'google-analytics.com',
    ];
    if (block.some((d) => url.includes(d))) {
      return route.abort();
    }
    return route.continue();
  });

  const failures = [];
  let okCount = 0;
  for (const route of ROUTES) {
    const page = await context.newPage();
    page.on('pageerror', (err) => console.error(`[prerender] ${route} pageerror:`, err.message));
    try {
      await page.goto(`http://127.0.0.1:${PORT}${route}`, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });
      const html = await snapshot(page, route);
      const outPath = routeToOutPath(route);
      await fs.mkdir(path.dirname(outPath), { recursive: true });
      await fs.writeFile(outPath, html);
      const rel = path.relative(DIST_DIR, outPath);
      console.log(`✓ ${route.padEnd(36)} → ${rel}  (${(html.length / 1024).toFixed(1)} kB)`);
      okCount++;
    } catch (err) {
      console.error(`✗ ${route}: ${err.message}`);
      failures.push({ route, error: err.message });
    } finally {
      await page.close();
    }
  }

  // Also prerender the NotFound page (catch-all <Route path="*">) so the
  // 404 status response carries real content instead of the empty shell.
  try {
    const page = await context.newPage();
    await page.goto(`http://127.0.0.1:${PORT}/__not-found`, {
      waitUntil: 'domcontentloaded',
      timeout: 20000,
    });
    const html = await snapshot(page, '/__not-found');
    await fs.writeFile(path.join(DIST_DIR, '__notfound.html'), html);
    console.log(`✓ /__not-found                       → __notfound.html  (${(html.length / 1024).toFixed(1)} kB)`);
    await page.close();
  } catch (err) {
    console.error('[prerender] /__not-found failed:', err.message);
  }

  await browser.close();
  await new Promise((r) => server.close(r));

  console.log(`\n[prerender] ${okCount}/${ROUTES.length} routes prerendered`);

  if (failures.length > 0) {
    console.error(`[prerender] ${failures.length} failure(s)`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[prerender] crashed:', err);
  process.exit(1);
});
