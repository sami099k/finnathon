const ApiLog = require('../models/apiLog');

function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', async () => {
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

    try {
      const logEntry = await ApiLog.create(doc);
      
      // Emit socket event for real-time updates (if socket.io is available)
      const io = req.app.get('io');
      if (io) {
        const logData = {
          _id: logEntry._id,
          timestamp: logEntry.timestamp,
          ip: logEntry.clientIp,
          endpoint: logEntry.endpoint,
          method: logEntry.method,
          statusCode: logEntry.statusCode,
          responseTime: logEntry.responseTimeMs,
          userAgent: req.headers['user-agent'],
          createdAt: logEntry.createdAt
        };
        io.emit('newLog', logData);
      }
    } catch (err) {
      console.error('Failed to persist API log', err.message, doc);
    }
  });

  next();
}

module.exports = requestLogger;
