const redis = require('../config/redis');
const BLOCKED_SET = 'blocked:clients';

function getClientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  const fromHeader = Array.isArray(xff) ? xff[0] : (xff || '').split(',')[0].trim();
  const rawIp = fromHeader || req.socket?.remoteAddress || req.ip;
  return rawIp === '::1' ? '127.0.0.1' : rawIp;
}

function parseApiKeys() {
  const raw = process.env.API_KEYS || 'demo-key';
  return raw.split(',').map((k) => k.trim()).filter(Boolean);
}

async function isBlockedClient(clientIp, apiToken) {
  const tokenId = apiToken ? `token:${apiToken}` : null;
  const ipId = `ip:${clientIp}`;

  const blockedIp = await redis.sismember(BLOCKED_SET, ipId);
  if (blockedIp) return { blocked: true, blockedId: ipId };

  const legacyBlocked = await redis.sismember(BLOCKED_SET, clientIp);
  if (legacyBlocked) return { blocked: true, blockedId: clientIp };

  if (tokenId) {
    const blockedToken = await redis.sismember(BLOCKED_SET, tokenId);
    if (blockedToken) return { blocked: true, blockedId: tokenId };
  }

  return { blocked: false };
}

module.exports = async function auth(req, res, next) {
  try {
    const clientIp = getClientIp(req);
    res.locals.clientIp = clientIp;

    const provided = (req.headers['x-api-key'] || req.headers.authorization || '').trim();
    const allowedKeys = parseApiKeys();

    if (!provided) {
      res.locals.authStatus = 'missing_key';
      return res.status(401).json({ message: 'API key required' });
    }

    const { blocked, blockedId } = await isBlockedClient(clientIp, provided);
    if (blocked) {
      res.locals.authStatus = 'blocked';
      res.locals.blockedId = blockedId;
      return res.status(403).json({ message: 'Client blocked' });
    }

    if (!allowedKeys.includes(provided)) {
      res.locals.authStatus = 'invalid_key';
      return res.status(403).json({ message: 'Invalid API key' });
    }

    res.locals.authStatus = 'authorized';
    res.locals.clientId = `token:${provided}`;
    req.apiToken = provided;
    next();
  } catch (err) {
    res.locals.authStatus = 'error';
    next(err);
  }
};
