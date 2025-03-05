

// const Url = require('../models/url.model');

// const getClientIP = (req) => {
//   // Get IP with fallbacks for various deployment environments
//   const ip = 
//     (req.headers['x-forwarded-for'] || '').split(',').pop().trim() || 
//     req.headers['x-real-ip'] || 
//     req.headers['cf-connecting-ip'] ||
//     req.socket.remoteAddress || 
//     '0.0.0.0';
  
//   return ip;
// };

// const rateLimiter = async (req, res, next) => {
//   try {
//     const ipAddress = getClientIP(req);
//     const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 3600000; // 1 hour in milliseconds
//     const maxRequests = parseInt(process.env.RATE_LIMIT_MAX) || 5; // Max 5 requests per window
    
//     const oneHourAgo = new Date(Date.now() - windowMs);
    
//     const count = await Url.countDocuments({
//       ipAddress,
//       createdAt: { $gte: oneHourAgo }
//     });
    
//     console.log(`Rate limit check - IP: ${ipAddress}, Count: ${count}/${maxRequests}, Window: ${new Date(oneHourAgo).toISOString()} to now`);
    
//     if (count >= maxRequests) {
//       console.log(`Rate limit exceeded for IP: ${ipAddress}`);
//       return res.status(429).json({
//         success: false,
//         message: `Rate limit exceeded. Only ${maxRequests} URLs can be shortened per hour.`,
//         resetAt: new Date(Date.now() + (windowMs - (Date.now() - oneHourAgo.getTime()))).toISOString()
//       });
//     }
    
//     next();
//   } catch (error) {
//     console.error('Rate limiter error:', error);
//     next(error);
//   }
// };

// module.exports = rateLimiter;

const Url = require('../models/url.model');

// const getClientIP = (req) => {
//   const forwardedFor = req.headers['x-forwarded-for'];
//   if (forwardedFor) {
//     // Split and take the first (client) IP
//     const clientIP = forwardedFor.split(',')[0].trim();
//     const maskedIP = clientIP.split('.').slice(0, 3).join('.') + '.0';
//     return maskedIP;
//   }
//   const realIP = 
//     req.headers['x-real-ip'] || 
//     req.headers['cf-connecting-ip'] ||
//     req.socket.remoteAddress || 
//     '0.0.0.0';
//   const ipParts = realIP.split('.');
//   if (ipParts.length > 3) {
//     return ipParts.slice(0, 3).join('.') + '.0';
//   }

//   return realIP;
// };

const getClientIP = (req) => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.headers['cf-connecting-ip'] || req.socket.remoteAddress || '0.0.0.0';
};

const rateLimiter = async (req, res, next) => {
  try {
    // Get masked IP address to track by subnet
    const ipAddress = getClientIP(req);
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 3600000; // 1 hour in milliseconds
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX) || 5; // Max 5 requests per window
    
    // Count URLs created by this subnet in the past hour
    const oneHourAgo = new Date(Date.now() - windowMs);
    
    const count = await Url.countDocuments({
      ipAddress,
      createdAt: { $gte: oneHourAgo }
    });
    
    // Extensive logging for debugging
    console.log(`Rate Limit Check: 
      IP: ${ipAddress}, 
      Current Count: ${count}/${maxRequests}, 
      Window Start: ${oneHourAgo.toISOString()}`
    );
    
    if (count >= maxRequests) {
      console.log(`Rate limit exceeded for subnet: ${ipAddress}`);
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Only ${maxRequests} URLs can be shortened per hour.`,
        resetAt: new Date(Date.now() + windowMs).toISOString(),
        currentIP: ipAddress
      });
    }
    
    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next(error);
  }
};

module.exports = rateLimiter;