const express = require('express');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();

// honor X-Forwarded-For when behind proxies (dev tools, cloud)
app.set('trust proxy', true);

app.use(express.json());
app.use(requestLogger);
app.use('/api', routes);
app.use(errorHandler);

module.exports = app;
