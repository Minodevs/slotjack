Write-Host "Starting complete dependency refresh..." -ForegroundColor Cyan
Write-Host "------------------------------------------" -ForegroundColor Cyan

# First, clean node_modules
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules"
    Write-Host "✓ Removed node_modules directory" -ForegroundColor Green
}

# Clean package-lock.json
if (Test-Path "package-lock.json") {
    Write-Host "Removing package-lock.json..." -ForegroundColor Yellow
    Remove-Item -Force "package-lock.json"
    Write-Host "✓ Removed package-lock.json" -ForegroundColor Green
}

# Clean npm cache
Write-Host "Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "✓ Cleaned npm cache" -ForegroundColor Green

# Install dependencies fresh
Write-Host "Installing dependencies from scratch..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Successfully installed fresh dependencies" -ForegroundColor Green
} else {
    Write-Host "× Failed to install dependencies. Please check for errors." -ForegroundColor Red
    exit 1
}

Write-Host "------------------------------------------" -ForegroundColor Cyan
Write-Host "✅ Dependency refresh complete!" -ForegroundColor Green
Write-Host "node_modules and package-lock.json are now in a pristine state." -ForegroundColor Green 