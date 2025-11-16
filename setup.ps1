# OneStop Kenya Backend Setup Script
# This script will help you set up the backend quickly

Write-Host "
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 OneStop Kenya Backend Setup                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Check if Node.js is installed
Write-Host "`n[1/5] Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if MongoDB is installed or accessible
Write-Host "`n[2/5] Checking MongoDB..." -ForegroundColor Yellow
Write-Host "⚠️  Make sure MongoDB is running or you have a MongoDB Atlas connection string" -ForegroundColor Yellow

# Install dependencies
Write-Host "`n[3/5] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
Write-Host "`n[4/5] Setting up environment variables..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "⚠️  .env file already exists. Skipping..." -ForegroundColor Yellow
} else {
    Copy-Item "ENV_TEMPLATE.txt" ".env"
    Write-Host "✅ Created .env file from template" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit .env file with your actual configuration!" -ForegroundColor Yellow
}

# Summary
Write-Host "`n[5/5] Setup Complete! 🎉" -ForegroundColor Green
Write-Host "
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ✅ Backend setup completed successfully!                ║
║                                                            ║
║   Next Steps:                                              ║
║   1. Edit .env file with your configuration                ║
║   2. Make sure MongoDB is running                          ║
║   3. Run: npm run dev                                      ║
║                                                            ║
║   📚 Check QUICK_START.md for detailed instructions       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

Write-Host "`nWould you like to open the .env file now? (Y/N): " -ForegroundColor Yellow -NoNewline
$response = Read-Host
if ($response -eq 'Y' -or $response -eq 'y') {
    notepad .env
}

Write-Host "`nWould you like to start the development server now? (Y/N): " -ForegroundColor Yellow -NoNewline
$response = Read-Host
if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host "`n🚀 Starting development server..." -ForegroundColor Cyan
    npm run dev
}

