const Url = require('../models/url.model');
// custom rate limiter for 5 requests per user in an hour 
const rateLimiter = async (req, res, next) => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 3600000; // 1 hour in milliseconds
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX) || 5; // Max 5 requests per window
    
    // count urls created by
    const oneHourAgo = new Date(Date.now() - windowMs);
    const count = await Url.countDocuments({
      ipAddress,
      createdAt: { $gte: oneHourAgo }
    });
    
    if (count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Only ${maxRequests} URLs can be shortened per hour.`
      });
    }
    
    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next(error);
  }
};

module.exports = rateLimiter;