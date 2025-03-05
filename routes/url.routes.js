const express = require('express');
const router = express.Router();
const urlController = require('../controllers/url.controller');
const redisRateLimiter = require('../middleware/rateLimiter');

router.post('/shorten', redisRateLimiter, urlController.shortenUrl);
router.get('/:shortCode', urlController.redirectToUrl);
router.get('/stats/:shortCode', urlController.getUrlStats);
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

module.exports = router;