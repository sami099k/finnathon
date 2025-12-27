const ApiLog = require("../models/apiLog");
const Alert = require("../models/Alert");
const RULES = require("../config/detectionRules");
const redis = require("../config/redis");

const BLOCKED_SET = "blocked:clients";

const resolveClientId = (doc) => doc.clientId || (doc.apiToken ? `token:${doc.apiToken}` : `ip:${doc.clientIp || "unknown"}`);

// ---------------- RULE 1 ----------------
// >100 requests per minute per client (IP or token)
async function detectHighRequestRate(now) {
  const oneMinuteAgo = new Date(now - 60 * 1000);

  const results = await ApiLog.aggregate([
    { $match: { timestamp: { $gte: oneMinuteAgo } } },
    {
      $addFields: {
        aggClientId: { $ifNull: ["$clientId", { $concat: ["ip:", "$clientIp"] }] }
      }
    },
    {
      $group: {
        _id: "$aggClientId",
        count: { $sum: 1 }
      }
    },
    { $match: { count: { $gt: RULES.MAX_REQUESTS_PER_MINUTE } } }
  ]);

  for (const r of results) {
    const clientId = r._id;
    const twoMinsAgo = new Date(now - 2 * 60 * 1000);
    const existing = await Alert.findOne({
      clientId,
      violationType: "RATE_LIMIT_EXCEEDED",
      timestamp: { $gte: twoMinsAgo }
    }).lean();

    if (!existing) {
      await Alert.create({
        clientId,
        violationType: "RATE_LIMIT_EXCEEDED",
        severity: "HIGH",
        details: { requestsPerMinute: r.count }
      });
    }

    await redis.sadd(BLOCKED_SET, clientId);
  }
}

// ---------------- RULE 2 ----------------
async function detectUnauthorizedAccess(now) {
  const tenMinutesAgo = new Date(now - 10 * 60 * 1000);

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
      $addFields: {
        aggClientId: { $ifNull: ["$clientId", { $concat: ["ip:", "$clientIp"] }] }
      }
    },
    {
      $group: {
        _id: "$aggClientId",
        failures: { $sum: 1 }
      }
    },
    { $match: { failures: { $gt: RULES.MAX_FAILED_AUTH_10_MIN } } }
  ]);

  for (const r of results) {
    const clientId = r._id || "unknown-client";

    const thirtyMinsAgo = new Date(now - 30 * 60 * 1000);
    const existing = await Alert.findOne({
      clientId,
      violationType: "UNAUTHORIZED_ACCESS",
      timestamp: { $gte: thirtyMinsAgo }
    }).lean();

    if (existing) {
      continue;
    }

    await Alert.create({
      clientId,
      violationType: "UNAUTHORIZED_ACCESS",
      severity: "MEDIUM",
      timestamp: new Date(),
      details: { failedAttempts: r.failures, windowMinutes: 10 }
    });

    await redis.sadd(BLOCKED_SET, clientId);
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
    const clientId = resolveClientId(tx);
    const balanceCheck = await ApiLog.findOne({
      $and: [
        { timestamp: { $gte: fiveMinutesAgo } },
        { endpoint: "/api/balance" },
        { $or: [
          { clientId: clientId },
          { clientId: { $exists: false }, clientIp: tx.clientIp }
        ] }
      ]
    });

    if (!balanceCheck) {
      const existing = await Alert.findOne({
        clientId,
        violationType: "UNUSUAL_API_SEQUENCE",
        timestamp: { $gte: fiveMinutesAgo }
      }).lean();
      
      if (existing) {
        continue;
      }

      await Alert.create({
        clientId,
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
