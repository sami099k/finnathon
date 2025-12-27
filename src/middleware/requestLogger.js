const ApiLog = require('../models/apiLog');

function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const xff = req.headers['x-forwarded-for'];
    const fromHeader = Array.isArray(xff) ? xff[0] : (xff || '').split(',')[0].trim();
    const rawIp = fromHeader || req.socket?.remoteAddress || req.ip;
    const clientIp = rawIp === '::1' ? '127.0.0.1' : rawIp;

    const doc = {
      timestamp: new Date(),
      clientIp,
      endpoint: req.originalUrl.split('?')[0],
      method: req.method,
      statusCode: res.statusCode,
      responseTimeMs: Math.round(durationMs * 100) / 100,
      apiToken: req.headers['x-api-key'] || req.headers.authorization || null,
    };

    console.log('API_LOG', doc);

    ApiLog.create(doc).catch((err) => {
      console.error('Failed to persist API log', err.message, doc);
    });
  });

  next();
}

module.exports = requestLogger;
