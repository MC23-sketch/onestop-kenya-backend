# Quick Start Script for OneStop Kenya Backend

Write-Host "
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 OneStop Kenya Backend - Quick Start                  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Check if .env exists
Write-Host "`n[1/4] Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file not found. Creating from template..." -ForegroundColor Yellow
    Copy-Item "ENV_TEMPLATE.txt" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host "`n⚠️  IMPORTANT: You need to edit .env with your MongoDB connection!" -ForegroundColor Red
    Write-Host "   Opening .env file..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
    notepad .env
    
    Write-Host "`nHave you configured MongoDB connection in .env? (Y/N): " -ForegroundColor Yellow -NoNewline
    $response = Read-Host
    if ($response -ne 'Y' -and $response -ne 'y') {
        Write-Host "`n❌ Please configure MongoDB connection before continuing." -ForegroundColor Red
        Write-Host "   Get free MongoDB Atlas at: https://www.mongodb.com/cloud/atlas" -ForegroundColor Cyan
        exit 1
    }
}

# Check if node_modules exists
Write-Host "`n[2/4] Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "📦 Installing dependencies... (this may take a few minutes)" -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Test MongoDB connection (optional)
Write-Host "`n[3/4] Ready to start server!" -ForegroundColor Yellow
Write-Host "   Make sure MongoDB is accessible..." -ForegroundColor White

# Ask to start server
Write-Host "`n[4/4] Start development server now? (Y/N): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host "`n
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Starting OneStop Kenya API Server                    ║
║                                                            ║
║   API will be available at: http://localhost:5000         ║
║   Health Check: http://localhost:5000/health              ║
║                                                            ║
║   Press Ctrl+C to stop the server                         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    " -ForegroundColor Green
    
    Start-Sleep -Seconds 2
    npm run dev
} else {
    Write-Host "`n
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ✅ Setup Complete!                                       ║
║                                                            ║
║   To start the server manually, run:                       ║
║   npm run dev                                              ║
║                                                            ║
║   Or run this script again:                                ║
║   .\quick-start.ps1                                        ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    " -ForegroundColor Green
}

