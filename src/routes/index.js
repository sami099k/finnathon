const express = require('express');
const healthController = require('../controllers/healthController');
const accountController = require('../controllers/accountController');

const router = express.Router();

// health check
router.get('/health', healthController.health);

// mock fintech APIs
router.get('/balance', accountController.respondBalance);
router.post('/transaction', accountController.processTransaction);
router.get('/history', accountController.getHistory);

module.exports = router;
