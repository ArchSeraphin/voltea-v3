'use strict';

const dotenv = require('dotenv');
dotenv.config();

// Validate required environment variables
const REQUIRED_ENV = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
if (process.env.NODE_ENV === 'production') {
  REQUIRED_ENV.push('ALLOWED_ORIGIN');
}
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`[FATAL] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}
// Reject low-entropy JWT secrets so a 4-byte secret can't boot the app silently
['JWT_SECRET', 'JWT_REFRESH_SECRET'].forEach((k) => {
  if ((process.env[k] || '').length < 32) {
    console.error(`[FATAL] ${k} must be at least 32 characters`);
    process.exit(1);
  }
});

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const apiRoutes = require('./src/routes/api');
const adminRoutes = require('./src/routes/admin');
const sitemapRouter = require('./src/routes/sitemap');
const { KNOWN_PATHS, ADMIN_PREFIXES } = require('./src/config/routes');

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';
const PROD_URL = 'https://voltea-energie.fr';
const SITE_URL = process.env.SITE_URL || PROD_URL;

// Behind Nginx/Caddy/Cloudflare in prod — trust the first hop so req.ip resolves
// to the real client IP and express-rate-limit buckets per-client, not per-proxy.
app.set('trust proxy', 1);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          'https://www.googletagmanager.com',
          'https://www.google-analytics.com',
          'https://leadbooster-chat.pipedrive.com',
          'https://*.pipedriveassets.com',
          'https://webforms.pipedrive.com',
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://leadbooster-chat.pipedrive.com', 'https://*.pipedriveassets.com', 'https://webforms.pipedrive.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://*.pipedriveassets.com'],
        // imgSrc is intentionally permissive: GNews article thumbnails come from
        // an unbounded set of publisher CDNs (lepoint.fr, tf1info, woopic, swissinfo…).
        // Scripts/frames remain locked down via the other directives.
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: [
          "'self'",
          'https://www.google-analytics.com',
          'https://analytics.google.com',
          'https://www.googletagmanager.com',
          'https://leadbooster-chat.pipedrive.com',
          'https://*.pipedriveassets.com',
          'https://webforms.pipedrive.com',
        ],
        frameSrc: ['https://leadbooster-chat.pipedrive.com', 'https://webforms.pipedrive.com'],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: isProd ? [] : null,
      },
    },
    hsts: isProd
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
  })
);

// CORS
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));

// Static files
const distPath = path.join(__dirname, 'client', 'dist');
const imgPath = path.join(__dirname, 'img');
const uploadsPath = path.join(__dirname, 'uploads');
const assetsPath = path.join(__dirname, 'assets');

// Don't let express.static serve directory index.html files or redirect
// /foo → /foo/. The custom SPA fallback below picks the right prerendered
// HTML per request and keeps URLs canonical (no trailing slash).
app.use(express.static(distPath, { maxAge: '1d', index: false, redirect: false }));
app.use('/img', express.static(imgPath, { maxAge: '7d' }));
app.use('/uploads', express.static(uploadsPath, { maxAge: '7d' }));
app.use('/assets/videos', express.static(path.join(assetsPath, 'videos'), { maxAge: '7d' }));
app.use('/assets/images', express.static(path.join(assetsPath, 'images'), { maxAge: '7d' }));

// Sitemap & robots before SPA fallback
app.use(sitemapRouter);

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  // Dev environments: disallow indexing entirely to avoid duplicate content vs prod
  if (!isProd || SITE_URL !== PROD_URL) {
    res.send('User-agent: *\nDisallow: /\n');
    return;
  }
  res.send(
    `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE_URL}/sitemap.xml`
  );
});

app.get('/llms.txt', (req, res) => {
  res.type('text/plain');
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(`# Voltea Énergie

> Courtier indépendant en énergie pour professionnels, copropriétés et particuliers en Isère.
> Négociation de contrats d'électricité et de gaz auprès de plus de 20 fournisseurs. Audit sans frais. Basé à Bourgoin-Jallieu.

## Services clés
- Courtage en électricité et gaz naturel pour TPE, PME, industriels, copropriétés
- Audit énergétique sans frais et sans engagement
- Optimisation de la fiscalité énergétique (CSPE, TICGN)
- Conseil en efficacité énergétique et transition renouvelable
- Accompagnement post-signature et suivi de consommation

## Zone géographique
Isère, Rhône-Alpes, Auvergne-Rhône-Alpes. Intervention physique à Bourgoin-Jallieu, Villefontaine, L'Isle-d'Abeau, La Tour-du-Pin, Grenoble, Lyon.

## Contact
- Fondateur : Jérémy Lozzi
- Téléphone : +33 6 42 17 02 51
- Email : contact@voltea-energie.fr
- Adresse : 8 rue Joseph Cugnot, 38510 Bourgoin-Jallieu, France

## Pages principales
- [Accueil](${SITE_URL}/)
- [À propos](${SITE_URL}/a-propos)
- [Services](${SITE_URL}/services)
- [Guide des fournisseurs d'énergie](${SITE_URL}/guide-energie)
- [Marché de l'énergie](${SITE_URL}/marche-energie)
- [Actualités](${SITE_URL}/actualites)
- [FAQ](${SITE_URL}/faq)
- [Contact](${SITE_URL}/contact)

## Modèle économique
Service 100% gratuit pour le client. Voltea Énergie est rémunéré par les fournisseurs via des commissions contractuelles transparentes.
`);
});

// API routes
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

// SPA fallback. Prerender pipeline writes static HTML for every known
// public route to dist/<route>/index.html. Express prefers that file when
// it exists, falls back to the empty SPA shell otherwise so client-side
// routing still works (admin, dynamic article slugs).
const fs = require('fs');
const indexPath = path.join(distPath, 'index.html');
const shellPath = path.join(distPath, '__shell.html');
const notFoundPath = path.join(distPath, '__notfound.html');

// Best-effort: if the prerender produced a shell, use it for non-prerendered
// routes. Otherwise fall back to dist/index.html.
const fallbackShell = fs.existsSync(shellPath) ? shellPath : indexPath;
const fallback404 = fs.existsSync(notFoundPath) ? notFoundPath : fallbackShell;

function prerenderedFile(urlPath) {
  if (urlPath === '/') return indexPath;
  const candidate = path.join(distPath, urlPath, 'index.html');
  return fs.existsSync(candidate) ? candidate : null;
}

function serveSpa(res, status = 200, file = fallbackShell) {
  res.status(status).sendFile(file, (err) => {
    if (err) res.status(404).json({ error: 'Not found' });
  });
}

// Pool may not be ready on startup; load lazily
let _pool;
function getPool() {
  if (_pool) return _pool;
  try { _pool = require('./src/config/database'); } catch (e) { _pool = null; }
  return _pool;
}

app.get('*', async (req, res) => {
  const urlPath = req.path;

  // Known exact paths → serve the prerendered HTML if we have it
  if (KNOWN_PATHS.has(urlPath)) {
    const file = prerenderedFile(urlPath) || fallbackShell;
    return serveSpa(res, 200, file);
  }

  // Admin routes → always serve the empty shell (client-side auth handles)
  if (ADMIN_PREFIXES.some((p) => urlPath === p || urlPath.startsWith(`${p}/`))) {
    return serveSpa(res, 200, fallbackShell);
  }

  // Dynamic: /actualites/:slug — check published article exists.
  // The shell carries no per-article meta, so a future improvement is to
  // template title/excerpt/cover_image into the shell here. For now, the
  // SPA hydrates and renders the article content client-side.
  const articleMatch = urlPath.match(/^\/actualites\/([a-z0-9-]+)\/?$/i);
  if (articleMatch) {
    const pool = getPool();
    if (!pool) return serveSpa(res, 200, fallbackShell);
    try {
      const [rows] = await pool.execute(
        'SELECT 1 FROM articles WHERE slug = ? AND published = 1 LIMIT 1',
        [articleMatch[1]]
      );
      return serveSpa(res, rows.length > 0 ? 200 : 404, rows.length > 0 ? fallbackShell : fallback404);
    } catch (err) {
      return serveSpa(res, 200, fallbackShell);
    }
  }

  // Unknown — 404 with the prerendered NotFound page if available
  return serveSpa(res, 404, fallback404);
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  const message = isProd && status === 500 ? 'Internal server error' : err.message || 'Internal server error';
  res.status(status).json({ error: message });
});

// Auto-migrate: create missing tables
(async () => {
  try {
    const pool = require('./src/config/database');
    await pool.execute(`CREATE TABLE IF NOT EXISTS reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      author_name VARCHAR(200) NOT NULL,
      author_company VARCHAR(200),
      content TEXT NOT NULL,
      rating TINYINT NOT NULL DEFAULT 5,
      review_date DATE,
      logo_url VARCHAR(500),
      visible TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
  } catch (err) {
    console.error('[Voltea] Auto-migrate reviews failed:', err.message);
  }
})();

app.listen(PORT, () => {
  console.log(`[Voltea] Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

module.exports = app;
