# Script to push OneStop Kenya Backend to GitHub

Write-Host "
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   📤 Push to GitHub - OneStop Kenya Backend               ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git repository not initialized!" -ForegroundColor Red
    Write-Host "Run: git init" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n📋 Before we begin, make sure you have:" -ForegroundColor Yellow
Write-Host "   1. Created a GitHub repository" -ForegroundColor White
Write-Host "   2. Have your GitHub repository URL ready" -ForegroundColor White
Write-Host ""

# Get GitHub username
Write-Host "Enter your GitHub username: " -ForegroundColor Green -NoNewline
$githubUsername = Read-Host

# Get repository name
Write-Host "Enter your repository name (default: onestop-kenya-backend): " -ForegroundColor Green -NoNewline
$repoName = Read-Host
if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "onestop-kenya-backend"
}

$repoUrl = "https://github.com/$githubUsername/$repoName.git"

Write-Host "`n📍 Repository URL: $repoUrl" -ForegroundColor Cyan

# Check if remote already exists
$remoteExists = git remote -v | Select-String "origin"

if ($remoteExists) {
    Write-Host "`n⚠️  Remote 'origin' already exists. Updating..." -ForegroundColor Yellow
    git remote set-url origin $repoUrl
} else {
    Write-Host "`n➕ Adding remote 'origin'..." -ForegroundColor Green
    git remote add origin $repoUrl
}

# Rename branch to main if needed
Write-Host "`n🔄 Ensuring branch is named 'main'..." -ForegroundColor Green
git branch -M main

# Push to GitHub
Write-Host "`n📤 Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ✅ Successfully pushed to GitHub!                       ║
║                                                            ║
║   🌐 View your repository at:                             ║
║   https://github.com/$githubUsername/$repoName
║                                                            ║
║   📚 Next Steps:                                           ║
║   1. Set up MongoDB Atlas (see DEPLOYMENT_GUIDE.md)       ║
║   2. Deploy to Vercel                                      ║
║   3. Configure environment variables                       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    " -ForegroundColor Green
} else {
    Write-Host "
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   ❌ Push failed!                                          ║
║                                                            ║
║   Common issues:                                           ║
║   - Repository doesn't exist on GitHub                     ║
║   - Authentication failed                                  ║
║   - No internet connection                                 ║
║                                                            ║
║   💡 Tip: Make sure you've created the repository on      ║
║   GitHub first: https://github.com/new                     ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    " -ForegroundColor Red
}

Write-Host "`nPress Enter to exit..." -NoNewline
Read-Host

