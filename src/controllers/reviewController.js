'use strict';

const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

const reviewValidation = [
  body('author_name').trim().notEmpty().withMessage('Le nom est requis').isLength({ max: 200 }),
  body('author_company').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
  body('content').trim().notEmpty().withMessage("L'avis est requis").isLength({ max: 2000 }),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('La note doit être entre 1 et 5'),
  body('review_date').optional({ checkFalsy: true }).isISO8601().withMessage('Date invalide'),
  body('logo_url').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
];

// Public: get all visible reviews
async function getReviews(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, author_name, author_company, content, rating, review_date, logo_url FROM reviews WHERE visible = 1 ORDER BY review_date DESC'
    );
    res.json({ reviews: rows });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Public: aggregate rating for schema.org AggregateRating
async function getReviewsAggregate(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS count, AVG(rating) AS avg FROM reviews WHERE visible = 1'
    );
    const { count, avg } = rows[0];
    res.set('Cache-Control', 'public, max-age=3600');
    res.json({
      ratingValue: avg ? Number(avg).toFixed(1) : null,
      reviewCount: Number(count) || 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Admin: get all reviews
async function getAdminReviews(req, res) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM reviews ORDER BY created_at DESC'
    );
    res.json({ reviews: rows });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Admin: create review
async function createReview(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { author_name, author_company, content, rating, review_date, logo_url } = req.body;

  try {
    const [result] = await pool.execute(
      'INSERT INTO reviews (author_name, author_company, content, rating, review_date, logo_url) VALUES (?, ?, ?, ?, ?, ?)',
      [author_name, author_company || null, content, rating, review_date || null, logo_url || null]
    );
    const [rows] = await pool.execute('SELECT * FROM reviews WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Admin: update review
async function updateReview(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { author_name, author_company, content, rating, review_date, logo_url } = req.body;

  try {
    await pool.execute(
      'UPDATE reviews SET author_name = ?, author_company = ?, content = ?, rating = ?, review_date = ?, logo_url = ? WHERE id = ?',
      [author_name, author_company || null, content, rating, review_date || null, logo_url || null, id]
    );
    const [rows] = await pool.execute('SELECT * FROM reviews WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Avis introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Admin: delete review
async function deleteReview(req, res) {
  try {
    const [result] = await pool.execute('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Avis introuvable' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// Admin: toggle visibility
async function toggleVisible(req, res) {
  try {
    await pool.execute('UPDATE reviews SET visible = NOT visible WHERE id = ?', [req.params.id]);
    const [rows] = await pool.execute('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Avis introuvable' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

module.exports = {
  reviewValidation,
  getReviews,
  getReviewsAggregate,
  getAdminReviews,
  createReview,
  updateReview,
  deleteReview,
  toggleVisible,
};
