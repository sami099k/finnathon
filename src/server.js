const app = require('./app');
const connectToDatabase = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const ApiLog = require('./models/apiLog');

require('dotenv').config();
require("./jobs/detectionEngine");
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available globally for emitting events
app.set('io', io);

async function start() {
  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase(process.env.MONGODB_URI);
      console.log('Database connected');
    } else {
      console.warn('MONGODB_URI not provided; skipping DB connection');
    }

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Admin Dashboard: http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
