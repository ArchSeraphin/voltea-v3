# Gestion des fournisseurs depuis le dashboard admin — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrer les 8 fournisseurs codés en dur vers MySQL, exposer un CRUD admin complet (formulaire guidé pour un utilisateur non technique), et régénérer automatiquement le HTML prérendu des pages `/guide-energie*` après chaque modification.

**Architecture:** Table `providers` auto-créée et seedée au démarrage (pattern `reviews`). API publique + admin (pattern `articleController`). Les pages publiques lisent l'API avec hydratation via `window.__VOLTEA_DATA__` injecté dans le HTML prérendu. Le cœur du prerender devient une lib CommonJS partagée (`src/services/prerenderLib.js`) dont le mini-serveur statique répond `/api/providers*` directement depuis MySQL ; elle est consommée par le script de build et par une file de régénération à la demande (`src/services/prerenderService.js`).

**Tech Stack:** Express 4, mysql2 (raw SQL), express-validator, Playwright (chromium-headless-shell), React 18 + Vite, react-router 6.

**Spec :** `docs/superpowers/specs/2026-06-10-providers-admin-crud-design.md`

**Ordre des tâches (important) :** le pipeline de build est migré (Task 6) **avant** la refonte des pages publiques (Tasks 7–8) : le nouveau mini-serveur du prerender sait répondre `/api/providers*`, donc un build reste correct à chaque commit, que les pages lisent encore les données dures ou déjà l'API.

**Note vérification :** le repo n'a aucun framework de test (convention existante). Chaque tâche se vérifie par commandes (`node --check`, `node -e`, `curl`) avec sortie attendue, + vérification visuelle finale. Prérequis : MySQL local démarré et `.env` racine renseigné (l'app `npm run dev` doit déjà fonctionner).

---

### Task 1: Seed serveur des 8 fournisseurs

**Files:**
- Create: `src/models/providersSeed.js`

- [ ] **Step 1: Créer le fichier de seed**

Copier les 8 objets de `client/src/data/providersData.js` (lignes 6–239) dans un module CommonJS. Le fichier fait ~240 lignes : reprendre **exactement** les données existantes (slug, name, fullName, logoUrl, tagline, category, description, offers, pros, cons, profiles) pour chacun des 8 fournisseurs (edf, engie, totalenergies, ekwateur, vattenfall, eni, alpiq, primeo-energie), dans cet ordre. Structure du fichier :

```js
'use strict';

// Données de seed de la table `providers` — copie serveur des 8 fournisseurs
// historiquement codés en dur dans client/src/data/providersData.js (supprimé
// depuis : la BDD est la seule source de vérité, ce fichier ne sert qu'au
// premier remplissage de la table).

module.exports = [
  {
    slug: 'edf',
    name: 'EDF',
    fullName: 'Électricité de France',
    logoUrl: '/img/providers/edf.png',
    tagline: 'Le fournisseur historique français, solide et reconnu',
    category: 'Historique',
    description: [
      "EDF (Électricité de France) est le fournisseur d'énergie historique en France et l'un des plus grands producteurs d'électricité en Europe. Fondé en 1946, il s'appuie sur un parc de production massif — notamment nucléaire — qui couvre environ 70 % de la production électrique nationale.",
      "Pour les professionnels, EDF propose des contrats adaptés à toutes les tailles d'entreprises, des TPE aux grands industriels, avec une gamme allant des tarifs réglementés (pour les sites éligibles) aux offres de marché à prix fixes ou indexés.",
    ],
    offers: [
      { label: 'Électricité', description: "Offres aux tarifs réglementés (TRV) et contrats de marché indexés ou à prix fixes" },
      { label: 'Gaz naturel', description: "Offres de marché depuis la fin des tarifs réglementés en 2023" },
      { label: 'Énergie verte', description: "Options « Vertiss » avec garanties d'origine renouvelable certifiées" },
    ],
    pros: [
      "Solidité financière et pérennité garantie",
      "Réseau d'agences physiques sur tout le territoire",
      "Offres adaptées aux grands consommateurs industriels",
      "Facturation claire avec historique détaillé en ligne",
    ],
    cons: [
      "Tarifs souvent moins compétitifs que les fournisseurs alternatifs pour les PME",
      "Service client parfois difficile à joindre pour les professionnels",
      "Moins de flexibilité commerciale que les nouveaux entrants du marché",
    ],
    profiles: ['TPE', 'PME', 'Industrie'],
  },
  // … les 7 autres fournisseurs, copiés à l'identique depuis providersData.js
];
```

- [ ] **Step 2: Vérifier**

Run: `node -e "const s = require('./src/models/providersSeed'); console.log(s.length, s.map(p => p.slug).join(','))"`
Expected: `8 edf,engie,totalenergies,ekwateur,vattenfall,eni,alpiq,primeo-energie`

- [ ] **Step 3: Commit**

```bash
git add src/models/providersSeed.js
git commit -m "feat(providers): seed serveur des 8 fournisseurs existants"
```

---

### Task 2: Modèle providers (table + seed + CRUD SQL)

**Files:**
- Create: `src/models/providerModel.js`

- [ ] **Step 1: Créer le modèle**

```js
'use strict';

const pool = require('../config/database');
const seedProviders = require('./providersSeed');

// mysql2 renvoie les colonnes JSON tantôt parsées (protocole binaire) tantôt
// en chaîne — on normalise dans les deux sens.
function parseJsonField(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return value;
}

// Forme API unique (camelCase) utilisée par le public, l'admin et le prerender.
function rowToProvider(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    fullName: row.full_name || '',
    logoUrl: row.logo_url || '',
    tagline: row.tagline || '',
    category: row.category || '',
    description: parseJsonField(row.description, []),
    offers: parseJsonField(row.offers, []),
    pros: parseJsonField(row.pros, []),
    cons: parseJsonField(row.cons, []),
    profiles: parseJsonField(row.profiles, []),
    published: Boolean(row.published),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function cleanStringList(value) {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v).trim()).filter(Boolean);
}

function cleanOffers(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((o) => ({
      label: String(o && o.label ? o.label : '').trim(),
      description: String(o && o.description ? o.description : '').trim(),
    }))
    .filter((o) => o.label);
}

// Création + seed : appelée par app.js au démarrage ET par le prerender au
// build, pour que l'ordre build/démarrage soit indifférent au premier déploiement.
async function ensureProvidersTable() {
  await pool.execute(`CREATE TABLE IF NOT EXISTS providers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(200) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    full_name VARCHAR(255),
    logo_url VARCHAR(500),
    tagline VARCHAR(500),
    category VARCHAR(100),
    description JSON,
    offers JSON,
    pros JSON,
    cons JSON,
    profiles JSON,
    published TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM providers');
  if (rows[0].count > 0) return;

  for (let i = 0; i < seedProviders.length; i++) {
    const p = seedProviders[i];
    await pool.execute(
      `INSERT INTO providers
        (slug, name, full_name, logo_url, tagline, category, description, offers, pros, cons, profiles, published, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [p.slug, p.name, p.fullName, p.logoUrl, p.tagline, p.category,
       JSON.stringify(p.description), JSON.stringify(p.offers), JSON.stringify(p.pros),
       JSON.stringify(p.cons), JSON.stringify(p.profiles), i]
    );
  }
  console.log(`[Voltea] Table providers seedée avec ${seedProviders.length} fournisseurs`);
}

async function getPublishedProviders() {
  const [rows] = await pool.execute(
    'SELECT * FROM providers WHERE published = 1 ORDER BY sort_order ASC, id ASC'
  );
  return rows.map(rowToProvider);
}

async function getPublishedProviderBySlug(slug) {
  const [rows] = await pool.execute(
    'SELECT * FROM providers WHERE slug = ? AND published = 1 LIMIT 1',
    [slug]
  );
  return rows.length ? rowToProvider(rows[0]) : null;
}

async function getPublishedSlugs() {
  const [rows] = await pool.execute(
    'SELECT slug FROM providers WHERE published = 1 ORDER BY sort_order ASC'
  );
  return rows.map((r) => r.slug);
}

async function getAllProviders() {
  const [rows] = await pool.execute('SELECT * FROM providers ORDER BY sort_order ASC, id ASC');
  return rows.map(rowToProvider);
}

async function getProviderById(id) {
  const [rows] = await pool.execute('SELECT * FROM providers WHERE id = ? LIMIT 1', [id]);
  return rows.length ? rowToProvider(rows[0]) : null;
}

async function slugExists(slug, excludeId = null) {
  const sql = excludeId
    ? 'SELECT id FROM providers WHERE slug = ? AND id != ? LIMIT 1'
    : 'SELECT id FROM providers WHERE slug = ? LIMIT 1';
  const params = excludeId ? [slug, excludeId] : [slug];
  const [rows] = await pool.execute(sql, params);
  return rows.length > 0;
}

async function createProvider(data) {
  const [max] = await pool.execute('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM providers');
  const [result] = await pool.execute(
    `INSERT INTO providers
      (slug, name, full_name, logo_url, tagline, category, description, offers, pros, cons, profiles, published, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.slug, data.name, data.fullName || null, data.logoUrl || null, data.tagline || null,
     data.category || null, JSON.stringify(data.description), JSON.stringify(data.offers),
     JSON.stringify(data.pros), JSON.stringify(data.cons), JSON.stringify(data.profiles),
     data.published ? 1 : 0, max[0].next]
  );
  return getProviderById(result.insertId);
}

async function updateProvider(id, data) {
  await pool.execute(
    `UPDATE providers SET slug = ?, name = ?, full_name = ?, logo_url = ?, tagline = ?,
      category = ?, description = ?, offers = ?, pros = ?, cons = ?, profiles = ?, published = ?
     WHERE id = ?`,
    [data.slug, data.name, data.fullName || null, data.logoUrl || null, data.tagline || null,
     data.category || null, JSON.stringify(data.description), JSON.stringify(data.offers),
     JSON.stringify(data.pros), JSON.stringify(data.cons), JSON.stringify(data.profiles),
     data.published ? 1 : 0, id]
  );
  return getProviderById(id);
}

async function deleteProvider(id) {
  const [result] = await pool.execute('DELETE FROM providers WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function togglePublished(id) {
  await pool.execute('UPDATE providers SET published = NOT published WHERE id = ?', [id]);
  return getProviderById(id);
}

async function reorderProviders(ids) {
  for (let i = 0; i < ids.length; i++) {
    await pool.execute('UPDATE providers SET sort_order = ? WHERE id = ?', [i, ids[i]]);
  }
}

module.exports = {
  ensureProvidersTable,
  getPublishedProviders,
  getPublishedProviderBySlug,
  getPublishedSlugs,
  getAllProviders,
  getProviderById,
  slugExists,
  createProvider,
  updateProvider,
  deleteProvider,
  togglePublished,
  reorderProviders,
  cleanStringList,
  cleanOffers,
};
```

- [ ] **Step 2: Vérifier création + seed sur la BDD locale**

Run:
```bash
node -e "
require('dotenv').config();
const m = require('./src/models/providerModel');
(async () => {
  await m.ensureProvidersTable();
  const all = await m.getPublishedProviders();
  console.log('count:', all.length);
  console.log('first:', all[0].slug, '|', all[0].name, '|', all[0].offers.length, 'offres');
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
"
```
Expected: `count: 8` puis `first: edf | EDF | 3 offres`. Relancer la commande : toujours 8 (le seed ne double pas).

- [ ] **Step 3: Commit**

```bash
git add src/models/providerModel.js
git commit -m "feat(providers): modèle MySQL avec auto-création de table et seed"
```

---

### Task 3: Module htmlCache partagé (extraction depuis app.js)

**Files:**
- Create: `src/services/htmlCache.js`
- Modify: `app.js:201-211`

- [ ] **Step 1: Créer le module**

```js
'use strict';

// Cache mémoire du HTML servi par le fallback SPA d'app.js. Extrait dans un
// module pour que le service de re-prerender puisse invalider une entrée
// quand il réécrit un fichier dans dist/ (sinon Express servirait l'ancienne
// version jusqu'au prochain redémarrage Passenger).

const fs = require('fs');

const cache = new Map();

function readHtmlCached(file) {
  let html = cache.get(file);
  if (html === undefined) {
    html = fs.readFileSync(file, 'utf8');
    cache.set(file, html);
  }
  return html;
}

function invalidate(file) {
  cache.delete(file);
}

module.exports = { readHtmlCached, invalidate };
```

- [ ] **Step 2: Remplacer le cache inline d'app.js**

Dans `app.js`, supprimer le bloc lignes 201–211 :

```js
// Cache raw HTML in memory so each request doesn't re-read from disk.
// Process restart (which happens on every deploy via Plesk Passenger) clears it.
const HTML_CACHE = new Map();
function readHtmlCached(file) {
  let html = HTML_CACHE.get(file);
  if (html === undefined) {
    html = fs.readFileSync(file, 'utf8');
    HTML_CACHE.set(file, html);
  }
  return html;
}
```

et le remplacer par :

```js
const { readHtmlCached } = require('./src/services/htmlCache');
```

(`serveSpa` continue d'appeler `readHtmlCached(file)` — aucune autre modification.)

- [ ] **Step 3: Vérifier**

Run: `node --check app.js && node --check src/services/htmlCache.js && echo OK`
Expected: `OK`

Run: `npm run dev` (laisser tourner 3 s, Ctrl-C) — le serveur démarre sans erreur et `curl -s localhost:3000/ | head -1` renvoie du HTML.

- [ ] **Step 4: Commit**

```bash
git add src/services/htmlCache.js app.js
git commit -m "refactor(app): extrait le cache HTML dans un module invalidable"
```

---

### Task 4: Lib prerender partagée + file de régénération

**Files:**
- Create: `src/services/prerenderLib.js`
- Create: `src/services/prerenderService.js`

- [ ] **Step 1: Créer la lib partagée prerenderLib.js**

```js
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
      const p = decodeURIComponent((req.url || '/').split('?')[0]);
      if (p.startsWith('/api/')) return handleApi(p, res);
      // Pas d'extension → shell SPA, le routeur client rend la route demandée.
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
    html = html.replace('</head>', `<script>window.__VOLTEA_DATA__ = ${json}</script></head>`);
  }
  return html;
}

async function writeAtomic(outPath, html) {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  const tmp = `${outPath}.tmp`;
  await fs.writeFile(tmp, html);
  await fs.rename(tmp, outPath);
  htmlCache.invalidate(outPath);
}

async function prerenderRoutes(routes, { includeNotFound = false, log = console } = {}) {
  const shellHtml = await loadShell();
  const server = await startServer(shellHtml);
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const chromium = getChromium();
  const browser = await chromium.launch();
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

  const failures = [];
  let okCount = 0;
  try {
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
        await fs.writeFile(path.join(DIST_DIR, '__notfound.html'), html);
        log.log('✓ /__not-found → __notfound.html');
      } catch (err) {
        log.error(`[prerender] /__not-found failed: ${err.message}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    await new Promise((r) => server.close(r));
  }

  return { okCount, failures };
}

async function removePrerenderedRoute(route) {
  const outPath = routeToOutPath(route);
  htmlCache.invalidate(outPath);
  await fs.rm(outPath, { force: true });
  await fs.rmdir(path.dirname(outPath)).catch(() => {}); // best-effort si vide
}

module.exports = { prerenderRoutes, removePrerenderedRoute, routeToOutPath, DIST_DIR };
```

- [ ] **Step 2: Créer prerenderService.js**

```js
'use strict';

// File de régénération du HTML prérendu, déclenchée par providerController
// après chaque modification dans le dashboard. Une page à la fois ; un échec
// n'est jamais bloquant pour l'enregistrement (dégradation gracieuse : la
// page reste servie via le shell SPA + API, seul le HTML statique date).

const prerenderLib = require('./prerenderLib');

const pending = [];
let running = false;
let lastRun = null; // { state: 'done'|'error', routes, error, finishedAt }

function queueRegeneration(routes) {
  for (const route of routes) {
    if (!pending.includes(route)) pending.push(route);
  }
  processQueue();
}

async function processQueue() {
  if (running || pending.length === 0) return;
  running = true;
  const batch = pending.splice(0, pending.length);
  try {
    const { failures } = await prerenderLib.prerenderRoutes(batch);
    lastRun = {
      state: failures.length > 0 ? 'error' : 'done',
      routes: batch,
      error: failures.length > 0
        ? failures.map((f) => `${f.route}: ${f.error}`).join(' ; ')
        : null,
      finishedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('[prerender] régénération échouée:', err.message);
    lastRun = { state: 'error', routes: batch, error: err.message, finishedAt: new Date().toISOString() };
  } finally {
    running = false;
    if (pending.length > 0) processQueue();
  }
}

function removeRoute(route) {
  prerenderLib.removePrerenderedRoute(route).catch((err) => {
    console.error(`[prerender] suppression ${route} échouée:`, err.message);
  });
}

function getStatus() {
  return { running, pending: [...pending], lastRun };
}

module.exports = { queueRegeneration, removeRoute, getStatus };
```

- [ ] **Step 3: Vérifier la syntaxe et la résolution Playwright**

Run: `node --check src/services/prerenderLib.js && node --check src/services/prerenderService.js && node -e "require('/Users/seraphin/Projects/voltea-v3/client/node_modules/playwright'); console.log('playwright OK')"`
Expected: `playwright OK` (si `client/node_modules` manque : `cd client && npm install`)

- [ ] **Step 4: Commit**

```bash
git add src/services/prerenderLib.js src/services/prerenderService.js
git commit -m "feat(prerender): lib partagée + file de régénération à la demande"
```

---

### Task 5: Contrôleur providers + routes API + auto-migrate

**Files:**
- Create: `src/controllers/providerController.js`
- Modify: `src/routes/api.js`
- Modify: `src/routes/admin.js`
- Modify: `app.js:288-307` (bloc auto-migrate)

- [ ] **Step 1: Créer le contrôleur**

```js
'use strict';

const { body, validationResult } = require('express-validator');
const providerModel = require('../models/providerModel');
const prerenderService = require('../services/prerenderService');

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200);
}

async function uniqueSlug(base, excludeId = null) {
  let slug = base || 'fournisseur';
  let counter = 2;
  while (await providerModel.slugExists(slug, excludeId)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  return slug;
}

const providerValidation = [
  body('name').trim().notEmpty().withMessage('Le nom est requis').isLength({ max: 200 }).withMessage('200 caractères maximum'),
  body('slug').optional({ checkFalsy: true }).trim().matches(/^[a-z0-9-]+$/).withMessage('Slug invalide : minuscules, chiffres et tirets uniquement').isLength({ max: 200 }),
  body('fullName').optional({ checkFalsy: true }).trim().isLength({ max: 255 }).withMessage('255 caractères maximum'),
  body('logoUrl').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('tagline').optional({ checkFalsy: true }).trim().isLength({ max: 500 }).withMessage('500 caractères maximum'),
  body('category').optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage('100 caractères maximum'),
  body('description').optional().isArray().withMessage('Format invalide'),
  body('offers').optional().isArray().withMessage('Format invalide'),
  body('pros').optional().isArray().withMessage('Format invalide'),
  body('cons').optional().isArray().withMessage('Format invalide'),
  body('profiles').optional().isArray().withMessage('Format invalide'),
  body('published').optional().isBoolean().withMessage('Format invalide'),
];

function normalizeBody(raw) {
  return {
    name: raw.name,
    fullName: raw.fullName || '',
    logoUrl: raw.logoUrl || '',
    tagline: raw.tagline || '',
    category: raw.category || '',
    description: providerModel.cleanStringList(raw.description),
    offers: providerModel.cleanOffers(raw.offers),
    pros: providerModel.cleanStringList(raw.pros),
    cons: providerModel.cleanStringList(raw.cons),
    profiles: providerModel.cleanStringList(raw.profiles),
    published: Boolean(raw.published),
  };
}

// Fire-and-forget : la régénération SEO ne doit jamais faire échouer la requête.
function regenerate(routes) {
  try { prerenderService.queueRegeneration(routes); } catch (err) {
    console.error('[prerender] queue échouée:', err.message);
  }
}

function removePrerendered(route) {
  try { prerenderService.removeRoute(route); } catch (err) {
    console.error('[prerender] suppression échouée:', err.message);
  }
}

// Public
async function getProviders(req, res) {
  try {
    res.json({ providers: await providerModel.getPublishedProviders() });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function getProviderBySlug(req, res) {
  try {
    const provider = await providerModel.getPublishedProviderBySlug(req.params.slug);
    if (!provider) return res.status(404).json({ error: 'Fournisseur introuvable' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Admin
async function getAdminProviders(req, res) {
  try {
    res.json({ providers: await providerModel.getAllProviders() });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function createProvider(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const data = normalizeBody(req.body);
    const base = req.body.slug ? slugify(req.body.slug) : slugify(data.name);
    data.slug = await uniqueSlug(base);
    const provider = await providerModel.createProvider(data);
    if (provider.published) {
      regenerate([`/guide-energie/${provider.slug}`, '/guide-energie']);
    }
    res.status(201).json(provider);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function updateProvider(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  try {
    const before = await providerModel.getProviderById(req.params.id);
    if (!before) return res.status(404).json({ error: 'Fournisseur introuvable' });

    const data = normalizeBody(req.body);
    const base = req.body.slug ? slugify(req.body.slug) : slugify(data.name);
    data.slug = base === before.slug ? before.slug : await uniqueSlug(base, before.id);

    const after = await providerModel.updateProvider(before.id, data);

    // L'ancienne fiche prérendue meurt si dépubliée ou si le slug change.
    if (before.published && (!after.published || before.slug !== after.slug)) {
      removePrerendered(`/guide-energie/${before.slug}`);
    }
    if (after.published) {
      regenerate([`/guide-energie/${after.slug}`, '/guide-energie']);
    } else if (before.published) {
      regenerate(['/guide-energie']);
    }
    res.json(after);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function deleteProvider(req, res) {
  try {
    const before = await providerModel.getProviderById(req.params.id);
    if (!before) return res.status(404).json({ error: 'Fournisseur introuvable' });
    await providerModel.deleteProvider(before.id);
    if (before.published) {
      removePrerendered(`/guide-energie/${before.slug}`);
      regenerate(['/guide-energie']);
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function togglePublished(req, res) {
  try {
    const after = await providerModel.togglePublished(req.params.id);
    if (!after) return res.status(404).json({ error: 'Fournisseur introuvable' });
    if (after.published) {
      regenerate([`/guide-energie/${after.slug}`, '/guide-energie']);
    } else {
      removePrerendered(`/guide-energie/${after.slug}`);
      regenerate(['/guide-energie']);
    }
    res.json(after);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

async function reorderProviders(req, res) {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every((n) => Number.isInteger(n))) {
    return res.status(422).json({ errors: [{ path: 'ids', msg: "Liste d'identifiants invalide" }] });
  }
  try {
    await providerModel.reorderProviders(ids);
    regenerate(['/guide-energie']);
    res.json({ providers: await providerModel.getAllProviders() });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  providerValidation,
  getProviders,
  getProviderBySlug,
  getAdminProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  togglePublished,
  reorderProviders,
};
```

- [ ] **Step 2: Routes publiques dans src/routes/api.js**

Après le bloc `// Reviews (public)` (ligne 24), ajouter :

```js
// Providers (public)
router.get('/providers', apiLimiter, providerController.getProviders);
router.get('/providers/:slug', apiLimiter, providerController.getProviderBySlug);
```

et en tête de fichier, après la ligne 10 (`const reviewController = ...`) :

```js
const providerController = require('../controllers/providerController');
```

- [ ] **Step 3: Routes admin dans src/routes/admin.js**

Après le bloc `// Reviews` (ligne 28), ajouter :

```js
// Providers
router.get('/providers', providerController.getAdminProviders);
router.post('/providers', providerController.providerValidation, providerController.createProvider);
router.patch('/providers/reorder', providerController.reorderProviders);
router.put('/providers/:id', providerController.providerValidation, providerController.updateProvider);
router.delete('/providers/:id', providerController.deleteProvider);
router.patch('/providers/:id/toggle', providerController.togglePublished);

// Statut de la file de régénération prerender (bandeau admin)
router.get('/prerender/status', (req, res) => res.json(prerenderService.getStatus()));
```

et en tête de fichier, après la ligne 11 (`const reviewController = ...`) :

```js
const providerController = require('../controllers/providerController');
const prerenderService = require('../services/prerenderService');
```

(`/providers/reorder` est déclaré avant `/providers/:id` par prudence de matching.)

- [ ] **Step 4: Auto-migrate dans app.js**

Dans le bloc IIFE `// Auto-migrate: create missing tables` (app.js lignes 288–307), après le `try/catch` de la table `reviews` et avant la fin de l'IIFE, ajouter :

```js
    try {
      await require('./src/models/providerModel').ensureProvidersTable();
    } catch (err) {
      console.error('[Voltea] Auto-migrate providers failed:', err.message);
    }
```

- [ ] **Step 5: Vérifier les endpoints**

```bash
node --check src/controllers/providerController.js && node --check src/routes/api.js && node --check src/routes/admin.js && node --check app.js && echo SYNTAX-OK
```
Expected: `SYNTAX-OK`

Démarrer `npm run dev` dans un terminal, puis :

```bash
curl -s localhost:3000/api/providers | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{const j=JSON.parse(d);console.log(j.providers.length, j.providers[0].slug, j.providers[0].fullName)})"
```
Expected: `8 edf Électricité de France`

```bash
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/api/providers/inexistant
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/api/admin/providers
```
Expected: `404` puis `401` (admin protégé sans cookie).

Test CRUD authentifié (adapter email/mot de passe admin locaux) :

```bash
curl -s -c /tmp/voltea-cookies.txt -H 'Content-Type: application/json' \
  -d '{"email":"<ADMIN_EMAIL>","password":"<ADMIN_PASSWORD>"}' localhost:3000/api/auth/login
curl -s -b /tmp/voltea-cookies.txt -H 'Content-Type: application/json' \
  -d '{"name":"Test Fournisseur","tagline":"Tagline de test","published":false,"description":["Un paragraphe."],"pros":["Un point fort"],"cons":[],"offers":[{"label":"Électricité","description":"Desc"}],"profiles":["TPE"]}' \
  localhost:3000/api/admin/providers
```
Expected: JSON 201 avec `"slug":"test-fournisseur"`, `"published":false`. Puis suppression :

```bash
# remplacer <ID> par l'id renvoyé ci-dessus
curl -s -b /tmp/voltea-cookies.txt -X DELETE localhost:3000/api/admin/providers/<ID>
curl -s -b /tmp/voltea-cookies.txt localhost:3000/api/admin/prerender/status
```
Expected: `{"ok":true}` puis `{"running":false,"pending":[],"lastRun":null}` (aucune régénération : le test était un brouillon, et dist/ peut ne pas exister en dev — c'est attendu).

- [ ] **Step 6: Commit**

```bash
git add src/controllers/providerController.js src/routes/api.js src/routes/admin.js app.js
git commit -m "feat(providers): API publique et CRUD admin avec triggers de régénération"
```

---

### Task 6: Prerender de build branché sur la lib partagée + BDD

À ce stade, les pages publiques utilisent encore les données dures du bundle : le nouveau prerender les capture telles quelles (pas encore d'injection `__VOLTEA_DATA__`). La migration des pages vers l'API arrive aux Tasks 7–8 ; le build reste correct à chaque commit.

**Files:**
- Modify: `client/scripts/prerender.mjs` (réécriture complète)

- [ ] **Step 1: Réécrire prerender.mjs**

```js
#!/usr/bin/env node
// Prerender de build. Après `vite build`, crawle chaque route publique avec
// la lib partagée (src/services/prerenderLib.js) et écrit le HTML rendu dans
// dist/<route>/index.html. Les routes fournisseurs viennent de MySQL ; si la
// BDD est injoignable, on prérend le reste et on avertit (la régénération à
// la demande comblera après le premier enregistrement admin).

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

require('dotenv').config({ path: path.join(PROJECT_ROOT, '.env') });

const { STATIC_ROUTES } = require(path.join(PROJECT_ROOT, 'src', 'config', 'routes.js'));
const prerenderLib = require(path.join(PROJECT_ROOT, 'src', 'services', 'prerenderLib.js'));

async function main() {
  const routes = STATIC_ROUTES.map((r) => r.path);

  let dbOk = false;
  try {
    const providerModel = require(path.join(PROJECT_ROOT, 'src', 'models', 'providerModel.js'));
    await providerModel.ensureProvidersTable();
    const slugs = await providerModel.getPublishedSlugs();
    routes.push(...slugs.map((slug) => `/guide-energie/${slug}`));
    dbOk = true;
  } catch (err) {
    console.warn('[prerender] BDD injoignable — fiches fournisseurs non prérendues :', err.message);
  }

  const { okCount, failures } = await prerenderLib.prerenderRoutes(routes, { includeNotFound: true });
  console.log(`\n[prerender] ${okCount}/${routes.length} routes prerendered${dbOk ? '' : ' (sans fournisseurs)'}`);

  // process.exit explicite : le pool MySQL garde sinon le process vivant.
  process.exit(failures.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('[prerender] crashed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Vérifier le build complet**

```bash
cd client && npm run build
```
Expected: log `✓` pour chaque route statique **et** chaque `/guide-energie/<slug>` (8 fiches), `[prerender] 18/18 routes prerendered`, exit 0.

```bash
grep -o "Présentation" client/dist/guide-energie/edf/index.html | head -1
grep -c "__VOLTEA_DATA__" client/dist/guide-energie/edf/index.html || echo "0 (normal : injection à partir de la Task 8)"
```
Expected: `Présentation` (contenu complet présent) ; `__VOLTEA_DATA__` absent à ce stade — les pages n'appellent pas encore l'API, c'est attendu.

- [ ] **Step 3: Commit**

```bash
git add client/scripts/prerender.mjs
git commit -m "feat(prerender): build branché sur la lib partagée, slugs fournisseurs depuis MySQL"
```

---

### Task 7: Lib client providersApi + refonte GuideIndex

**Files:**
- Create: `client/src/lib/providersApi.js`
- Modify: `client/src/pages/GuideIndex.jsx`
- Modify (si proxy absent): `client/vite.config.js`

- [ ] **Step 1: Créer la lib client**

```js
// Accès aux données fournisseurs côté client.
//
// Sur une page prérendue, src/services/prerenderLib.js a sérialisé les données
// dans window.__VOLTEA_DATA__ (script injecté avant le bundle) : le premier
// rendu React est alors synchrone et identique au HTML prérendu — zéro flash,
// zéro warning d'hydratation. En navigation SPA, fetch classique vers l'API.
// Les fetchs republient dans window.__VOLTEA_DATA__ : c'est ce que le
// prerender lit pour fabriquer l'injection.

function publishBootstrap(patch) {
  if (typeof window === 'undefined') return;
  window.__VOLTEA_DATA__ = { ...(window.__VOLTEA_DATA__ || {}), ...patch };
}

export function getBootstrapProviders() {
  if (typeof window === 'undefined') return null;
  return window.__VOLTEA_DATA__?.providers || null;
}

export function getBootstrapProvider(slug) {
  if (typeof window === 'undefined') return null;
  const provider = window.__VOLTEA_DATA__?.provider;
  return provider && provider.slug === slug ? provider : null;
}

export async function fetchProviders() {
  const res = await fetch('/api/providers');
  if (!res.ok) throw new Error('Erreur de chargement des fournisseurs');
  const data = await res.json();
  publishBootstrap({ providers: data.providers });
  return data.providers;
}

// Renvoie null si le fournisseur n'existe pas ou n'est pas publié (404 API).
export async function fetchProvider(slug) {
  const res = await fetch(`/api/providers/${encodeURIComponent(slug)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Erreur de chargement du fournisseur');
  const provider = await res.json();
  publishBootstrap({ provider });
  return provider;
}
```

- [ ] **Step 2: Refondre GuideIndex.jsx**

Remplacements dans `client/src/pages/GuideIndex.jsx` :

Ligne 1 et ligne 9 (imports) :

```js
import React, { useEffect, useState } from 'react';
// ...
import { getBootstrapProviders, fetchProviders } from '../lib/providersApi.js';
```

(supprimer `import { providers } from '../data/providersData.js';`)

Début du composant (ligne 17) :

```jsx
export default function GuideIndex() {
  const [providers, setProviders] = useState(() => getBootstrapProviders());
  const [error, setError] = useState(false);

  useEffect(() => {
    if (providers) return; // déjà hydraté depuis le HTML prérendu
    let cancelled = false;
    fetchProviders()
      .then((list) => { if (!cancelled) setProviders(list); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```

Section grille (lignes 53–95) — remplacer le contenu du `<div className="container">` par :

```jsx
        <div className="container">
          {error ? (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '3rem 0' }}>
              Impossible de charger les fournisseurs. Veuillez réessayer dans quelques instants.
            </p>
          ) : !providers ? (
            <div data-prerender-pending style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : (
            <div className="features-grid">
              {providers.map((provider, i) => {
                /* …grille existante inchangée (lignes 57–92 actuelles)… */
              })}
            </div>
          )}
        </div>
```

Le contenu de `providers.map` reste strictement identique à l'existant (ProviderLogo, badge catégorie, tagline, « Voir la fiche »). `data-prerender-pending` est le marqueur attendu par `prerenderLib.snapshot()` : le prerender ne snapshotte jamais le squelette.

- [ ] **Step 3: Vérifier en dev**

`npm run dev` (racine) + `cd client && npm run dev`, ouvrir `http://localhost:5173/guide-energie`.
Expected: la grille des 8 fournisseurs s'affiche (avec un bref spinner), visuellement identique à avant. Console : aucun warning.
Note : vérifier que `client/vite.config.js` proxifie `/api` vers `localhost:3000` ; sinon l'ajouter :

```js
  server: {
    proxy: { '/api': 'http://localhost:3000' },
  },
```

- [ ] **Step 4: Commit**

```bash
git add client/src/lib/providersApi.js client/src/pages/GuideIndex.jsx client/vite.config.js
git commit -m "feat(guide): la liste des fournisseurs lit l'API avec hydratation bootstrap"
```

---

### Task 8: Refonte ProviderPage (API + NotFound) + suppression des données dures

**Files:**
- Modify: `client/src/pages/ProviderPage.jsx`
- Delete: `client/src/data/providersData.js`

- [ ] **Step 1: Refondre le haut de ProviderPage.jsx**

Remplacer les lignes 1–17 par :

```jsx
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../components/SEO.jsx';
import ScrollReveal from '../components/ScrollReveal.jsx';
import Breadcrumb from '../components/Breadcrumb.jsx';
import ProviderLogo from '../components/ProviderLogo.jsx';
import NotFound from './NotFound.jsx';
import { getBootstrapProvider, fetchProvider } from '../lib/providersApi.js';

export default function ProviderPage() {
  const { slug } = useParams();
  const [provider, setProvider] = useState(() => getBootstrapProvider(slug));
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (provider && provider.slug === slug) return;
    setProvider(null);
    setNotFound(false);
    let cancelled = false;
    fetchProvider(slug)
      .then((p) => {
        if (cancelled) return;
        if (p) setProvider(p);
        else setNotFound(true);
      })
      .catch(() => { if (!cancelled) setNotFound(true); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (notFound) {
    return <NotFound />;
  }

  if (!provider) {
    return (
      <>
        <Header />
        <div
          data-prerender-pending
          style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 'var(--header-height)' }}
        >
          <div className="spinner" />
        </div>
        <Footer />
      </>
    );
  }
```

La suite (calcul de `metaDescription` + JSX des sections) reste inchangée, **sauf** : protéger les sections optionnelles pour les fiches partiellement remplies créées dans l'admin —

- Section « Présentation » (lignes 88–102) : envelopper dans `{provider.description.length > 0 && ( ... )}`
- Section « Offres proposées » (lignes 104–126) : envelopper dans `{provider.offers.length > 0 && ( ... )}`
- Colonne « Points forts » : envelopper le `<ScrollReveal>` dans `{provider.pros.length > 0 && ( ... )}` ; idem « Points de vigilance » avec `provider.cons.length > 0`
- Section « Pour quel profil ? » (lignes 167–184) : envelopper dans `{provider.profiles.length > 0 && ( ... )}`

- [ ] **Step 2: Supprimer providersData.js et vérifier qu'aucun import ne subsiste**

```bash
rm client/src/data/providersData.js
grep -rn "providersData" client/src/ src/ client/scripts/ || echo "AUCUNE-REFERENCE"
```
Expected: `AUCUNE-REFERENCE`

- [ ] **Step 3: Vérifier en dev**

Avec les deux serveurs dev lancés, ouvrir `http://localhost:5173/guide-energie/edf` : fiche complète identique à avant. Ouvrir `http://localhost:5173/guide-energie/nimporte-quoi` : page 404 « Page introuvable ». Console : aucune erreur.

- [ ] **Step 4: Rebuild et vérifier l'injection des données**

```bash
cd client && npm run build && cd ..
grep -c "__VOLTEA_DATA__" client/dist/guide-energie/edf/index.html
grep -c "__VOLTEA_DATA__" client/dist/guide-energie/index.html
grep -o "Présentation" client/dist/guide-energie/edf/index.html | head -1
```
Expected: `1`, `1`, `Présentation` — le HTML des fiches contient le contenu complet **et** les données injectées pour l'hydratation.

- [ ] **Step 5: Commit**

```bash
git add -A client/src/pages/ProviderPage.jsx client/src/data/providersData.js
git commit -m "feat(guide): fiches fournisseurs depuis l'API, 404 propre, données dures supprimées"
```

---

### Task 9: Routing Express dynamique + sitemap BDD + nettoyage routes.js

**Files:**
- Modify: `src/config/routes.js`
- Modify: `app.js:237-272` (fallback SPA)
- Modify: `src/routes/sitemap.js`

- [ ] **Step 1: Nettoyer src/config/routes.js**

Supprimer les lignes 19–34 (`PROVIDER_SLUGS` et `PROVIDER_ROUTES`) et adapter le reste :

```js
'use strict';

// Authoritative list of public routes. Used by sitemap + 404 resolver.
// Keep in sync with client/src/App.jsx <Routes>.
// Les fiches fournisseurs (/guide-energie/:slug) et les articles
// (/actualites/:slug) sont dynamiques : résolus en BDD par app.js, ajoutés au
// sitemap par src/routes/sitemap.js.

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/a-propos', priority: '0.8', changefreq: 'monthly' },
  { path: '/services', priority: '0.9', changefreq: 'monthly' },
  { path: '/marche-energie', priority: '0.7', changefreq: 'weekly' },
  { path: '/guide-energie', priority: '0.8', changefreq: 'monthly' },
  { path: '/actualites', priority: '0.8', changefreq: 'daily' },
  { path: '/faq', priority: '0.7', changefreq: 'monthly' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/mentions-legales', priority: '0.3', changefreq: 'yearly', noindex: true },
  { path: '/politique-de-confidentialite', priority: '0.3', changefreq: 'yearly', noindex: true },
];

// Admin routes — excluded from sitemap, but valid URLs so the SPA should serve them.
const ADMIN_PREFIXES = [
  '/admin',
];

const INDEXABLE_ROUTES = STATIC_ROUTES.filter((r) => !r.noindex);
const SITEMAP_ROUTES = STATIC_ROUTES.filter((r) => !r.noindex);

// Known-valid exact paths (no dynamic segments)
const KNOWN_PATHS = new Set(STATIC_ROUTES.map((r) => r.path));

// Dynamic prefixes — caller must verify the slug against the DB
const DYNAMIC_PREFIXES = [
  '/actualites/', // /actualites/:slug
  '/guide-energie/', // /guide-energie/:slug
];

module.exports = {
  STATIC_ROUTES,
  SITEMAP_ROUTES,
  INDEXABLE_ROUTES,
  ADMIN_PREFIXES,
  KNOWN_PATHS,
  DYNAMIC_PREFIXES,
};
```

Vérifier qu'aucun consommateur n'importe les symboles supprimés :

```bash
grep -rn "PROVIDER_SLUGS\|PROVIDER_ROUTES" src/ app.js client/scripts/ || echo "AUCUNE-REFERENCE"
```
Expected: `AUCUNE-REFERENCE`

- [ ] **Step 2: Route dynamique fournisseur dans app.js**

Dans le handler `app.get('*', ...)`, juste **après** le bloc `articleMatch` (lignes 255–268) et avant le 404 final, ajouter :

```js
  // Dynamic: /guide-energie/:slug — fiche publiée → HTML prérendu (ou shell),
  // inconnue/masquée → 404. Même pattern que les articles.
  const providerMatch = urlPath.match(/^\/guide-energie\/([a-z0-9-]+)\/?$/i);
  if (providerMatch) {
    const pool = getPool();
    if (!pool) return serveSpa(res, 200, fallbackShell);
    try {
      const [rows] = await pool.execute(
        'SELECT 1 FROM providers WHERE slug = ? AND published = 1 LIMIT 1',
        [providerMatch[1]]
      );
      if (rows.length === 0) return serveSpa(res, 404, fallback404);
      return serveSpa(res, 200, prerenderedFile(urlPath) || fallbackShell);
    } catch (err) {
      return serveSpa(res, 200, fallbackShell);
    }
  }
```

- [ ] **Step 3: Fournisseurs dans le sitemap**

Dans `src/routes/sitemap.js`, après le bloc articles (lignes 38–49), ajouter :

```js
  // Fiches fournisseurs publiées — même best-effort que les articles.
  try {
    const [providers] = await pool.execute(
      'SELECT slug, updated_at FROM providers WHERE published = 1 ORDER BY sort_order ASC'
    );
    for (const provider of providers) {
      const lastmod = provider.updated_at
        ? new Date(provider.updated_at).toISOString().split('T')[0]
        : BOOT_DATE;
      entries.push(urlEntry(`${BASE_URL}/guide-energie/${provider.slug}`, lastmod));
    }
  } catch (err) {
    console.error('[sitemap] providers fetch failed, skipping:', err.message);
  }
```

- [ ] **Step 4: Vérifier**

```bash
node --check src/config/routes.js && node --check app.js && node --check src/routes/sitemap.js && echo SYNTAX-OK
```
Expected: `SYNTAX-OK`

Avec `npm run dev` :

```bash
curl -s localhost:3000/sitemap.xml | grep -c "guide-energie/"
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/guide-energie/edf
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/guide-energie/inexistant
curl -s localhost:3000/guide-energie/edf | grep -c "Présentation"
```
Expected: `8`, `200`, `404`, `1` (le HTML prérendu du build de la Task 8 est servi).

- [ ] **Step 5: Commit**

```bash
git add src/config/routes.js app.js src/routes/sitemap.js
git commit -m "feat(routing): fiches fournisseurs dynamiques en BDD (Express, sitemap, 404)"
```

---

### Task 10: Page admin liste des fournisseurs

**Files:**
- Create: `client/src/pages/admin/Providers.jsx`
- Modify: `client/src/pages/admin/Dashboard.jsx:29-48` (sidebar)
- Modify: `client/src/App.jsx`

- [ ] **Step 1: Créer Providers.jsx**

```jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App.jsx';
import { AdminSidebar } from './Dashboard.jsx';
import SEO from '../../components/SEO.jsx';

// Bandeau d'état de la régénération SEO (file src/services/prerenderService.js).
function PrerenderBanner() {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const res = await fetch('/api/admin/prerender/status', { credentials: 'include' });
        if (res.ok && active) setStatus(await res.json());
      } catch { /* silencieux : le bandeau est informatif */ }
    }
    poll();
    const timer = setInterval(poll, 3000);
    return () => { active = false; clearInterval(timer); };
  }, []);

  if (!status) return null;
  if (status.running || (status.pending && status.pending.length > 0)) {
    return (
      <div className="alert" style={{ background: 'rgba(20,110,243,0.08)', border: '1px solid rgba(20,110,243,0.3)', color: 'var(--color-primary)' }}>
        ⏳ Régénération des pages en cours… Les modifications seront visibles par Google dans quelques instants.
      </div>
    );
  }
  if (status.lastRun?.state === 'error') {
    return (
      <div className="alert alert-error">
        ⚠️ La régénération SEO a échoué. Les fiches restent visibles sur le site ; réenregistrez pour réessayer. Détail : {status.lastRun.error}
      </div>
    );
  }
  if (status.lastRun?.state === 'done') {
    return (
      <div className="alert" style={{ background: 'rgba(39,174,96,0.08)', border: '1px solid rgba(39,174,96,0.3)', color: '#27ae60' }}>
        ✓ Pages à jour ({status.lastRun.routes.join(', ')})
      </div>
    );
  }
  return null;
}

export default function Providers() {
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  async function loadProviders() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/providers', { credentials: 'include' });
      if (res.status === 401) {
        setIsAuthenticated(false);
        navigate('/admin/connexion');
        return;
      }
      const data = await res.json();
      setProviders(data.providers || []);
    } catch {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProviders(); }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setIsAuthenticated(false);
    navigate('/admin/connexion');
  }

  async function handleToggle(id) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/providers/${id}/toggle`, { method: 'PATCH', credentials: 'include' });
      const updated = await res.json();
      setProviders((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch {
      alert('Erreur lors du changement de statut');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Supprimer définitivement la fiche "${name}" ? Sa page ne sera plus accessible sur le site.`)) return;
    setActionLoading(id);
    try {
      await fetch(`/api/admin/providers/${id}`, { method: 'DELETE', credentials: 'include' });
      setProviders((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Erreur lors de la suppression');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleMove(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= providers.length) return;
    const next = [...providers];
    [next[index], next[target]] = [next[target], next[index]];
    setProviders(next);
    try {
      const res = await fetch('/api/admin/providers/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ids: next.map((p) => p.id) }),
      });
      if (!res.ok) throw new Error();
    } catch {
      alert("Erreur lors du réordonnancement");
      loadProviders();
    }
  }

  const publishedCount = providers.filter((p) => p.published).length;

  return (
    <>
      <SEO title="Fournisseurs | Admin Voltea" noindex />
      <div className="admin-layout">
        <AdminSidebar onLogout={handleLogout} />
        <main className="admin-main">
          <div className="admin-topbar">
            <h1>Fournisseurs</h1>
            <Link to="/admin/fournisseurs/nouveau" className="btn btn-primary btn-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Nouveau fournisseur
            </Link>
          </div>

          <div className="admin-content">
            <PrerenderBanner />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div className="admin-stat">
                <div className="admin-stat-number">{providers.length}</div>
                <div className="admin-stat-label">Fournisseurs au total</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-number">{publishedCount}</div>
                <div className="admin-stat-label">Publiés</div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-number">{providers.length - publishedCount}</div>
                <div className="admin-stat-label">Masqués</div>
              </div>
            </div>

            <div className="admin-card">
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Tous les fournisseurs</h2>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </div>
              ) : providers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  <p>Aucun fournisseur. <Link to="/admin/fournisseurs/nouveau" style={{ color: 'var(--color-primary)' }}>Créez le premier !</Link></p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Ordre</th>
                        <th>Fournisseur</th>
                        <th>Catégorie</th>
                        <th>Statut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {providers.map((provider, index) => (
                        <tr key={provider.id}>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <button onClick={() => handleMove(index, -1)} disabled={index === 0} className="btn btn-ghost btn-sm" style={{ padding: '0.2rem 0.45rem' }} title="Monter">↑</button>
                            <button onClick={() => handleMove(index, 1)} disabled={index === providers.length - 1} className="btn btn-ghost btn-sm" style={{ padding: '0.2rem 0.45rem' }} title="Descendre">↓</button>
                          </td>
                          <td style={{ maxWidth: '280px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              {provider.logoUrl ? (
                                <img src={provider.logoUrl} alt="" style={{ height: '28px', maxWidth: '70px', objectFit: 'contain', background: '#fff', borderRadius: '4px', padding: '2px' }} />
                              ) : (
                                <span style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--color-primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                                  {provider.name.slice(0, 2).toUpperCase()}
                                </span>
                              )}
                              <div>
                                <p style={{ fontWeight: 600, color: 'white', margin: 0 }}>{provider.name}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>/guide-energie/{provider.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td>{provider.category || '—'}</td>
                          <td>
                            <button
                              onClick={() => handleToggle(provider.id)}
                              disabled={actionLoading === provider.id}
                              className={`badge ${provider.published ? 'badge-green' : 'badge-gray'}`}
                              style={{ cursor: 'pointer', border: 'none', background: 'inherit' }}
                              title="Cliquer pour changer le statut"
                            >
                              {provider.published ? 'Publié' : 'Masqué'}
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap' }}>
                              {provider.published && (
                                <a href={`/guide-energie/${provider.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }} title="Voir la fiche">
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                </a>
                              )}
                              <Link to={`/admin/fournisseurs/${provider.id}/modifier`} className="btn btn-outline btn-sm" style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                Modifier
                              </Link>
                              <button
                                onClick={() => handleDelete(provider.id, provider.name)}
                                disabled={actionLoading === provider.id}
                                className="btn btn-sm"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Ajouter l'entrée sidebar dans Dashboard.jsx**

Dans le tableau `navItems` (Dashboard.jsx ligne 7), insérer entre « Nouvel article » et « Avis clients » :

```js
    {
      to: '/admin/fournisseurs',
      label: 'Fournisseurs',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      ),
    },
```

- [ ] **Step 3: Route admin dans App.jsx**

Ajouter l'import (après la ligne 22 `import Reviews ...`) :

```js
import Providers from './pages/admin/Providers.jsx';
```

Après la route `/admin/avis` (App.jsx lignes 202–209), ajouter :

```jsx
            <Route
              path="/admin/fournisseurs"
              element={
                <ProtectedRoute>
                  <Providers />
                </ProtectedRoute>
              }
            />
```

(L'éditeur et ses routes arrivent à la Task 11 — ne pas importer `ProviderEditor` ici, le fichier n'existe pas encore.)

- [ ] **Step 4: Vérifier en dev**

Serveurs dev lancés, se connecter sur `http://localhost:5173/admin/connexion`, ouvrir « Fournisseurs » dans la sidebar.
Expected: tableau des 8 fournisseurs avec logos, ordre modifiable (les flèches réordonnent et l'ordre persiste après F5), toggle Publié/Masqué fonctionnel, suppression avec confirmation. Le bandeau de régénération apparaît après un toggle (« en cours » puis « à jour » si `client/dist` existe ; sinon erreur affichée = dégradation gracieuse attendue, vérifier que le toggle a fonctionné malgré tout). Après un toggle « Masqué » sur un fournisseur, vérifier `curl -s localhost:3000/api/providers` : il n'y figure plus ; re-toggle pour le republier.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/admin/Providers.jsx client/src/pages/admin/Dashboard.jsx client/src/App.jsx
git commit -m "feat(admin): page de gestion des fournisseurs (liste, ordre, statut, suppression)"
```

---

### Task 11: Éditeur admin de fournisseur

**Files:**
- Create: `client/src/pages/admin/ProviderEditor.jsx`
- Modify: `client/src/App.jsx`

- [ ] **Step 1: Créer ProviderEditor.jsx**

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../../App.jsx';
import { AdminSidebar } from './Dashboard.jsx';
import SEO from '../../components/SEO.jsx';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200);
}

const CATEGORIES = ['Historique', 'Alternatif', 'Vert & Indépendant'];
const KNOWN_PROFILES = ['TPE', 'PME', 'ETI', 'Industrie', 'Multi-sites', 'Copropriétés', 'Grands comptes'];

// Liste de champs texte avec ajout/suppression — zéro JSON visible pour Jérémy.
function ListField({ label, hint, items, onChange, placeholder, addLabel, multiline = false }) {
  function update(i, value) {
    const next = [...items];
    next[i] = value;
    onChange(next);
  }
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {hint && <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem' }}>{hint}</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            {multiline ? (
              <textarea
                className="form-textarea"
                value={item}
                rows={3}
                style={{ minHeight: '70px', flex: 1 }}
                placeholder={placeholder}
                onChange={(e) => update(i, e.target.value)}
              />
            ) : (
              <input
                type="text"
                className="form-input"
                value={item}
                style={{ flex: 1 }}
                placeholder={placeholder}
                onChange={(e) => update(i, e.target.value)}
              />
            )}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              title="Supprimer cette ligne"
              style={{ color: '#ef4444', padding: '0.45rem 0.6rem' }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange([...items, ''])} style={{ marginTop: '0.5rem' }}>
        + {addLabel}
      </button>
    </div>
  );
}

// Offres : lignes intitulé + description courte.
function OffersField({ offers, onChange }) {
  function update(i, key, value) {
    const next = offers.map((o, idx) => (idx === i ? { ...o, [key]: value } : o));
    onChange(next);
  }
  return (
    <div className="form-group">
      <label className="form-label">Offres proposées</label>
      <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '0 0 0.5rem' }}>
        Ex. « Électricité », « Gaz naturel », « Énergie verte »… avec une courte description.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {offers.map((offer, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <input
              type="text"
              className="form-input"
              value={offer.label}
              style={{ flex: '0 0 180px' }}
              placeholder="Intitulé"
              onChange={(e) => update(i, 'label', e.target.value)}
            />
            <input
              type="text"
              className="form-input"
              value={offer.description}
              style={{ flex: 1 }}
              placeholder="Description courte"
              onChange={(e) => update(i, 'description', e.target.value)}
            />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onChange(offers.filter((_, idx) => idx !== i))}
              title="Supprimer cette offre"
              style={{ color: '#ef4444', padding: '0.45rem 0.6rem' }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn-outline btn-sm" onClick={() => onChange([...offers, { label: '', description: '' }])} style={{ marginTop: '0.5rem' }}>
        + Ajouter une offre
      </button>
    </div>
  );
}

// Profils cibles : cases connues + ajout libre.
function ProfilesField({ profiles, onChange }) {
  const [custom, setCustom] = useState('');
  const customProfiles = profiles.filter((p) => !KNOWN_PROFILES.includes(p));

  function toggle(profile) {
    onChange(profiles.includes(profile) ? profiles.filter((p) => p !== profile) : [...profiles, profile]);
  }
  function addCustom() {
    const value = custom.trim();
    if (value && !profiles.includes(value)) onChange([...profiles, value]);
    setCustom('');
  }

  return (
    <div className="form-group">
      <label className="form-label">Profils cibles</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        {KNOWN_PROFILES.map((profile) => (
          <label key={profile} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer', padding: '0.3rem 0.6rem', border: '1px solid var(--color-border)', borderRadius: '999px', background: profiles.includes(profile) ? 'rgba(20,110,243,0.12)' : 'transparent' }}>
            <input type="checkbox" checked={profiles.includes(profile)} onChange={() => toggle(profile)} />
            {profile}
          </label>
        ))}
        {customProfiles.map((profile) => (
          <span key={profile} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', padding: '0.3rem 0.6rem', border: '1px solid var(--color-border)', borderRadius: '999px', background: 'rgba(20,110,243,0.12)' }}>
            {profile}
            <button type="button" onClick={() => toggle(profile)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>✕</button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          className="form-input"
          value={custom}
          placeholder="Autre profil…"
          style={{ maxWidth: '220px' }}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
        />
        <button type="button" className="btn btn-outline btn-sm" onClick={addCustom}>Ajouter</button>
      </div>
    </div>
  );
}

const EMPTY_FORM = {
  name: '',
  fullName: '',
  slug: '',
  tagline: '',
  category: CATEGORIES[0],
  logoUrl: '',
  description: [''],
  offers: [{ label: '', description: '' }],
  pros: [''],
  cons: [''],
  profiles: [],
  published: false,
};

export default function ProviderEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [initial, setInitial] = useState({ slug: '', published: false });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [customCategory, setCustomCategory] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isEdit) return;
    fetch('/api/admin/providers', { credentials: 'include' })
      .then((r) => {
        if (r.status === 401) {
          setIsAuthenticated(false);
          navigate('/admin/connexion');
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        const provider = (data.providers || []).find((p) => p.id === parseInt(id, 10));
        if (!provider) {
          setError('Fournisseur introuvable');
          return;
        }
        setForm({
          name: provider.name,
          fullName: provider.fullName,
          slug: provider.slug,
          tagline: provider.tagline,
          category: provider.category || CATEGORIES[0],
          logoUrl: provider.logoUrl,
          description: provider.description.length ? provider.description : [''],
          offers: provider.offers.length ? provider.offers : [{ label: '', description: '' }],
          pros: provider.pros.length ? provider.pros : [''],
          cons: provider.cons.length ? provider.cons : [''],
          profiles: provider.profiles,
          published: provider.published,
        });
        setInitial({ slug: provider.slug, published: provider.published });
        setCustomCategory(Boolean(provider.category) && !CATEGORIES.includes(provider.category));
        setSlugManuallyEdited(true);
      })
      .catch(() => setError('Erreur lors du chargement du fournisseur'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  function setField(name, value) {
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'name' && !slugManuallyEdited) updated.slug = slugify(value);
      return updated;
    });
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append('image', file);
    setUploadingLogo(true);
    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', credentials: 'include', body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload échoué');
      setField('logoUrl', json.url);
    } catch (err) {
      setError(`Erreur upload : ${err.message}`);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSubmit(published) {
    setSaving(true);
    setError('');
    setFieldErrors({});
    try {
      const url = isEdit ? `/api/admin/providers/${id}` : '/api/admin/providers';
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, published }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 422 && data.errors) {
          const errs = {};
          data.errors.forEach((err) => { errs[err.path] = err.msg; });
          setFieldErrors(errs);
          setError('Certains champs sont invalides.');
        } else if (res.status === 401) {
          setIsAuthenticated(false);
          navigate('/admin/connexion');
        } else {
          setError(data.error || 'Erreur lors de la sauvegarde');
        }
      } else {
        navigate('/admin/fournisseurs');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setSaving(false);
    }
  }

  const slugChanged = isEdit && initial.published && form.slug !== initial.slug;

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar onLogout={() => {}} />
        <main className="admin-main">
          <div className="loading-screen"><div className="spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} /></div>
        </main>
      </div>
    );
  }

  return (
    <>
      <SEO title={isEdit ? 'Modifier le fournisseur | Admin' : 'Nouveau fournisseur | Admin'} noindex />
      <div className="admin-layout">
        <AdminSidebar onLogout={async () => {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
          setIsAuthenticated(false);
          navigate('/admin/connexion');
        }} />
        <main className="admin-main">
          <div className="admin-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/admin/fournisseurs" style={{ color: 'var(--color-text-muted)', display: 'flex' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </Link>
              <h1>{isEdit ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</h1>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => handleSubmit(false)} disabled={saving}>
                Enregistrer en brouillon
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => handleSubmit(true)} disabled={saving}>
                {saving ? <><span className="spinner" /> Sauvegarde...</> : 'Publier'}
              </button>
            </div>
          </div>

          <div className="admin-content">
            {error && <div className="alert alert-error">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>
              {/* Colonne principale */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="admin-card">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">
                      Nom <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input id="name" type="text" className="form-input" placeholder="Ex. EDF" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
                    {fieldErrors.name && <p className="form-error">{fieldErrors.name}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="fullName">Nom complet</label>
                    <input id="fullName" type="text" className="form-input" placeholder="Ex. Électricité de France" value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} />
                    {fieldErrors.fullName && <p className="form-error">{fieldErrors.fullName}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="tagline">Slogan</label>
                    <input id="tagline" type="text" className="form-input" placeholder="Une phrase qui résume le fournisseur" value={form.tagline} onChange={(e) => setField('tagline', e.target.value)} />
                    {fieldErrors.tagline && <p className="form-error">{fieldErrors.tagline}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="slug">Adresse de la fiche</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <span style={{ padding: '0.75rem 0.75rem 0.75rem 1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                        /guide-energie/
                      </span>
                      <input
                        id="slug"
                        type="text"
                        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', padding: '0.75rem 0.75rem 0.75rem 0' }}
                        value={form.slug}
                        onChange={(e) => { setSlugManuallyEdited(true); setField('slug', slugify(e.target.value)); }}
                      />
                    </div>
                    {slugChanged && (
                      <p style={{ fontSize: '0.78rem', color: '#f59e0b', marginTop: '0.4rem' }}>
                        ⚠️ Modifier l'adresse d'une fiche publiée change son URL : l'ancienne adresse renverra une page introuvable.
                      </p>
                    )}
                    {fieldErrors.slug && <p className="form-error">{fieldErrors.slug}</p>}
                  </div>
                </div>

                <div className="admin-card">
                  <ListField
                    label="Présentation"
                    hint="Un bloc par paragraphe. Texte simple, sans mise en forme."
                    items={form.description}
                    onChange={(v) => setField('description', v)}
                    placeholder="Paragraphe de présentation…"
                    addLabel="Ajouter un paragraphe"
                    multiline
                  />
                </div>

                <div className="admin-card">
                  <OffersField offers={form.offers} onChange={(v) => setField('offers', v)} />
                </div>

                <div className="admin-card">
                  <ListField
                    label="Points forts"
                    items={form.pros}
                    onChange={(v) => setField('pros', v)}
                    placeholder="Ex. Tarifs compétitifs sur le gaz"
                    addLabel="Ajouter un point fort"
                  />
                  <ListField
                    label="Points de vigilance"
                    items={form.cons}
                    onChange={(v) => setField('cons', v)}
                    placeholder="Ex. Service client difficile à joindre"
                    addLabel="Ajouter un point de vigilance"
                  />
                </div>

                <div className="admin-card">
                  <ProfilesField profiles={form.profiles} onChange={(v) => setField('profiles', v)} />
                </div>
              </div>

              {/* Colonne latérale */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="admin-card">
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700 }}>Publication</h3>
                  <div className="toggle-wrapper" style={{ marginBottom: '1.25rem' }}>
                    <label className="toggle" htmlFor="published">
                      <input id="published" type="checkbox" checked={form.published} onChange={(e) => setField('published', e.target.checked)} />
                      <span className="toggle-slider" />
                    </label>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                      {form.published ? 'Publié' : 'Masqué'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button className="btn btn-primary" onClick={() => handleSubmit(form.published)} disabled={saving} style={{ justifyContent: 'center' }}>
                      {saving ? <><span className="spinner" /> Sauvegarde...</> : 'Sauvegarder'}
                    </button>
                    <Link to="/admin/fournisseurs" className="btn btn-ghost" style={{ justifyContent: 'center', textAlign: 'center' }}>
                      Annuler
                    </Link>
                  </div>
                </div>

                <div className="admin-card">
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700 }}>Catégorie</h3>
                  <select
                    className="form-input"
                    value={customCategory ? '__autre__' : form.category}
                    onChange={(e) => {
                      if (e.target.value === '__autre__') {
                        setCustomCategory(true);
                        setField('category', '');
                      } else {
                        setCustomCategory(false);
                        setField('category', e.target.value);
                      }
                    }}
                  >
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    <option value="__autre__">Autre…</option>
                  </select>
                  {customCategory && (
                    <input
                      type="text"
                      className="form-input"
                      style={{ marginTop: '0.5rem' }}
                      placeholder="Nom de la catégorie"
                      value={form.category}
                      onChange={(e) => setField('category', e.target.value)}
                    />
                  )}
                  {fieldErrors.category && <p className="form-error">{fieldErrors.category}</p>}
                </div>

                <div className="admin-card">
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 700 }}>Logo</h3>
                  {form.logoUrl ? (
                    <div className="upload-preview">
                      <img src={form.logoUrl} alt="Logo" style={{ width: '100%', maxHeight: '120px', objectFit: 'contain', background: '#fff', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', padding: '0.5rem' }} />
                      <button className="upload-remove" onClick={() => setField('logoUrl', '')} title="Supprimer le logo">✕</button>
                    </div>
                  ) : (
                    <label className="upload-area" style={{ display: 'block', cursor: uploadingLogo ? 'wait' : 'pointer' }}>
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleLogoUpload} style={{ display: 'none' }} disabled={uploadingLogo} />
                      {uploadingLogo ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
                          <div className="spinner" />
                          <span style={{ fontSize: '0.8rem' }}>Envoi en cours...</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                          </svg>
                          <span style={{ fontSize: '0.8rem' }}>Cliquer pour télécharger</span>
                          <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>PNG avec fond transparent recommandé — max 5MB</span>
                        </div>
                      )}
                    </label>
                  )}
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.6rem' }}>
                    Sans logo, les initiales du fournisseur sont affichées automatiquement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-content > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
```

- [ ] **Step 2: Routes éditeur dans App.jsx**

Ajouter l'import après celui de `Providers` :

```js
import ProviderEditor from './pages/admin/ProviderEditor.jsx';
```

Après la route `/admin/fournisseurs`, ajouter :

```jsx
            <Route
              path="/admin/fournisseurs/nouveau"
              element={
                <ProtectedRoute>
                  <ProviderEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/fournisseurs/:id/modifier"
              element={
                <ProtectedRoute>
                  <ProviderEditor />
                </ProtectedRoute>
              }
            />
```

- [ ] **Step 3: Vérifier en dev**

Sur `http://localhost:5173/admin/fournisseurs` :
1. « Modifier » sur EDF : tous les champs pré-remplis (2 paragraphes, 3 offres, 4 points forts, 3 vigilances, profils cochés TPE/PME/Industrie, catégorie Historique, logo affiché). Modifier un paragraphe, sauvegarder → retour liste, rouvrir → modification persistée.
2. « Nouveau fournisseur » : créer « Octopus Energy » avec slogan, 1 paragraphe, 1 offre, 2 points forts, 1 vigilance, profils TPE+PME, catégorie « Autre… » → « Néo-fournisseur ». « Enregistrer en brouillon » → apparaît « Masqué » dans la liste, absent de `/guide-energie` public.
3. Champ vide laissé dans une liste (paragraphe vide) → après sauvegarde, l'entrée vide a disparu (nettoyage serveur).
4. Soumettre sans nom → message « Le nom est requis » sous le champ.
5. Supprimer le fournisseur de test.

- [ ] **Step 4: Commit**

```bash
git add client/src/pages/admin/ProviderEditor.jsx client/src/App.jsx
git commit -m "feat(admin): éditeur de fiche fournisseur guidé (listes dynamiques, logo, slug)"
```

---

### Task 12: Vérification de bout en bout (build + re-prerender + visuel)

**Files:** aucun nouveau — vérification.

- [ ] **Step 1: Rebuild complet et démarrage prod-like**

```bash
cd client && npm run build && cd ..
npm run start &
sleep 2
```
Expected: build OK avec les fiches prérendues, serveur démarré.

- [ ] **Step 2: Vérifier le HTML servi aux robots**

```bash
curl -s localhost:3000/guide-energie/edf | grep -c "Points forts"
curl -s localhost:3000/guide-energie/edf | grep -c "__VOLTEA_DATA__"
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/guide-energie/slug-bidon
curl -s localhost:3000/sitemap.xml | grep -c "guide-energie/"
```
Expected: `1`, `1`, `404`, `8`.

- [ ] **Step 3: Cycle complet de régénération à la demande**

```bash
curl -s -c /tmp/voltea-cookies.txt -H 'Content-Type: application/json' \
  -d '{"email":"<ADMIN_EMAIL>","password":"<ADMIN_PASSWORD>"}' localhost:3000/api/auth/login
# Créer un fournisseur PUBLIÉ
curl -s -b /tmp/voltea-cookies.txt -H 'Content-Type: application/json' \
  -d '{"name":"Octopus Test","tagline":"Test re-prerender","published":true,"description":["Paragraphe de test."],"pros":["Atout"],"cons":["Limite"],"offers":[{"label":"Électricité","description":"Offre test"}],"profiles":["TPE"]}' \
  localhost:3000/api/admin/providers
# Attendre la régénération (~10-20 s), puis :
sleep 20
curl -s -b /tmp/voltea-cookies.txt localhost:3000/api/admin/prerender/status
ls client/dist/guide-energie/octopus-test/
curl -s localhost:3000/guide-energie/octopus-test | grep -c "Paragraphe de test"
curl -s localhost:3000/guide-energie | grep -c "Octopus Test"
curl -s localhost:3000/sitemap.xml | grep -c "octopus-test"
```
Expected: status `lastRun.state: "done"` ; `index.html` présent ; `1` ; `1` (la liste régénérée contient le nouveau venu) ; `1`.

Puis suppression :

```bash
# remplacer <ID>
curl -s -b /tmp/voltea-cookies.txt -X DELETE localhost:3000/api/admin/providers/<ID>
sleep 20
curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/guide-energie/octopus-test
ls client/dist/guide-energie/ | grep -c octopus-test || echo SUPPRIME
curl -s localhost:3000/guide-energie | grep -c "Octopus Test" || echo ABSENT-DE-LA-LISTE
```
Expected: `404`, `SUPPRIME`, `ABSENT-DE-LA-LISTE`.

- [ ] **Step 4: Hydratation sans warning + vérification visuelle**

Ouvrir `localhost:3000/guide-energie` et `localhost:3000/guide-energie/edf` dans un navigateur (ou Playwright) :
- Console : **zéro** warning d'hydratation, zéro erreur.
- Captures d'écran de : `/guide-energie`, `/guide-energie/edf` (comparer à l'état avant migration — identiques au pixel près), `/admin/fournisseurs`, `/admin/fournisseurs/nouveau`.
- Navigation SPA : home → Guide → fiche EDF → retour : fluide, pas de flash.

- [ ] **Step 5: Commit final éventuel + récap**

Si des ajustements ont été nécessaires, les committer. Vérifier `git log --oneline` : ~11 commits cohérents. Arrêter le serveur de test.

---

## Self-review (faite à l'écriture du plan)

- **Couverture spec :** table+seed (T1-2), htmlCache (T3), lib prerender+injection+serveur API MySQL+file de régénération+dégradation gracieuse (T4), API+CRUD+validation+status (T5), build prerender BDD+warn (T6), pages publiques+bootstrap+NotFound+suppression providersData (T7-8), routing dynamique+sitemap+nettoyage routes.js (T9), admin liste+ordre+toggle+bandeau (T10), éditeur guidé+slug warning+logo+catégorie (T11), vérifications spec §6 (T12). ✔
- **Cohérence des types :** forme API camelCase unique via `rowToProvider` ; le client consomme `fullName/logoUrl` (compatible `ProviderLogo`) ; `prerenderService.getStatus()` → `{ running, pending, lastRun }` consommé tel quel par `PrerenderBanner` ; `data-prerender-pending` posé par GuideIndex/ProviderPage et attendu par `prerenderLib.snapshot()`. ✔
- **Ordre des commits :** chaque commit laisse le repo fonctionnel **build compris** — la lib prerender (T4) et le nouveau prerender.mjs (T6) sont en place avant que les pages passent à l'API (T7-8) ; routes.js n'est nettoyé (T9) qu'après que plus personne n'importe `PROVIDER_ROUTES` (grep de contrôle inclus). ✔
- **Pas de placeholder :** les deux seuls renvois (« copier les 7 autres fournisseurs », « grille existante inchangée ») référencent la source exacte fichier+lignes — copie mécanique, pas de TBD. ✔
