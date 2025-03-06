const { createClient } = require('redis');

// Create a Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL, 
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

redisClient.on('ready', () => {
  console.log('Redis Client Ready');
});

const connectRedis = async () => {
  try {
    console.log('REDIS_URL:', process.env.REDIS_URL); // Double-check the URL
    await redisClient.connect();
    console.log('Connected to Redis successfully');
  } catch (err) {
    console.error('Failed to connect to Redis', err);
    process.exit(1);
  }
};

module.exports = {
  redisClient,
  connectRedis,
};
