'use strict';

const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const articleController = require('../controllers/articleController');
const uploadController = require('../controllers/uploadController');
const settingsController = require('../controllers/settingsController');
const reviewController = require('../controllers/reviewController');
const providerController = require('../controllers/providerController');
const prerenderService = require('../services/prerenderService');

// All admin routes require authentication
router.use(requireAuth);

// Articles
router.get('/articles', articleController.getAdminArticles);
router.post('/articles', articleController.articleValidation, articleController.createArticle);
router.put('/articles/:id', articleController.articleValidation, articleController.updateArticle);
router.delete('/articles/:id', articleController.deleteArticle);
router.patch('/articles/:id/toggle', articleController.togglePublished);

// Reviews
router.get('/reviews', reviewController.getAdminReviews);
router.post('/reviews', reviewController.reviewValidation, reviewController.createReview);
router.put('/reviews/:id', reviewController.reviewValidation, reviewController.updateReview);
router.delete('/reviews/:id', reviewController.deleteReview);
router.patch('/reviews/:id/toggle', reviewController.toggleVisible);

// Providers
router.get('/providers', providerController.getAdminProviders);
router.post('/providers', providerController.providerValidation, providerController.createProvider);
router.patch('/providers/reorder', providerController.reorderProviders);
router.put('/providers/:id', providerController.providerValidation, providerController.updateProvider);
router.delete('/providers/:id', providerController.deleteProvider);
router.patch('/providers/:id/toggle', providerController.togglePublished);

// Statut de la file de régénération prerender (bandeau admin)
router.get('/prerender/status', (req, res) => res.json(prerenderService.getStatus()));

// Upload
router.post('/upload', uploadLimiter, uploadController.uploadImage);

// Settings
router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);

module.exports = router;
