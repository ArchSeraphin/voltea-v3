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

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

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
        ],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://leadbooster-chat.pipedrive.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https://www.google-analytics.com', 'https://www.googletagmanager.com', 'https://leadbooster-chat.pipedrive.com'],
        connectSrc: [
          "'self'",
          'https://www.google-analytics.com',
          'https://analytics.google.com',
          'https://www.googletagmanager.com',
          'https://leadbooster-chat.pipedrive.com',
        ],
        frameSrc: ['https://leadbooster-chat.pipedrive.com'],
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

// Sitemap & robots before SPA fallback
app.use(sitemapRouter);

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(
    'User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: https://voltea-energie.fr/sitemap.xml'
  );
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

// SPA fallback
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Not found' });
    }
  });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  const message = isProd && status === 500 ? 'Internal server error' : err.message || 'Internal server error';
  res.status(status).json({ error: message });
});

app.listen(PORT, () => {
  console.log(`[Voltea] Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

module.exports = app;
