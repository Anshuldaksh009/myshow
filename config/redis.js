const redis = require('redis');

// Create client using the Upstash Cloud URL
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on('connect', () => {
  console.log('🟢 Connected to Upstash Cloud Redis successfully!');
});

redisClient.on('error', (err) => {
  console.error('🔴 Redis Cloud Error:', err);
});

// Connect to the cloud!
redisClient.connect();

module.exports = redisClient;