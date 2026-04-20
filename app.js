'use strict';

const dotenv = require('dotenv');
dotenv.config();

// Validate required environment variables
const REQUIRED_ENV = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`[FATAL] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

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

app.use(express.static(distPath, { maxAge: '1d' }));
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
- Adresse : Bourgoin-Jallieu, Isère (38300), France

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

// ─── SETUP ROUTE (one-time DB init — remove after first use) ───────────────
// Usage: GET /api/setup?token=SEED_SECRET&email=admin@...&password=...
if (process.env.SEED_SECRET) {
  app.get('/api/setup', async (req, res) => {
    if (req.query.token !== process.env.SEED_SECRET) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    try {
      const bcrypt = require('bcrypt');
      const pool = require('./src/config/database');
      const queries = [
        `CREATE TABLE IF NOT EXISTS admins (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS refresh_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          token_hash VARCHAR(64) NOT NULL UNIQUE,
          admin_id INT NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS settings (
          \`key\` VARCHAR(100) NOT NULL PRIMARY KEY,
          \`value\` TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS articles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(500) NOT NULL,
          slug VARCHAR(500) NOT NULL UNIQUE,
          excerpt TEXT,
          content LONGTEXT,
          cover_image VARCHAR(500),
          published TINYINT(1) DEFAULT 0,
          published_at TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
        `CREATE TABLE IF NOT EXISTS reviews (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
      ];
      for (const q of queries) await pool.execute(q);
      const log = ['Tables créées avec succès.'];
      if (req.query.email && req.query.password) {
        const hash = await bcrypt.hash(req.query.password, 12);
        await pool.execute(
          'INSERT INTO admins (email, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash = ?',
          [req.query.email.toLowerCase(), hash, hash]
        );
        log.push(`Admin créé : ${req.query.email}`);
      }
      res.json({ ok: true, log });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}
// ───────────────────────────────────────────────────────────────────────────

// SPA fallback — resolve unknown URLs to real 404 rather than 200 + SPA shell.
// This avoids soft-404 indexing of arbitrary paths by Google.
const indexPath = path.join(distPath, 'index.html');

function serveSpa(res, status = 200) {
  res.status(status).sendFile(indexPath, (err) => {
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

  // Known exact paths → 200
  if (KNOWN_PATHS.has(urlPath)) return serveSpa(res, 200);

  // Admin routes → always serve SPA (client-side auth handles)
  if (ADMIN_PREFIXES.some((p) => urlPath === p || urlPath.startsWith(`${p}/`))) {
    return serveSpa(res, 200);
  }

  // Dynamic: /actualites/:slug — check published article exists
  const articleMatch = urlPath.match(/^\/actualites\/([a-z0-9-]+)\/?$/i);
  if (articleMatch) {
    const pool = getPool();
    if (!pool) return serveSpa(res, 200);
    try {
      const [rows] = await pool.execute(
        'SELECT 1 FROM articles WHERE slug = ? AND published = 1 LIMIT 1',
        [articleMatch[1]]
      );
      return serveSpa(res, rows.length > 0 ? 200 : 404);
    } catch (err) {
      return serveSpa(res, 200);
    }
  }

  // Unknown — return 404 with SPA shell (React will render NotFound)
  return serveSpa(res, 404);
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
