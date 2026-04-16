'use strict';

const pool = require('../config/database');

// In-memory cache — one entry, invalidated after 15 minutes or server restart
let cache = { data: null, timestamp: 0 };
const CACHE_TTL_MS = 15 * 60 * 1000;

async function getGNewsApiKey() {
  const [rows] = await pool.execute(
    "SELECT `value` FROM settings WHERE `key` = 'gnews_api_key' LIMIT 1"
  );
  return rows.length > 0 ? rows[0].value : null;
}

async function getNews(req, res) {
  try {
    const now = Date.now();

    // Serve from cache if still fresh
    if (cache.data && now - cache.timestamp < CACHE_TTL_MS) {
      return res.json(cache.data);
    }

    const apiKey = await getGNewsApiKey();
    if (!apiKey) {
      return res.json({ articles: [] });
    }

    const maxRaw = parseInt(req.query.max, 10);
    const max = Number.isFinite(maxRaw) && maxRaw > 0 ? Math.min(maxRaw, 10) : 9;
    const q = encodeURIComponent('marché énergie OR courtage énergie OR électricité gaz');
    const url = `https://gnews.io/api/v4/search?q=${q}&lang=fr&max=${max}&token=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('[news/getNews] GNews responded with status', response.status);
      return res.json({ articles: [] });
    }

    const data = await response.json();
    cache = { data, timestamp: now };
    return res.json(data);
  } catch (err) {
    console.error('[news/getNews]', err);
    return res.json({ articles: [] });
  }
}

module.exports = { getNews };
