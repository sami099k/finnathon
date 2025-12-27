const ApiLog = require("../models/apiLog");
const Alert = require("../models/Alert");
const RULES = require("../config/detectionRules");

// ---------------- RULE 1 ----------------
// >100 requests per minute from same IP
async function detectHighRequestRate(now) {
  const oneMinuteAgo = new Date(now - 60 * 1000);

  const results = await ApiLog.aggregate([
    { $match: { timestamp: { $gte: oneMinuteAgo } } },
    {
      $group: {
        _id: "$clientIp",
        count: { $sum: 1 }
      }
    },
    { $match: { count: { $gt: RULES.MAX_REQUESTS_PER_MINUTE } } }
  ]);

  for (const r of results) {
    // Check if alert already exists in last 2 minutes to avoid duplicates
    const twoMinsAgo = new Date(now - 2 * 60 * 1000);
    const existing = await Alert.findOne({
      clientId: r._id,
      violationType: "RATE_LIMIT_EXCEEDED",
      timestamp: { $gte: twoMinsAgo }
    }).lean();

    if (!existing) {
      await Alert.create({
        clientId: r._id,
        violationType: "RATE_LIMIT_EXCEEDED",
        severity: "HIGH",
        details: { requestsPerMinute: r.count }
      });
    }
  }
}

// ---------------- RULE 2 ----------------
async function detectUnauthorizedAccess(now) {
  const tenMinutesAgo = new Date(now - 10 * 60 * 1000);

  // 1) debug - show sample logs and statusCode buckets
  const sample = await ApiLog.find({ timestamp: { $gte: tenMinutesAgo } })
    .sort({ timestamp: -1 })
    .limit(10)
    .lean();
  console.log('Sample recent logs:', sample.map(s => ({ ip: s.clientIp, endpoint: s.endpoint, statusCode: s.statusCode, ts: s.timestamp })));

  const statusBuckets = await ApiLog.aggregate([
    { $match: { timestamp: { $gte: tenMinutesAgo } } },
    { $group: { _id: "$statusCode", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
  console.log('statusCode buckets in last 10m:', statusBuckets);

  // 2) robust aggregation: match either numeric or string 401/403
  const results = await ApiLog.aggregate([
    { $match: {
        timestamp: { $gte: tenMinutesAgo },
        $or: [
          { statusCode: { $in: [401, 403] } },
          { statusCode: { $in: ["401", "403"] } }
        ]
      }
    },
    {
      $group: {
        _id: "$clientIp",
        failures: { $sum: 1 }
      }
    },
    { $match: { failures: { $gt: RULES.MAX_FAILED_AUTH_10_MIN } } }
  ]);

  console.log("Unauthorized access results (after matching):", results);

  for (const r of results) {
    const clientId = r._id || 'unknown-client';

    console.log("Unauthorized access detected for", clientId, "with", r.failures, "failures");

    // simple dedupe: only create a new alert if none in last 30 mins
    const thirtyMinsAgo = new Date(now - 30 * 60 * 1000);
    const existing = await Alert.findOne({
      clientId,
      violationType: "UNAUTHORIZED_ACCESS",
      timestamp: { $gte: thirtyMinsAgo }
    }).lean();

    if (existing) {
      console.log(`Skipping alert creation for ${clientId}: recent alert exists at ${existing.timestamp}`);
      continue;
    }

    await Alert.create({
      clientId,
      violationType: "UNAUTHORIZED_ACCESS",
      severity: "MEDIUM",
      timestamp: new Date(),
      details: { failedAttempts: r.failures, windowMinutes: 10 }
    });

    console.log(`Alert created for ${clientId}`);
  }
}

// ---------------- RULE 3 ----------------
// /transaction without /balance in last 5 mins
async function detectSequenceAnomaly(now) {
  const fiveMinutesAgo = new Date(now - 5 * 60 * 1000);

  const txCalls = await ApiLog.find({
    endpoint: "/api/transaction",
    timestamp: { $gte: fiveMinutesAgo }
  });

  for (const tx of txCalls) {
    const clientId = tx.clientIp;
    const balanceCheck = await ApiLog.findOne({
      clientIp: tx.clientIp,
      endpoint: "/api/balance",
      timestamp: { $gte: fiveMinutesAgo }
    });

    if (!balanceCheck) {
      const existing = await Alert.findOne({
        clientId,
        violationType: "UNUSUAL_API_SEQUENCE",
        timestamp: { $gte: fiveMinutesAgo }
      }).lean();
      
      if (existing) {
        console.log(`Skipping alert creation for ${clientId}: recent alert exists at ${existing.timestamp} for sequence anomaly`);
        continue;
      }

      await Alert.create({
        clientId: tx.clientIp,
        violationType: "UNUSUAL_API_SEQUENCE",
        severity: "LOW",
        details: {
          accessed: "/api/transaction",
          missing: "/api/balance"
        }
      });
    }
  }
}

// ---------------- JOB RUNNER ----------------
async function runDetection() {
  try {
    const now = new Date();
    await detectHighRequestRate(now);
    await detectUnauthorizedAccess(now);
    await detectSequenceAnomaly(now);
    console.log("Detection Engine run completed at", now.toISOString());
  } catch (err) {
    console.error("Detection Engine Error:", err.message);
  }
}

// Run every 60 seconds
setInterval(runDetection, RULES.JOB_INTERVAL_MS);

console.log("🚨 Detection Engine running");
