require('dotenv').config(); // if not already loaded
const Redis = require('ioredis');

const url = process.env.REDIS_URL;
if (!url) {
  console.warn('REDIS_URL not set');
  module.exports = null;
} else {
  const redis = new Redis(url, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
    retryStrategy(times) { return Math.min(1000 * 2 ** times, 30000); }
  });

  redis.on('ready', () => console.log('Redis ready'));
  redis.on('error', (err) => console.error('Redis error:', err.message));

  module.exports = redis;
}
