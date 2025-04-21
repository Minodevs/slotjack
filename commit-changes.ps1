$Green = 'Green'
$Yellow = 'Yellow'
$Red = 'Red'
$Cyan = 'Cyan'

Write-Host "🚀 COMMITTING CHANGES AND PUSHING TO BRANCH 🚀" -ForegroundColor $Cyan
Write-Host "=========================================" -ForegroundColor $Cyan

# Get current branch
$branch = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $branch" -ForegroundColor $Yellow

# Check for uncommitted changes
$gitStatus = git status --porcelain
if (!$gitStatus) {
    Write-Host "No changes to commit. Everything is up to date." -ForegroundColor $Green
    exit 0
}

# Show uncommitted changes
Write-Host "Changes to be committed:" -ForegroundColor $Yellow
git status --short

# Confirm commit
$confirmCommit = Read-Host "Do you want to commit all these changes? (y/n)"
if ($confirmCommit -ne "y") {
    Write-Host "Operation cancelled by user." -ForegroundColor $Yellow
    exit 0
}

# Get commit message
$commitMessage = Read-Host "Enter commit message"
if (!$commitMessage) {
    $commitMessage = "Update deployment configuration and scripts"
}

# Add all changes
Write-Host "Adding all changes..." -ForegroundColor $Yellow
git add .

# Commit changes
Write-Host "Committing changes..." -ForegroundColor $Yellow
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to commit changes. Please check the error and try again." -ForegroundColor $Red
    exit 1
}

# Push to remote
Write-Host "Pushing to remote branch $branch..." -ForegroundColor $Yellow
git push origin $branch

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to push changes. Trying to pull first..." -ForegroundColor $Yellow
    git pull origin $branch
    git push origin $branch
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to push changes again. Please check the error and try manually." -ForegroundColor $Red
        exit 1
    }
}

Write-Host "=========================================" -ForegroundColor $Cyan
Write-Host "✅ CHANGES COMMITTED AND PUSHED SUCCESSFULLY!" -ForegroundColor $Green
Write-Host "Your branch $branch is now up to date with all changes." -ForegroundColor $Green 