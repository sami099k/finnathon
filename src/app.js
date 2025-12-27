const express = require('express');
const path = require('path');
const routes = require('./routes');
const requestLogger = require('./middleware/requestLogger');

const app = express();

app.use(express.json());
app.use(requestLogger);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', routes);

// Basic error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ message });
});

module.exports = app;
