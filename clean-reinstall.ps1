Write-Host "Starting clean reinstall process..." -ForegroundColor Green

# Stop any running Next.js processes
Write-Host "Stopping any running Next.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*\node.exe"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Remove .next cache directory
if (Test-Path ".next") {
    Write-Host "Removing .next directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
}

# Make a temporary backup of package.json and package-lock.json
Write-Host "Backing up package files..." -ForegroundColor Yellow
Copy-Item -Path "package.json" -Destination "package.json.bak" -Force
if (Test-Path "package-lock.json") {
    Copy-Item -Path "package-lock.json" -Destination "package-lock.json.bak" -Force
}

# Try to clean npm cache
Write-Host "Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Install Next.js and essential dependencies first
Write-Host "Installing Next.js and essential dependencies..." -ForegroundColor Green
npm install next@latest react@latest react-dom@latest

# Then install the rest of the dependencies
Write-Host "Installing remaining dependencies..." -ForegroundColor Green
npm install

# Verify installation
Write-Host "Verifying Next.js installation..." -ForegroundColor Yellow
npx next --version

Write-Host "Clean reinstall process completed!" -ForegroundColor Green
Write-Host "You can now run 'npm run dev' to start the development server." -ForegroundColor Green 