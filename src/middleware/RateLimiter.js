const redis = require('../lib/redisClient');

const RATE_PREFIX = 'rate:limit:'; // rate:limit:{clientIP}
const BLOCKED_PREFIX = 'blocked:';  // blocked:{clientIP}

function rateLimit({ windowSec = 60, maxRequests = 10, blockOnLimit = false, blockSec = 10 } = {}) {
  return async function (req, res, next) {
    try {
      const clientIp = (req.ip || req.headers['x-forwarded-for'] || 'unknown').toString();

      // 1) check if blocked
      const isBlocked = await redis.exists(`${BLOCKED_PREFIX}${clientIp}`);
      if (isBlocked) {
        return res.status(403).json({ message: 'client blocked' });
      }

      // 2) increment counter in this window
      const key = `${RATE_PREFIX}${clientIp}`;
      const count = await redis.incr(key);

      if (count === 1) {
        // first increment, set TTL
        await redis.expire(key, windowSec);
      }

      if (count > maxRequests) {
        // optionally place a temporary block
        if (blockOnLimit) {
          await redis.set(`${BLOCKED_PREFIX}${clientIp}`, '1', {
            expiration: {
              value: blockSec,
              type: "EX"
            }
          });
        }
        return res.status(429).json({ message: 'Too Many Requests' });
      }

      // attach some debug info if you want
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));
      res.setHeader('X-RateLimit-Limit', maxRequests);
      next();
    } catch (err) {
      // On Redis failure, fall back to allow (or deny) — here we allow
      console.error('rateLimit error', err);
      next();
    }
  };
}

module.exports = rateLimit;
