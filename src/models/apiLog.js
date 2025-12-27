const mongoose = require('mongoose');

const apiLogSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now, index: true },
    clientIp: { type: String, index: true },
    endpoint: { type: String, index: true },
    method: { type: String },
    statusCode: { type: Number },
    responseTimeMs: { type: Number },
    apiToken: { type: String, index: true },
  },
  { versionKey: false }
);

apiLogSchema.index({ timestamp: -1, clientIp: 1 });
apiLogSchema.index({ timestamp: -1, endpoint: 1 });

module.exports = mongoose.model('ApiLog', apiLogSchema);
