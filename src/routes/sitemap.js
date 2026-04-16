'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const BASE_URL = 'https://voltea-energie.fr';

const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/a-propos', priority: '0.8', changefreq: 'monthly' },
  { loc: '/services', priority: '0.9', changefreq: 'monthly' },
  { loc: '/marche-energie', priority: '0.7', changefreq: 'weekly' },
  { loc: '/guide-energie', priority: '0.8', changefreq: 'monthly' },
  { loc: '/actualites', priority: '0.8', changefreq: 'daily' },
  { loc: '/contact', priority: '0.7', changefreq: 'monthly' },
];

router.get('/sitemap.xml', async (req, res) => {
  try {
    const [articles] = await pool.execute(
      'SELECT slug, updated_at, published_at FROM articles WHERE published = 1 ORDER BY published_at DESC'
    );

    let urls = STATIC_PAGES.map(({ loc, priority, changefreq }) => `
  <url>
    <loc>${BASE_URL}${loc}</loc>
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
