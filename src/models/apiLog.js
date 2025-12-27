const mongoose = require('mongoose');

const apiLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    clientIp: { type: String, index: true },
    clientId: { type: String, index: true },
    endpoint: { type: String, index: true },
    method: { type: String },
    statusCode: { type: Number },
    responseTimeMs: { type: Number },
    apiToken: { type: String, index: true },
    userAgent: { type: String },
    authStatus: { type: String },
  },
  { versionKey: false }
);

apiLogSchema.index({ timestamp: -1, clientIp: 1 });
apiLogSchema.index({ timestamp: -1, clientId: 1 });
apiLogSchema.index({ timestamp: -1, endpoint: 1 });

module.exports = mongoose.model('ApiLog', apiLogSchema);
