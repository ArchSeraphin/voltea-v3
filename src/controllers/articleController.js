'use strict';

const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 200);
}

async function makeUniqueSlug(baseSlug, excludeId = null) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    let query = 'SELECT id FROM articles WHERE slug = ?';
    const params = [slug];
    if (excludeId) {
      query += ' AND id != ?';
      params.push(excludeId);
    }
    const [rows] = await pool.execute(query, params);
    if (rows.length === 0) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Validation rules
const articleValidation = [
  body('title').trim().notEmpty().withMessage('Le titre est requis').isLength({ max: 500 }),
  body('excerpt').optional().trim().isLength({ max: 1000 }),
  body('content').optional().trim(),
  body('cover_image').optional().trim().isLength({ max: 500 }),
  body('published').optional().isBoolean(),
];

// PUBLIC: Get paginated published articles
async function getArticles(req, res) {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = 9;
  const offset = (page - 1) * limit;

  try {
    const [rows] = await pool.execute(
      `SELECT id, title, slug, excerpt, cover_image, published_at, created_at
       FROM articles
       WHERE published = 1
       ORDER BY published_at DESC, created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [[{ total }]] = await pool.execute(
      'SELECT COUNT(*) AS total FROM articles WHERE published = 1'
    );

    return res.json({
      articles: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[articles/getArticles]', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// PUBLIC: Get article by slug
async function getArticleBySlug(req, res) {
  const { slug } = req.params;

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM articles WHERE slug = ? AND published = 1 LIMIT 1',
      [slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Article introuvable' });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error('[articles/getArticleBySlug]', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ADMIN: Get all articles (paginated)
async function getAdminArticles(req, res) {
  const page = Math.max(1, parseInt(req.query.page || '1', 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const [rows] = await pool.execute(
      `SELECT id, title, slug, excerpt, cover_image, published, published_at, created_at, updated_at
       FROM articles
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [[{ total }]] = await pool.execute('SELECT COUNT(*) AS total FROM articles');

    return res.json({
      articles: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[articles/getAdminArticles]', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ADMIN: Create article
async function createArticle(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { title, excerpt, content, cover_image, published } = req.body;
  let { slug } = req.body;

  try {
    const baseSlug = slug ? slugify(slug) : slugify(title);
    const uniqueSlug = await makeUniqueSlug(baseSlug);
    const isPublished = published ? 1 : 0;
    const publishedAt = isPublished ? new Date() : null;

    const [result] = await pool.execute(
      `INSERT INTO articles (title, slug, excerpt, content, cover_image, published, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, uniqueSlug, excerpt || null, content || null, cover_image || null, isPublished, publishedAt]
    );

    const [rows] = await pool.execute('SELECT * FROM articles WHERE id = ?', [result.insertId]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('[articles/createArticle]', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ADMIN: Update article
async function updateArticle(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { title, excerpt, content, cover_image, published } = req.body;
  let { slug } = req.body;

  try {
    const [existing] = await pool.execute('SELECT id, published FROM articles WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Article introuvable' });
    }

    const baseSlug = slug ? slugify(slug) : slugify(title);
    const uniqueSlug = await makeUniqueSlug(baseSlug, id);
    const isPublished = published ? 1 : 0;

    let publishedAt = null;
    if (isPublished && !existing[0].published) {
      publishedAt = new Date();
    } else if (isPublished && existing[0].published) {
      const [[art]] = await pool.execute('SELECT published_at FROM articles WHERE id = ?', [id]);
      publishedAt = art.published_at;
    }

    await pool.execute(
      `UPDATE articles
       SET title = ?, slug = ?, excerpt = ?, content = ?, cover_image = ?, published = ?, published_at = ?
       WHERE id = ?`,
      [title, uniqueSlug, excerpt || null, content || null, cover_image || null, isPublished, publishedAt, id]
    );

    const [rows] = await pool.execute('SELECT * FROM articles WHERE id = ?', [id]);
    return res.json(rows[0]);
  } catch (err) {
    console.error('[articles/updateArticle]', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ADMIN: Delete article
async function deleteArticle(req, res) {
  const { id } = req.params;

  try {
    const [result] = await pool.execute('DELETE FROM articles WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Article introuvable' });
    }
    return res.status(204).end();
  } catch (err) {
    console.error('[articles/deleteArticle]', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

// ADMIN: Toggle published
async function togglePublished(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute(
      'SELECT id, published FROM articles WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Article introuvable' });
    }

    const article = rows[0];
    const newPublished = article.published ? 0 : 1;
    const publishedAt = newPublished ? new Date() : null;

    if (!newPublished) {
      await pool.execute(
        'UPDATE articles SET published = ?, published_at = NULL WHERE id = ?',
        [newPublished, id]
      );
    } else {
      await pool.execute(
        'UPDATE articles SET published = ?, published_at = ? WHERE id = ?',
        [newPublished, publishedAt, id]
      );
    }

    const [updated] = await pool.execute('SELECT * FROM articles WHERE id = ?', [id]);
    return res.json(updated[0]);
  } catch (err) {
    console.error('[articles/togglePublished]', err);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  getArticles,
  getArticleBySlug,
  getAdminArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  togglePublished,
  articleValidation,
};
