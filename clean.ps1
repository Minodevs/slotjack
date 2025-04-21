Write-Host "Starting deep cleaning process..." -ForegroundColor Cyan

# Clean .next directory
if (Test-Path ".next") {
    Write-Host "Removing .next directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".next"
    Write-Host "Removed .next directory" -ForegroundColor Green
}

# Clean out directory
if (Test-Path "out") {
    Write-Host "Removing out directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "out"
    Write-Host "Removed out directory" -ForegroundColor Green
}

# Clean .vercel directory
if (Test-Path ".vercel") {
    Write-Host "Removing .vercel directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".vercel"
    Write-Host "Removed .vercel directory" -ForegroundColor Green
}

# Clean .netlify directory
if (Test-Path ".netlify") {
    Write-Host "Removing .netlify directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".netlify"
    Write-Host "Removed .netlify directory" -ForegroundColor Green
}

# Clean node_modules\.cache directory
if (Test-Path "node_modules\.cache") {
    Write-Host "Removing node_modules\.cache directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "Removed node_modules\.cache directory" -ForegroundColor Green
}

# Clean deployment directory
if (Test-Path "deployment") {
    Write-Host "Removing deployment directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "deployment"
    Write-Host "Removed deployment directory" -ForegroundColor Green
}

# Clean npm cache
Write-Host "Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force

Write-Host "Deep cleaning completed!" -ForegroundColor Green
Write-Host "Your project is now in a clean state." -ForegroundColor Green 