$Green = 'Green'
$Yellow = 'Yellow'
$Red = 'Red'
$Cyan = 'Cyan'

Write-Host "🔄 GIT RESET AND RETRY DEPLOYMENT 🔄" -ForegroundColor $Cyan
Write-Host "=========================================" -ForegroundColor $Cyan

# Step 1: Git reset
Write-Host "Step 1: Resetting git repository..." -ForegroundColor $Yellow

# Check if there are uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "You have uncommitted changes:" -ForegroundColor $Yellow
    git status --short
    
    $saveChanges = Read-Host "Would you like to stash these changes? (y/n)"
    if ($saveChanges -eq "y") {
        git stash save "Auto-stashed before reset and deploy"
        Write-Host "✓ Changes stashed" -ForegroundColor $Green
    } else {
        $forceContinue = Read-Host "Continue anyway? Changes will be lost! (y/n)"
        if ($forceContinue -ne "y") {
            Write-Host "Operation cancelled by user." -ForegroundColor $Yellow
            exit 0
        }
    }
}

# Fetch latest changes
Write-Host "Fetching latest changes from remote..." -ForegroundColor $Yellow
git fetch origin

# Get current branch
$branch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $branch" -ForegroundColor $Yellow

# Hard reset to match remote
Write-Host "Resetting to latest remote commit..." -ForegroundColor $Yellow
git reset --hard origin/$branch

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to reset to remote. Trying local branch reset..." -ForegroundColor $Yellow
    git reset --hard
}

# Clean any untracked files
Write-Host "Cleaning untracked files..." -ForegroundColor $Yellow
git clean -fd

Write-Host "✓ Git reset complete" -ForegroundColor $Green

# Step 2: Clean build artifacts
Write-Host "Step 2: Cleaning build artifacts..." -ForegroundColor $Yellow
& .\clean.ps1

# Step 3: Reinstall dependencies
$reinstallDeps = Read-Host "Would you like to reinstall dependencies? (y/n)"
if ($reinstallDeps -eq "y") {
    Write-Host "Step 3: Reinstalling dependencies..." -ForegroundColor $Yellow
    & .\clean-deps.ps1
} else {
    Write-Host "Skipping dependency reinstallation." -ForegroundColor $Yellow
}

# Step 4: Build the project
Write-Host "Step 4: Building project for Netlify..." -ForegroundColor $Yellow
node netlify-build.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Would you like to try again with clean dependencies? (y/n)" -ForegroundColor $Red
    $retryBuild = Read-Host
    
    if ($retryBuild -eq "y") {
        & .\clean-deps.ps1
        node netlify-build.js
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Build failed again. Exiting..." -ForegroundColor $Red
            exit 1
        }
    } else {
        Write-Host "Exiting due to build failure." -ForegroundColor $Red
        exit 1
    }
}

# Step 5: Deploy to Netlify
Write-Host "Step 5: Deploying to Netlify..." -ForegroundColor $Yellow

# Check if there's an existing site link
if (Test-Path ".netlify\state.json") {
    Write-Host "Found existing Netlify site configuration." -ForegroundColor $Green
    $deployChoice = Read-Host "Deploy to same site? (y/n)"
    
    if ($deployChoice -ne "y") {
        # Remove the link
        Remove-Item -Force ".netlify\state.json"
        Write-Host "Please link to a new site:" -ForegroundColor $Yellow
        netlify link
    }
} else {
    Write-Host "No Netlify site configuration found. Please link to a site:" -ForegroundColor $Yellow
    netlify link
}

# Deploy with force flag
Write-Host "Deploying with force flag (fresh deployment)..." -ForegroundColor $Yellow
netlify deploy --prod --force

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed. Please check the logs above." -ForegroundColor $Red
    exit 1
}

Write-Host "=========================================" -ForegroundColor $Cyan
Write-Host "✅ GIT RESET AND REDEPLOYMENT SUCCESSFUL!" -ForegroundColor $Green
Write-Host "Your site is now live on Netlify with the latest code." -ForegroundColor $Green 