const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis successfully');
  } catch (err) {
    console.error('Failed to connect to Redis', err);
    process.exit(1); // Exit if Redis connection fails
  }
};

module.exports = {
  redisClient,
  connectRedis
};