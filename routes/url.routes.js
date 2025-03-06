const express = require('express');
const router = express.Router();
const urlController = require('../controllers/url.controller');
const rateLimiter = require('../middleware/rateLimiter');

// POST endpoint to shorten a URL (with rate limiting)
router.post('/shorten', rateLimiter, urlController.shortenUrl);

// GET endpoint to redirect to the original URL
router.get('/:shortCode', urlController.redirectToUrl);

// GET endpoint to get stats for a URL
router.get('/stats/:shortCode', urlController.getUrlStats);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

module.exports = router;