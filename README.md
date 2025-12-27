# 🚨 Sentinel Protocol – API Abuse Detection Platform

> A production-ready FinTech API monitoring and mitigation system that detects, visualizes, and blocks malicious traffic in real-time.

## 📋 Table of Contents

- [Problem Statement](#problem-statement)
- [Approach & Architecture](#approach--architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage & Testing](#usage--testing)
- [Dashboard Guide](#dashboard-guide)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Problem Statement

Traditional API monitoring (uptime, latency, throughput) leaves security blind spots. FinTech platforms need **visibility into who is calling APIs, from where, how often, with what outcome**—and the ability to **block bad actors instantly**.

### Challenges

- **Request flooding**: Rapid requests from single IP/token exhaust resources.
- **Credential abuse**: Repeated failed auth attempts signal brute force or token theft.
- **Unusual patterns**: Accessing sensitive endpoints out of order (e.g., transaction without balance check).
- **Manual mitigation**: Slow incident response; no automated blocking.

### Our Solution

A centralized, intelligent monitoring platform that:

1. **Logs** every API request with context (IP, token, user agent, response status, latency).
2. **Detects** abuse via configurable rule engine (rate limits, auth failures, sequence anomalies).
3. **Mitigates** automatically (rate-limit buckets, block offenders) or manually (dashboard controls).
4. **Visualizes** threats in real-time (live logs, alerts, top endpoints, blocked clients).

---

## 🏗 Approach & Architecture

### Layers

```
┌─────────────────────────────────────────┐
│   React Dashboard (Vite)                │  Real-time UI
│   - Live logs, alerts, stats            │
│   - Block/unblock controls              │
└──────────────┬──────────────────────────┘
               │ Socket.io + REST
┌──────────────┴──────────────────────────┐
│   Express Backend                       │
│   - Mock APIs (balance, tx, history)    │  Request processing
│   - Auth middleware (API key)           │  & logging
│   - Rate limiter (Redis counters)       │
│   - Block enforcer (Redis set)          │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
   ┌────▼────┐   ┌───▼──────┐
   │ MongoDB │   │  Redis   │
   │  Logs   │   │  Blocked │
   │ Alerts  │   │  Rate    │
   └─────────┘   │  limits  │
                 └──────────┘
```

### Detection Engine

Runs **every 60 seconds** as a background job:

| Rule                 | Condition                                                    | Action                      |
| -------------------- | ------------------------------------------------------------ | --------------------------- |
| **Rate Limit**       | >100 requests/min per clientId (ip:_ or token:_)             | Auto-block, create alert    |
| **Auth Abuse**       | >5 failed auth (401/403) in 10 min per clientId              | Auto-block, create alert    |
| **Sequence Anomaly** | Call `/api/transaction` without `/api/balance` in last 5 min | Create alert (LOW severity) |

---

## ✨ Features

### 1. Mock FinTech APIs

```
GET    /api/balance      → Account balance
POST   /api/transaction  → Process debit/credit
GET    /api/history      → Recent transactions
```

All protected by API key + rate limiting.

### 2. Activity Logging

Every request is logged with:

- **timestamp** – exact moment of call
- **clientIp** – IP address (with X-Forwarded-For support)
- **clientId** – unique identifier (token:KEY or ip:IP)
- **endpoint** – API path called
- **method** – HTTP verb
- **statusCode** – response status (200, 401, 403, 429, etc.)
- **responseTimeMs** – latency
- **apiToken** – API key used
- **userAgent** – client info (browser, curl, etc.)
- **authStatus** – authorization outcome (authorized, invalid_key, missing_key, blocked, etc.)

### 3. Rule-Based Detection

Three rules run every 60 seconds on recent logs:

1. **High request rate**: > 100 req/min per clientId
2. **Auth abuse**: > 5 failed auth in 10 min per clientId
3. **Sequence anomaly**: transaction without prior balance check in 5 min

### 4. Automatic Mitigation

- Rate limit breach → 429 response + Redis block
- Auth failures → 403 response + alert + Redis block
- Manual block via API → 403 response

### 5. Real-Time Dashboard

- **Live Logs Table**: Stream of all requests with filtering (method, status, time range)
- **Stats Grid**: Total hits, success rate, failed requests, avg response time
- **Alerts Section**: Recent security events with severity
- **Top Endpoints**: Bar chart of most-called APIs
- **Trending Chart**: Request volume over time
- **Blocked Clients Panel**: List of blocked IPs/tokens with unblock buttons

### 6. Traffic Simulation

Test normal and attack scenarios:

- `npm run simulate:normal` – varied-pace requests, normal distribution
- `npm run simulate:attack` – 120 rapid requests + bad auth attempts

---

## 🛠 Tech Stack

| Layer    | Tech                                              |
| -------- | ------------------------------------------------- |
| Frontend | React 19, Vite, Chart.js, Socket.io-client, Axios |
| Backend  | Node.js, Express 5, Socket.io                     |
| Database | MongoDB 9.x (Mongoose), Redis 5.x (ioredis)       |
| DevOps   | Nodemon (dev), npm scripts                        |

**Key Dependencies**:

- `express` – REST API framework
- `mongoose` – MongoDB ODM
- `ioredis` – Redis client
- `socket.io` – Real-time events
- `dotenv` – Environment config

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (running locally or remote URL)
- Redis (running locally or remote URL)

### 1. Clone & Install

```bash
git clone <repo>
cd finnathon
npm install

cd client
npm install
cd ..
```

### 2. Configure `.env`

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sentinel
REDIS_URL=redis://localhost:6379
API_KEYS=demo-key,another-key
BASE_URL=http://localhost:5000
```

**Alternative Redis config** (instead of `REDIS_URL`):

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=  # if needed
```

### 3. Start Backend

```bash
npm start
# Output:
# 🚨 Detection Engine running
# Database connected
# Server running on port 5000
# Admin Dashboard: http://localhost:5000
```

### 4. Start Frontend

```bash
cd client
npm run dev
# Output:
# ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

---

## ⚙️ Configuration

### Environment Variables

| Variable         | Default               | Description                       |
| ---------------- | --------------------- | --------------------------------- |
| `PORT`           | 5000                  | Backend port                      |
| `MONGODB_URI`    | –                     | MongoDB connection string         |
| `REDIS_URL`      | –                     | Redis connection string           |
| `REDIS_HOST`     | 127.0.0.1             | Redis host (if REDIS_URL not set) |
| `REDIS_PORT`     | 6379                  | Redis port                        |
| `REDIS_PASSWORD` | –                     | Redis auth password               |
| `API_KEYS`       | demo-key              | Comma-separated valid API keys    |
| `BASE_URL`       | http://localhost:5000 | For traffic simulators            |

### Detection Rules (`src/config/detectionRules.js`)

```javascript
module.exports = {
  MAX_REQUESTS_PER_MINUTE: 100, // Threshold for rate limiting
  MAX_FAILED_AUTH_10_MIN: 5, // Threshold for auth abuse
  JOB_INTERVAL_MS: 60 * 1000, // Detection engine interval
};
```

---

## 🧪 Usage & Testing

### Manual API Testing

**Get balance** (valid key):

```bash
curl -H "x-api-key: demo-key" http://localhost:5000/api/balance
```

**Get balance** (invalid key):

```bash
curl -H "x-api-key: bad-key" http://localhost:5000/api/balance
# → 403 Forbidden
```

**Process transaction**:

```bash
curl -X POST -H "x-api-key: demo-key" \
  -H "Content-Type: application/json" \
  -d '{"type": "credit", "amount": 50, "reference": "test"}' \
  http://localhost:5000/api/transaction
```

### Automated Simulation

**Normal traffic** (20 cycles of balance → transaction → history with random delays):

```bash
npm run simulate:normal
```

**Attack traffic** (120 rapid requests + bad auth):

```bash
npm run simulate:attack
```

**Expected behavior after `simulate:attack`**:

1. First ~100 requests succeed (under limit)
2. Requests 101+ return 429 (rate limited)
3. IP added to Redis blocked set `blocked:clients`
4. Subsequent requests return 403 (blocked)
5. Detection engine picks up the spike after 60s, creates alert
6. Dashboard shows alert with severity HIGH and blocked IP in the blocked clients panel

---

## 📊 Dashboard Guide

### Live API Logs

- **Real-time table** of all API calls
- **Columns**: Timestamp, Method (badge), Endpoint, Status (badge), Response Time, IP, User Agent, Actions
- **Filters**: Search by IP/endpoint/method, status code, time range
- **Pagination**: 20 logs per page

### Stats Grid

- **Total Hits**: Request count in selected time range
- **Success Rate**: Percentage of 2xx responses
- **Failed Requests**: Count of 4xx/5xx responses
- **Avg Response Time**: Mean latency in ms

### Alerts Section

- **Alert list** with severity colors (HIGH = red, MEDIUM = yellow, LOW = gray)
- **Severity levels**: HIGH (rate limit), MEDIUM (auth failure), LOW (sequence anomaly)
- **Timestamps**: Relative time ("5 mins ago")

### Top Endpoints

- **Bar chart** of most-called endpoints
- **Metrics**: Hit count, avg response time, error rate %

### Trending Chart

- **Line chart** of requests per minute over time
- **X-axis**: Time buckets
- **Y-axis**: Request count

### Blocked Clients Panel

- **List** of blocked IPs and tokens
- **Unblock button**: Instantly removes from Redis blocked set
- **Block input**: Add IP or token to blocklist
- **Status**: "No clients are blocked" when empty

---

## 🔌 API Reference

### Admin/Monitoring Endpoints

#### Get Logs

```
GET /api/logs?timeRange=24h&page=1&limit=100
```

Query params:

- `timeRange`: 1h, 6h, 24h, 7d, 30d (default: 24h)
- `page`: page number (default: 1)
- `limit`: results per page (default: 100)

Response:

```json
{
  "success": true,
  "logs": [
    {
      "_id": "...",
      "timestamp": "2025-12-28T10:30:00Z",
      "clientIp": "127.0.0.1",
      "clientId": "token:demo-key",
      "endpoint": "/api/balance",
      "method": "GET",
      "statusCode": 200,
      "responseTimeMs": 12.34,
      "apiToken": "demo-key",
      "userAgent": "curl/7.68.0",
      "authStatus": "authorized"
    }
  ],
  "pagination": { "page": 1, "limit": 100, "total": 250, "pages": 3 }
}
```

#### Get Stats

```
GET /api/logs/stats?timeRange=24h
```

Response:

```json
{
  "success": true,
  "stats": {
    "totalHits": 1250,
    "successRate": 87.2,
    "failedRequests": 162,
    "avgResponseTime": 45
  }
}
```

#### Get Alerts

```
GET /api/alerts?limit=50
```

Response:

```json
{
  "success": true,
  "alerts": [
    {
      "_id": "...",
      "clientId": "ip:192.168.1.100",
      "violationType": "RATE_LIMIT_EXCEEDED",
      "severity": "HIGH",
      "timestamp": "2025-12-28T10:25:00Z",
      "details": { "requestsPerMinute": 145 }
    }
  ]
}
```

#### List Blocked Clients

```
GET /api/blocked
```

Response:

```json
{
  "success": true,
  "blocked": ["ip:192.168.1.100", "token:bad-key"]
}
```

#### Block Client

```
POST /api/blocked
Body: { "clientId": "ip:192.168.1.100" }
```

#### Unblock Client

```
DELETE /api/blocked/ip:192.168.1.100
```

### Protected FinTech APIs

All require `x-api-key` header and respect rate limits.

#### Get Balance

```
GET /api/balance
Headers: x-api-key: demo-key
```

Response:

```json
{
  "accountId": "demo-account",
  "balance": 9950,
  "currency": "USD",
  "clientId": "127.0.0.1"
}
```

#### Process Transaction

```
POST /api/transaction
Headers: x-api-key: demo-key
Body: {
  "type": "debit" | "credit",
  "amount": 50.00,
  "reference": "INV-001"
}
```

Response:

```json
{
  "message": "transaction recorded",
  "entry": {
    "id": "uuid",
    "type": "debit",
    "amount": 50,
    "reference": "INV-001",
    "balanceAfter": 9950,
    "at": "2025-12-28T10:30:00.000Z",
    "clientId": "127.0.0.1"
  }
}
```

#### Get History

```
GET /api/history?limit=20
Headers: x-api-key: demo-key
```

Response:

```json
{
  "accountId": "demo-account",
  "count": 20,
  "items": [
    {
      "id": "uuid",
      "type": "credit",
      "amount": 100,
      "reference": "DEP-001",
      "balanceAfter": 10000,
      "at": "2025-12-28T10:00:00.000Z",
      "clientId": "127.0.0.1"
    }
  ]
}
```

---

## 🌐 Deployment

### Docker (Optional)

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t sentinel .
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://mongo:27017/sentinel \
  -e REDIS_URL=redis://redis:6379 \
  -e API_KEYS=demo-key \
  sentinel
```

### Production Checklist

- [ ] Use strong API keys (not demo-key)
- [ ] Enable MongoDB auth + TLS
- [ ] Enable Redis auth + TLS
- [ ] Set `NODE_ENV=production`
- [ ] Use a process manager (PM2, systemd)
- [ ] Configure CORS if frontend is on different domain
- [ ] Set up log rotation/aggregation
- [ ] Monitor Redis memory usage (no unbounded growth)
- [ ] Consider database indexing on high-volume fields (timestamp, clientId)

---

## 🐛 Troubleshooting

### Backend won't start

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

→ Start MongoDB: `mongod` or check `MONGODB_URI`

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

→ Start Redis: `redis-server` or check `REDIS_URL`

### Frontend not connecting

```
WebSocket error
```

→ Ensure backend is running at correct `BASE_URL`

### Logs not appearing

→ Check `MONGODB_URI` is correct and MongoDB is running
→ Check logs in terminal: `npm start` shows errors

### Rate limiter not working

→ Verify Redis is running: `redis-cli ping` → should return PONG
→ Check `.env` for `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT`

### Alerts not triggering

→ Wait 60+ seconds (detection engine interval)
→ Check detection engine output in terminal
→ Verify thresholds in `src/config/detectionRules.js` are reasonable

---

## 📞 Support & Contribution

For issues, feature requests, or improvements:

1. Open an issue with clear description
2. Include steps to reproduce
3. Attach logs/screenshots if applicable

---

## 📄 License

MIT

---

**Built by the FinTech Security Team** | Sentinel Protocol v1.0.0
