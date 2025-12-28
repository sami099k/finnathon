const express = require('express');
const logsController = require('../controllers/logsController');
const accountController = require('../controllers/accountController');
const blockController = require('../controllers/blockController');
const auth = require('../middleware/auth');
const rateLimiter = require('../middleware/RateLimiter');

const router = express.Router();

// Mock FinTech APIs
router.get('/balance', auth, rateLimiter, accountController.respondBalance);
router.post('/transaction', auth, rateLimiter, accountController.processTransaction);
router.get('/history', auth, rateLimiter, accountController.getHistory);

// Admin log monitoring endpoints
router.get('/logs', logsController.getLogs);
router.get('/logs/stats', logsController.getStats);
router.get('/alerts', logsController.getAlerts);

// Block controls
router.get('/blocked', blockController.getBlocked);
router.post('/blocked', blockController.blockClient);
router.delete('/blocked/:clientId', blockController.unblockClient);

module.exports = router;
