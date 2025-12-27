const app = require('./app');
const connectToDatabase = require('./config/db');

require('dotenv').config();
require("./jobs/detectionEngine");
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase(process.env.MONGODB_URI);
      console.log('Database connected');
    } else {
      console.warn('MONGODB_URI not provided; skipping DB connection');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}


start();
