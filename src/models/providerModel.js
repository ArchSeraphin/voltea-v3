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
