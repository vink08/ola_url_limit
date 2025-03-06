// File: controllers/url.controller.js
const { nanoid } = require('nanoid'); // This works with nanoid v3.x
const validUrl = require('valid-url');
const Url = require('../models/url.model');

/**
 * Shorten a URL
 */
exports.shortenUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    
    // Validate URL
    if (!validUrl.isWebUri(originalUrl)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid URL provided' 
      });
    }

    // Get IP address for rate limiting
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    // Generate a short code
    const shortCode = nanoid(parseInt(process.env.SHORTCODE_LENGTH) || 6);
    
    // Create a new URL entry
    const urlEntry = new Url({
      originalUrl,
      shortCode,
      ipAddress
    });
    
    await urlEntry.save();
    
    return res.status(201).json({
      success: true,
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
      shortCode,
      expiresAt: new Date(Date.now() + (process.env.URL_EXPIRY_DAYS * 24 * 60 * 60 * 1000))
    });
  } catch (error) {
    console.error('Error shortening URL:', error);
    return res.status(500).json({
      success: false,
      message: 'Error shortening URL'
    });
  }
};

/**
 * Redirect to the original URL
 */
exports.redirectToUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    // Find the URL in the database
    const url = await Url.findOne({ shortCode });
    
    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found'
      });
    }
    
    // Increment the click count
    url.clicks++;
    await url.save();
    
    // Redirect to the original URL
    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error('Error redirecting to URL:', error);
    return res.status(500).json({
      success: false,
      message: 'Error redirecting to URL'
    });
  }
};

/**
 * Get stats for a URL
 */
exports.getUrlStats = async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    // Find the URL in the database
    const url = await Url.findOne({ shortCode });
    
    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found'
      });
    }
    
    // Return the stats
    return res.status(200).json({
      success: true,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiresAt: new Date(url.createdAt.getTime() + (process.env.URL_EXPIRY_DAYS * 24 * 60 * 60 * 1000))
    });
  } catch (error) {
    console.error('Error getting URL stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting URL stats'
    });
  }
};