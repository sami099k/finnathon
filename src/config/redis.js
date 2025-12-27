const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || undefined;
const redisOptions = redisUrl
  ? redisUrl
  : {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
    };

const redis = new Redis(redisOptions);

redis.on('error', (err) => {
  console.error('Redis error:', err.message);
});

module.exports = redis;
