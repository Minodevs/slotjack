# PowerShell script for fresh Netlify deployment
# This script deletes old deployments and starts fresh

# Colors for output
$Green = 'Green'
$Yellow = 'Yellow'
$Red = 'Red'
$Cyan = 'Cyan'

Write-Host "Starting Fresh Netlify Deployment Process..." -ForegroundColor $Cyan
Write-Host "------------------------------------------" -ForegroundColor $Cyan

# Check if Netlify CLI is installed
try {
    netlify -v | Out-Null
    Write-Host "✓ Netlify CLI detected" -ForegroundColor $Green
} catch {
    Write-Host "Netlify CLI not found. Installing..." -ForegroundColor $Yellow
    npm install -g netlify-cli
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install Netlify CLI. Please install it manually with 'npm install -g netlify-cli'" -ForegroundColor $Red
        exit 1
    }
    Write-Host "✓ Netlify CLI installed successfully" -ForegroundColor $Green
}

# Login to Netlify
try {
    Write-Host "Checking Netlify authentication..." -ForegroundColor $Yellow
    netlify status | Out-Null
    Write-Host "✓ Already logged in to Netlify" -ForegroundColor $Green
} catch {
    Write-Host "Please log in to your Netlify account:" -ForegroundColor $Yellow
    netlify login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to log in to Netlify. Please try again." -ForegroundColor $Red
        exit 1
    }
    Write-Host "✓ Successfully logged in to Netlify" -ForegroundColor $Green
}

# List sites to choose which one to delete/redeploy
Write-Host "Fetching your Netlify sites..." -ForegroundColor $Yellow
netlify sites:list

# Prompt for site name to delete/redeploy
$siteName = Read-Host "Enter the name of the site you want to delete and redeploy (leave blank to create a new site)"

if ($siteName -ne "") {
    # Delete the site
    Write-Host "Preparing to delete site: $siteName" -ForegroundColor $Yellow
    Write-Host "WARNING: This will permanently delete the site and all its deployments!" -ForegroundColor $Red
    $confirmation = Read-Host "Are you sure you want to delete this site? Type 'YES' to confirm"
    
    if ($confirmation -eq "YES") {
        Write-Host "Deleting site: $siteName..." -ForegroundColor $Yellow
        netlify sites:delete $siteName --force
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to delete the site. Continuing with new deployment..." -ForegroundColor $Yellow
        } else {
            Write-Host "✓ Site deleted successfully" -ForegroundColor $Green
        }
    } else {
        Write-Host "Site deletion cancelled. Continuing with new deployment..." -ForegroundColor $Yellow
    }
}

# Clean local build files
Write-Host "Cleaning local build files..." -ForegroundColor $Yellow
if (Test-Path .next) { 
    Remove-Item -Recurse -Force .next 
    Write-Host "✓ Removed .next directory" -ForegroundColor $Green
}
if (Test-Path node_modules\.cache) { 
    Remove-Item -Recurse -Force node_modules\.cache 
    Write-Host "✓ Cleared build cache" -ForegroundColor $Green
}
if (Test-Path out) { 
    Remove-Item -Recurse -Force out 
    Write-Host "✓ Removed out directory" -ForegroundColor $Green
}

# Run the build script with extra verbosity
Write-Host "Building project for fresh Netlify deployment..." -ForegroundColor $Cyan
Write-Host "------------------------------------------" -ForegroundColor $Cyan

# Set environment variables for build
$env:NETLIFY_FRESH_DEPLOY = "true"
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NEXT_SKIP_ESLINT_DURING_BUILD = "true" 
$env:NEXT_SKIP_TYPE_CHECK = "true"
$env:NEXT_EXPORT = "true"
$env:NODE_ENV = "production"

# Run the build
node build-for-netlify.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Please check the logs above." -ForegroundColor $Red
    exit 1
}

Write-Host "✓ Build completed successfully" -ForegroundColor $Green

# Initialize new site if needed
if ($siteName -eq "") {
    Write-Host "Creating new Netlify site from scratch..." -ForegroundColor $Yellow
    netlify sites:create --manual
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to create new site. Please create it manually via the Netlify dashboard." -ForegroundColor $Red
        exit 1
    }
    
    # Link to the newly created site
    netlify link
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to link to the site. Please run 'netlify link' manually." -ForegroundColor $Red
        exit 1
    }
}

# Deploy with force flag
Write-Host "Deploying to Netlify (fresh deployment)..." -ForegroundColor $Cyan
Write-Host "------------------------------------------" -ForegroundColor $Cyan
netlify deploy --prod --force

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed. Please check the logs above." -ForegroundColor $Red
    exit 1
}

Write-Host "✓ Fresh deployment completed successfully!" -ForegroundColor $Green
Write-Host "Your site is now live on Netlify with a completely fresh deployment." -ForegroundColor $Green 