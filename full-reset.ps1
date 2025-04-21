$Green = 'Green'
$Yellow = 'Yellow'
$Red = 'Red'
$Cyan = 'Cyan'

Write-Host "🧹 STARTING COMPLETE PROJECT RESET 🧹" -ForegroundColor $Cyan
Write-Host "=========================================" -ForegroundColor $Cyan

# Step 0: Git operations (optional)
$gitReset = Read-Host "Would you like to reset git to the latest commit? (y/n)"
if ($gitReset -eq "y") {
    Write-Host "Performing git operations..." -ForegroundColor $Yellow
    
    # Check if there are uncommitted changes
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        $saveChanges = Read-Host "You have uncommitted changes. Would you like to stash them? (y/n)"
        if ($saveChanges -eq "y") {
            git stash
            Write-Host "✓ Changes stashed" -ForegroundColor $Green
        }
    }
    
    # Reset to latest commit
    git fetch origin
    
    $branch = git rev-parse --abbrev-ref HEAD
    Write-Host "Current branch: $branch" -ForegroundColor $Yellow
    
    git reset --hard
    git checkout $branch
    git pull origin $branch
    
    Write-Host "✓ Git reset complete. Now at latest commit." -ForegroundColor $Green
}

# Step 1: Clean all build artifacts
Write-Host "Step 1: Cleaning all build artifacts..." -ForegroundColor $Yellow
& .\clean.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to clean build artifacts. Exiting..." -ForegroundColor $Red
    exit 1
}

# Step 2: Fresh node_modules installation
Write-Host "Step 2: Refreshing dependencies..." -ForegroundColor $Yellow
& .\clean-deps.ps1

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to refresh dependencies. Exiting..." -ForegroundColor $Red
    exit 1
}

# Step 3: Check for netlify CLI
Write-Host "Step 3: Checking for Netlify CLI..." -ForegroundColor $Yellow
try {
    netlify -v | Out-Null
    Write-Host "✓ Netlify CLI detected" -ForegroundColor $Green
} catch {
    Write-Host "Netlify CLI not found. Installing globally..." -ForegroundColor $Yellow
    npm install -g netlify-cli
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install Netlify CLI. Please install it manually with 'npm install -g netlify-cli'" -ForegroundColor $Red
        exit 1
    }
    Write-Host "✓ Netlify CLI installed successfully" -ForegroundColor $Green
}

# Step 4: Build the project with fresh settings
Write-Host "Step 4: Building project for Netlify..." -ForegroundColor $Yellow
node netlify-build.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to build project. Exiting..." -ForegroundColor $Red
    exit 1
}

# Step 5: Check Netlify login status
Write-Host "Step 5: Checking Netlify authentication..." -ForegroundColor $Yellow
try {
    netlify status | Out-Null
    Write-Host "✓ Already logged in to Netlify" -ForegroundColor $Green
} catch {
    Write-Host "Please log in to your Netlify account:" -ForegroundColor $Yellow
    netlify login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to log in to Netlify. Please try again manually." -ForegroundColor $Red
        exit 1
    }
    Write-Host "✓ Successfully logged in to Netlify" -ForegroundColor $Green
}

# Step 6: Ask whether to create new site or use existing
$choice = Read-Host "Would you like to create a new Netlify site or use an existing one? (new/existing)"

if ($choice -eq "new") {
    # Create new site
    Write-Host "Creating new Netlify site..." -ForegroundColor $Yellow
    netlify sites:create --manual
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to create new site. Please check the error and try again." -ForegroundColor $Red
        exit 1
    }
    
    # Link to the newly created site
    netlify link
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to link to the site. Please run 'netlify link' manually." -ForegroundColor $Red
        exit 1
    }
} else {
    # List sites to choose from
    Write-Host "Listing your Netlify sites..." -ForegroundColor $Yellow
    netlify sites:list
    
    $siteName = Read-Host "Enter the name of the site you want to deploy to"
    
    if ($siteName -ne "") {
        Write-Host "Linking to site: $siteName" -ForegroundColor $Yellow
        netlify link --name $siteName
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to link to the site. Please check the site name and try again." -ForegroundColor $Red
            exit 1
        }
    } else {
        Write-Host "No site name provided. Please run 'netlify link' manually." -ForegroundColor $Red
        exit 1
    }
}

# Step 7: Deploy with force flag
Write-Host "Step 7: Deploying to Netlify (fresh deployment)..." -ForegroundColor $Yellow
netlify deploy --prod --force

if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed. Please check the logs above." -ForegroundColor $Red
    exit 1
}

Write-Host "=========================================" -ForegroundColor $Cyan
Write-Host "✅ COMPLETE RESET AND DEPLOYMENT SUCCESSFUL!" -ForegroundColor $Green
Write-Host "Your site is now live on Netlify with a completely fresh deployment." -ForegroundColor $Green
Write-Host "All dependencies, cache, and build artifacts were completely refreshed." -ForegroundColor $Green 