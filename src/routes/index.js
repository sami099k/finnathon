const express = require('express');
const logsController = require('../controllers/logsController');
const accountController = require('../controllers/accountController');

const router = express.Router();

// Mock FinTech APIs
router.get('/balance', accountController.respondBalance);
router.post('/transaction', accountController.processTransaction);
router.get('/history', accountController.getHistory);

// Admin log monitoring endpoints
router.get('/logs', logsController.getLogs);
router.get('/logs/stats', logsController.getStats);
router.get('/alerts', logsController.getAlerts);

module.exports = router;
