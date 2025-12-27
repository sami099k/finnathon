const express = require('express');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
// const ConnectToDatabase = require('./config/db');
const app = express();

const rateLimit = require('./middleware/RateLimiter');
// global rate limiter: 100 req/min
app.use(rateLimit({ windowSec: 60, maxRequests: 100, blockOnLimit: false }));

// ConnectToDatabase();
app.use(express.json());
app.use(requestLogger);
app.use('/api', routes);
app.use(errorHandler);

module.exports = app;
