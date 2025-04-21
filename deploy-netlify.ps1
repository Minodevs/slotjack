# PowerShell script for Netlify deployment

# Colors for output
$Green = 'Green'
$Yellow = 'Yellow'
$Red = 'Red'

Write-Host "Starting Netlify deployment process..." -ForegroundColor $Yellow

# Check if Netlify CLI is installed
try {
    netlify -v | Out-Null
} catch {
    Write-Host "Netlify CLI not found. Installing..." -ForegroundColor $Yellow
    npm install -g netlify-cli
}

# Clean and build
Write-Host "Cleaning previous builds..." -ForegroundColor $Yellow
if (Test-Path .next) { Remove-Item -Recurse -Force .next }
if (Test-Path node_modules\.cache) { Remove-Item -Recurse -Force node_modules\.cache }

# Run the build script
Write-Host "Building project for Netlify..." -ForegroundColor $Yellow
node build-for-netlify.js

# Check if build succeeded
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor $Green
    
    # Login to Netlify if needed
    try {
        netlify status | Out-Null
    } catch {
        netlify login
    }
    
    # Deploy to Netlify
    Write-Host "Deploying to Netlify..." -ForegroundColor $Yellow
    netlify deploy --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Deployment successful!" -ForegroundColor $Green
        Write-Host "Your site is now live on Netlify!" -ForegroundColor $Green
    } else {
        Write-Host "Deployment failed." -ForegroundColor $Red
        exit 1
    }
} else {
    Write-Host "Build failed. Please check the logs above." -ForegroundColor $Red
    exit 1
} 