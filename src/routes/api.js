'use strict';

const express = require('express');
const router = express.Router();

const { apiLimiter, contactLimiter, loginLimiter } = require('../middleware/rateLimiter');
const articleController = require('../controllers/articleController');
const contactController = require('../controllers/contactController');
const authController = require('../controllers/authController');
const settingsController = require('../controllers/settingsController');
const reviewController = require('../controllers/reviewController');

// Articles (public)
router.get('/articles', apiLimiter, articleController.getArticles);
router.get('/articles/:slug', articleController.getArticleBySlug);

// Contact
router.post(
  '/contact',
  contactLimiter,
  contactController.validateContact,
  contactController.sendContact
);

// Auth
router.post('/auth/login', loginLimiter, authController.login);
router.post('/auth/refresh', authController.refresh);
router.post('/auth/logout', authController.logout);

// Reviews (public)
router.get('/reviews', apiLimiter, reviewController.getReviews);

// Public settings
router.get('/settings', settingsController.getPublicSettings);

module.exports = router;
