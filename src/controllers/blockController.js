const redis = require('../config/redis');

const BLOCKED_SET = 'blocked:clients';

exports.getBlocked = async (req, res) => {
  try {
    const members = await redis.smembers(BLOCKED_SET);
    res.json({ success: true, blocked: members });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch blocked clients', error: err.message });
  }
};

exports.blockClient = async (req, res) => {
  try {
    const { clientId } = req.body || {};
    if (!clientId) {
      return res.status(400).json({ success: false, message: 'clientId required' });
    }
    await redis.sadd(BLOCKED_SET, clientId);
    res.json({ success: true, blocked: clientId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to block client', error: err.message });
  }
};

exports.unblockClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    if (!clientId) {
      return res.status(400).json({ success: false, message: 'clientId required' });
    }
    await redis.srem(BLOCKED_SET, clientId);
    res.json({ success: true, unblocked: clientId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to unblock client', error: err.message });
  }
};
