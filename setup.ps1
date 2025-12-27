# Admin Dashboard Quick Start Script
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Admin Dashboard Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host ""
    Write-Host "Warning: .env file not found!" -ForegroundColor Red
    Write-Host "Creating .env template..." -ForegroundColor Yellow
    
    $envContent = @"
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string_here

# Server Port
PORT=5000

# Redis (already configured with cloud Redis in src/lib/redisClient.js)
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✓ Created .env file - Please update MONGODB_URI" -ForegroundColor Green
}

# Build frontend if public folder doesn't exist or is empty
if (-not (Test-Path "public/assets") -or (Get-ChildItem "public/assets" -ErrorAction SilentlyContinue).Count -eq 0) {
    Write-Host ""
    Write-Host "Building React frontend..." -ForegroundColor Yellow
    npm run build:frontend
    Write-Host "✓ Frontend built successfully" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the server, run:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open your browser to:" -ForegroundColor Yellow
Write-Host "  http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "For development mode (with hot-reload):" -ForegroundColor Yellow
Write-Host "  Terminal 1: npm run dev:frontend" -ForegroundColor White
Write-Host "  Terminal 2: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Dashboard Features:" -ForegroundColor Cyan
Write-Host "  ✓ Real-time API monitoring" -ForegroundColor White
Write-Host "  ✓ Interactive charts" -ForegroundColor White
Write-Host "  ✓ Advanced filtering" -ForegroundColor White
Write-Host "  ✓ Live updates via WebSocket" -ForegroundColor White
Write-Host "  ✓ Export logs to JSON" -ForegroundColor White
Write-Host ""
Write-Host "Need help? Check:" -ForegroundColor Cyan
Write-Host "  - ADMIN_DASHBOARD_README.md" -ForegroundColor White
Write-Host "  - REDIS_SETUP.md" -ForegroundColor White
Write-Host ""
