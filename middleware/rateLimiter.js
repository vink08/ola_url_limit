const { redisClient } = require('../config/redis');

const redisRateLimiter = async (req, res, next) => {
  try {
    const clientId = req.headers['x-client-id'] || req.ip;
    const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds
    const MAX_REQUESTS = 5; // 5 requests per hour
    const rateLimitKey = `rate_limit:${clientId}`;

    console.log(`Rate Limit Check - Client: ${clientId}, Key: ${rateLimitKey}`);

    // Increment the request count
    const currentCount = await redisClient.incr(rateLimitKey);
    console.log(`Current Count: ${currentCount}`);

    // Set expiry if this is the first request
    if (currentCount === 1) {
      await redisClient.expire(rateLimitKey, RATE_LIMIT_WINDOW);
      console.log(`Key ${rateLimitKey} set to expire in ${RATE_LIMIT_WINDOW} seconds`);
    }

    // Check if the rate limit is exceeded
    if (currentCount > MAX_REQUESTS) {
      console.log(`Rate limit exceeded for Client: ${clientId}`);
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
    next(error);
  }
};

module.exports = redisRateLimiter;