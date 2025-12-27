const redis = require('../config/redis');
const RULES = require('../config/detectionRules');

const WINDOW_SECONDS = 60;
const BLOCKED_SET = 'blocked:clients';

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  const fromHeader = Array.isArray(xff) ? xff[0] : (xff || '').split(',')[0].trim();
  const rawIp = fromHeader || req.socket?.remoteAddress || req.ip;
  return rawIp === '::1' ? '127.0.0.1' : rawIp;
}

async function isBlocked(clientIp, apiToken) {
  const ipId = `ip:${clientIp}`;
  const tokenId = apiToken ? `token:${apiToken}` : null;

  const blockedIp = await redis.sismember(BLOCKED_SET, ipId);
  if (blockedIp) return true;

  const legacyBlocked = await redis.sismember(BLOCKED_SET, clientIp);
  if (legacyBlocked) return true;

  if (tokenId) {
    const blockedToken = await redis.sismember(BLOCKED_SET, tokenId);
    if (blockedToken) return true;
  }

  return false;
}

module.exports = async function rateLimiter(req, res, next) {
  try {
    const clientIp = res.locals.clientIp || getClientIp(req);
    res.locals.clientIp = clientIp;
    const apiToken = req.apiToken;

    if (await isBlocked(clientIp, apiToken)) {
      res.locals.authStatus = res.locals.authStatus || 'blocked';
      return res.status(403).json({ message: 'Client blocked' });
    }

    const id = apiToken ? `token:${apiToken}` : `ip:${clientIp}`;
    const key = `rate:limit:${id}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, WINDOW_SECONDS);
    }

    if (count > RULES.MAX_REQUESTS_PER_MINUTE) {
      await redis.sadd(BLOCKED_SET, id);
      res.locals.authStatus = res.locals.authStatus || 'rate_limited';
      return res.status(429).json({ message: 'Rate limit exceeded' });
    }

    res.locals.rateLimit = { count, windowSeconds: WINDOW_SECONDS, id };
    next();
  } catch (err) {
    next(err);
  }
};
