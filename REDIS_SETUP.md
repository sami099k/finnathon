# Redis Setup for Windows

## Option 1: Using Cloud Redis (Already Configured)

The project is already configured to use a cloud-hosted Redis instance in `src/lib/redisClient.js`. No local setup required!

## Option 2: Install Redis Locally on Windows

### Method 1: Using Windows Subsystem for Linux (WSL) - Recommended

1. **Enable WSL**:

   ```powershell
   wsl --install
   ```

2. **Install Ubuntu** from Microsoft Store

3. **Install Redis in WSL**:

   ```bash
   sudo apt update
   sudo apt install redis-server
   sudo service redis-server start
   ```

4. **Update Redis Client Configuration**:
   Edit `src/lib/redisClient.js` to connect to local Redis:
   ```javascript
   const redis = createClient({
     url: "redis://localhost:6379",
   });
   ```

### Method 2: Using Docker Desktop

1. **Install Docker Desktop** from https://www.docker.com/products/docker-desktop

2. **Run Redis Container**:

   ```powershell
   docker run -d -p 6379:6379 --name redis redis:alpine
   ```

3. **Update Redis Client Configuration** as shown above

### Method 3: Using Redis on Windows (Memurai)

1. **Download Memurai** (Redis-compatible for Windows):
   https://www.memurai.com/get-memurai

2. **Install and start** Memurai service

3. **Update Redis Client Configuration** to connect to `localhost:6379`

## Verify Redis Connection

Test Redis connection:

```powershell
npm run dev
```

Look for "Redis connected" message in the console.
