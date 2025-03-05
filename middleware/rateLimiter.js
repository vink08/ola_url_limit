

const { redisClient } = require('../config/redis');

const redisRateLimiter = async (req, res, next) => {
  try {
    // Use the client's IP address as the clientId if no x-client-id header is provided
    const clientId = req.headers['x-client-id'] || req.ip;

    const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds
    const MAX_REQUESTS = 5; // 5 requests per hour

    const rateLimitKey = `rate_limit:${clientId}`;

    const currentCount = await redisClient.incr(rateLimitKey);

    if (currentCount === 1) {
      await redisClient.expire(rateLimitKey, RATE_LIMIT_WINDOW);
    }

    console.log(`Rate Limit Check - Client: ${clientId}, Count: ${currentCount}/${MAX_REQUESTS}`);

    if (currentCount > MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Only ${MAX_REQUESTS} URLs can be shortened per hour.`,
        resetAt: new Date(Date.now() + RATE_LIMIT_WINDOW * 1000).toISOString(),
        clientId: clientId,
      });
    }

    req.clientId = clientId;
    next();
  } catch (error) {
    console.error('Redis Rate Limiter Error:', error);
    next(error); // Pass the error to the error handling middleware
  }
};

module.exports = redisRateLimiter;