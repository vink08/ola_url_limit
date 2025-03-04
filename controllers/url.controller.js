
const { nanoid } = require('nanoid');
const validUrl = require('valid-url');
const Url = require('../models/url.model');


const getClientIP = (req) => {
  // Get IP with fallbacks for various deployment environments
  const ip = 
    (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
    req.headers['x-real-ip'] || 
    req.headers['cf-connecting-ip'] ||
    req.socket.remoteAddress || 
    '0.0.0.0';
  
  return ip;
};

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
    const ipAddress = getClientIP(req);
    console.log(`Shortening URL from IP: ${ipAddress}`);
    
    // Generate a short code
    const shortCodeLength = parseInt(process.env.SHORTCODE_LENGTH) || 6;
    const shortCode = nanoid(shortCodeLength);
    
    // Create a new URL entry
    const urlEntry = new Url({
      originalUrl,
      shortCode,
      ipAddress
    });
    
    await urlEntry.save();
    
    // Calculate expiry date
    const expiryDays = parseInt(process.env.URL_EXPIRY_DAYS) || 7;
    const expiresAt = new Date(Date.now() + (expiryDays * 24 * 60 * 60 * 1000));
    
    return res.status(201).json({
      success: true,
      shortUrl: `${process.env.BASE_URL}/${shortCode}`,
      shortCode,
      expiresAt
    });
  } catch (error) {
    console.error('Error shortening URL:', error);
    return res.status(500).json({
      success: false,
      message: 'Error shortening URL'
    });
  }
};


exports.redirectToUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    // Find the URL in the database
    const url = await Url.findOne({ shortCode });
    
    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found or has expired'
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

exports.getUrlStats = async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    // Find the URL in the database
    const url = await Url.findOne({ shortCode });
    
    if (!url) {
      return res.status(404).json({
        success: false,
        message: 'URL not found or has expired'
      });
    }
    
    // Calculate expiry date
    const expiryDays = parseInt(process.env.URL_EXPIRY_DAYS) || 7;
    const expiresAt = new Date(url.createdAt.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
    
    // Return the stats
    return res.status(200).json({
      success: true,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiresAt,
      createdBy: url.ipAddress.split('.').slice(0, 2).join('.') + '.*.*' // Partial IP for privacy
    });
  } catch (error) {
    console.error('Error getting URL stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting URL stats'
    });
  }
};