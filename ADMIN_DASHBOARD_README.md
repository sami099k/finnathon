# Admin Log Monitoring Dashboard - Setup Guide

## Project Overview

A complete React-based admin dashboard for monitoring API logs in real-time with beautiful charts, filters, and analytics.

## Features

- 📊 Real-time API hit monitoring with Socket.io
- 📈 Interactive charts (Hits over time, Endpoint distribution)
- 🔍 Advanced filtering (method, status, time range)
- 📋 Paginated log table with detailed view
- 🚨 Alert system for anomalies
- 📥 Export logs to JSON
- 🎨 Modern dark-themed UI

## Technology Stack

- **Frontend**: React, Chart.js, Socket.io Client, Axios
- **Backend**: Node.js, Express, Socket.io, MongoDB
- **Build Tool**: Vite
- **Database**: MongoDB
- **Cache**: Redis

## Setup Instructions

### 1. Install Dependencies

```powershell
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

### 3. Setup Redis

See [REDIS_SETUP.md](./REDIS_SETUP.md) for detailed instructions.
The project is already configured with a cloud Redis instance.

### 4. Build Frontend

```powershell
npm run build:frontend
```

This will compile the React app and place it in the `public` folder.

### 5. Start the Server

```powershell
npm run dev
```

The server will start on http://localhost:5000

### 6. Access the Dashboard

Open your browser and navigate to:

```
http://localhost:5000
```

## Development Mode

### Run Frontend in Development Mode

To develop the React app with hot-reload:

```powershell
npm run dev:frontend
```

This starts Vite dev server on http://localhost:3000 with proxy to backend.

### Run Backend in Development Mode

In another terminal:

```powershell
npm run dev
```

## API Endpoints

### Log Monitoring APIs

- `GET /api/logs` - Fetch logs with filtering
  - Query params: `timeRange`, `page`, `limit`
- `GET /api/logs/stats` - Get statistics
  - Query params: `timeRange`
- `GET /api/alerts` - Get recent alerts
  - Query params: `limit`

### Mock Fintech APIs

- `GET /api/health` - Health check
- `GET /api/balance` - Get account balance
- `POST /api/transaction` - Process transaction
- `GET /api/history` - Get transaction history

## Project Structure

```
finnathon/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   └── index.html         # HTML template
├── src/                   # Backend
│   ├── config/           # Configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── server.js        # Server entry
├── public/              # Built frontend (generated)
└── vite.config.js       # Vite configuration
```

## Features Guide

### Stats Cards

- **Total API Hits**: Total number of requests
- **Success Rate**: Percentage of successful requests (2xx)
- **Failed Requests**: Count of 4xx and 5xx errors
- **Avg Response Time**: Average API response time

### Filters

- **Search**: Search by endpoint, IP, method
- **Method Filter**: Filter by HTTP method
- **Status Filter**: Filter by status code range
- **Time Range**: Last hour, 6h, 24h, 7d, 30d

### Charts

- **Hits Over Time**: Line chart showing API hits in last 24 hours
- **Endpoint Distribution**: Doughnut chart of top 5 endpoints

### Real-time Updates

The dashboard automatically receives new logs via WebSocket connection without page refresh.

## Troubleshooting

### Port Already in Use

Change PORT in `.env` or kill the process:

```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### MongoDB Connection Issues

Ensure MONGODB_URI is correct in `.env` file.

### Redis Connection Issues

See [REDIS_SETUP.md](./REDIS_SETUP.md) for setup instructions.

### Build Errors

Clear node_modules and reinstall:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

## Production Deployment

1. Build the frontend:

   ```powershell
   npm run build:frontend
   ```

2. Set environment variables on your hosting platform

3. Start the server:
   ```powershell
   npm start
   ```

## Contributing

Feel free to submit issues and enhancement requests!

## License

ISC
