const express = require('express');
const healthController = require('../controllers/healthController');
const accountController = require('../controllers/accountController');

const router = express.Router();
const rateLimit = require('../middleware/RateLimiter');
// health check
router.get('/health', healthController.health);

// mock fintech APIs
router.get('/balance', accountController.respondBalance);
router.post('/transaction',   rateLimit({
    windowSec: 60,
    maxRequests: 10,
    blockOnLimit: true,
    blockSec: 20 // 5 minutes
  }),accountController.processTransaction);
router.get('/history', accountController.getHistory);

module.exports = router;
