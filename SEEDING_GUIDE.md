# Seeding Dummy Data to MongoDB

## Quick Start (if you have MongoDB Atlas credentials):

### 1. Update `.env` with your MongoDB URI:

```
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.xxxxx.mongodb.net/finnathon
PORT=5000
```

### 2. Run the seeding script:

```powershell
npm run seed
```

This will:

- ✅ Generate 200 realistic dummy API logs
- ✅ Generate 50 dummy alerts with various severity levels
- ✅ Insert them into MongoDB
- ✅ Display statistics

### 3. Then run your server and dashboard:

```powershell
npm run dev
```

Visit: http://localhost:3000

---

## What the Dummy Data Includes:

### API Logs (200 entries):

- **Endpoints**: /api/balance, /api/transaction, /api/history, /api/health, /api/account, etc.
- **Methods**: GET, POST, PUT, DELETE, PATCH
- **Status Codes**:
  - 85% Success (200-204)
  - 10% Client Errors (400-407)
  - 5% Server Errors (500-504)
- **Response Times**: 10ms - 2010ms (random)
- **IP Addresses**: Various realistic IPs
- **Timestamps**: Spread across last 24 hours

### Alerts (50 entries):

- **Types**: HIGH_LATENCY, HIGH_ERROR_RATE, UNUSUAL_TRAFFIC, RATE_LIMIT, SECURITY_ALERT
- **Severities**: low, medium, high, critical
- **30% marked as resolved**

---

## Getting MongoDB Atlas Credentials:

1. Go to **https://atlas.mongodb.com**
2. Create a free account or log in
3. Create a cluster (takes 5-10 minutes)
4. Go to **Security** → **Database Access** → **Create Database User**
   - Username: (e.g., `finnathon_user`)
   - Password: (auto-generate)
   - Copy the password
5. Go to **Network Access** → **Add IP Address** → **Allow From Anywhere** (0.0.0.0/0)
6. Go to **Clusters** → **Connect** → **Drivers** → **Copy Connection String**
7. Replace `<username>` and `<password>` with your credentials
8. Update `.env` file

---

## Example MongoDB URI:

```
MONGODB_URI=mongodb+srv://finnathon_user:Abc123XyZ@cluster0.abcd1234.mongodb.net/finnathon?retryWrites=true&w=majority
```

Once set up, run `npm run seed` to populate with dummy data!
