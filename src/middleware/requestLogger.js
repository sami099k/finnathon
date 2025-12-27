const ApiLog = require('../models/apiLog');

function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const doc = {
      timestamp: new Date(),
      clientIp: req.ip,
      endpoint: req.originalUrl.split('?')[0],
      method: req.method,
      statusCode: res.statusCode,
      responseTimeMs: Math.round(durationMs * 100) / 100,
      apiToken: req.headers['x-api-key'] || req.headers.authorization || null,
    };

    ApiLog.create(doc).catch((err) => {
      console.error('Failed to persist API log', err.message);
    });
  });

  next();
}

module.exports = requestLogger;
