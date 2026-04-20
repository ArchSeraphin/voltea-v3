'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const { SITEMAP_ROUTES } = require('../config/routes');

const BASE_URL = process.env.SITE_URL || 'https://voltea-energie.fr';

router.get('/sitemap.xml', async (req, res) => {
  try {
    const [articles] = await pool.execute(
      'SELECT slug, updated_at, published_at FROM articles WHERE published = 1 ORDER BY published_at DESC'
    );

    const today = new Date().toISOString().split('T')[0];

    let urls = SITEMAP_ROUTES.map(({ path, priority, changefreq }) => `
  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('');

    articles.forEach((article) => {
      const lastmod = (article.updated_at || article.published_at || new Date())
        .toISOString()
        .split('T')[0];
      urls += `
  <url>
    <loc>${BASE_URL}/actualites/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=86400');
    return res.send(xml);
  } catch (err) {
    console.error('[sitemap]', err);
    return res.status(500).send('<?xml version="1.0"?><error>Erreur serveur</error>');
  }
});

module.exports = router;
