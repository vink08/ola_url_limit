

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

const rateLimiter = async (req, res, next) => {
  try {
    const ipAddress = getClientIP(req);
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 3600000; // 1 hour in milliseconds
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX) || 5; // Max 5 requests per window
    
    const oneHourAgo = new Date(Date.now() - windowMs);
    
    const count = await Url.countDocuments({
      ipAddress,
      createdAt: { $gte: oneHourAgo }
    });
    
    console.log(`Rate limit check - IP: ${ipAddress}, Count: ${count}/${maxRequests}, Window: ${new Date(oneHourAgo).toISOString()} to now`);
    
    if (count >= maxRequests) {
      console.log(`Rate limit exceeded for IP: ${ipAddress}`);
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Only ${maxRequests} URLs can be shortened per hour.`,
        resetAt: new Date(Date.now() + (windowMs - (Date.now() - oneHourAgo.getTime()))).toISOString()
      });
    }
    
    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next(error);
  }
};

module.exports = rateLimiter;