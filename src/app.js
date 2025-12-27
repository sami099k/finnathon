const express = require('express');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use('/api', routes);
app.use(errorHandler);

module.exports = app;
