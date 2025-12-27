const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      required: true,
      index: true
    },

    violationType: {
      type: String,
      required: true,
      enum: [
        "RATE_LIMIT_EXCEEDED",
        "UNAUTHORIZED_ACCESS",
        "UNUSUAL_API_SEQUENCE"
      ]
    },

    severity: {
      type: String,
      required: true,
      enum: ["LOW", "MEDIUM", "HIGH"]
    },

    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },

    details: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  { versionKey: false }
);

// Optional but useful for dashboards & cleanup
alertSchema.index({ timestamp: -1, clientId: 1 });

module.exports = mongoose.model("Alert", alertSchema);
