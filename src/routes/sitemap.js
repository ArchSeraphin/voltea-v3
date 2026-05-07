'use strict';

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const { SITEMAP_ROUTES } = require('../config/routes');

const BASE_URL = process.env.SITE_URL || 'https://voltea-energie.fr';

// Captured at boot so static-route lastmod reflects deployment date
// (not request time — that would falsely signal daily updates to Google).
const BOOT_DATE = new Date().toISOString().split('T')[0];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(loc, lastmod) {
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
}

router.get('/sitemap.xml', async (req, res) => {
  const entries = SITEMAP_ROUTES.map(({ path }) =>
    urlEntry(`${BASE_URL}${path}`, BOOT_DATE)
  );

  // Articles are best-effort: a DB hiccup must not 500 the whole sitemap,
  // or Google sees the entire site as missing.
  try {
    const [articles] = await pool.execute(
      'SELECT slug, updated_at, published_at FROM articles WHERE published = 1 ORDER BY published_at DESC'
    );
    for (const article of articles) {
      const date = article.updated_at || article.published_at;
      const lastmod = date ? new Date(date).toISOString().split('T')[0] : BOOT_DATE;
      entries.push(urlEntry(`${BASE_URL}/actualites/${article.slug}`, lastmod));
    }
  } catch (err) {
    console.error('[sitemap] articles fetch failed, serving static routes only:', err.message);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600');
  return res.send(xml);
});

module.exports = router;
