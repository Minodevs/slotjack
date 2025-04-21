# Deep cleaning script to remove ALL deployment artifacts
# This script removes all build outputs, caches, and deployment files

$Green = 'Green'
$Yellow = 'Yellow'
$Red = 'Red'
$Cyan = 'Cyan'

Write-Host "Starting DEEP CLEANING process..." -ForegroundColor $Cyan
Write-Host "------------------------------------------" -ForegroundColor $Cyan

# List of directories to clean
$dirsToClean = @(
    '.next',
    'out',
    '.vercel',
    '.netlify',
    'node_modules\.cache',
    'deployment',
    '.turbo',
    'build',
    'dist',
    '.serverless'
)

# Clean directories
foreach ($dir in $dirsToClean) {
    if (Test-Path $dir) { 
        Write-Host "Removing $dir..." -ForegroundColor $Yellow
        Remove-Item -Recurse -Force $dir
        Write-Host "✓ Removed $dir" -ForegroundColor $Green
    }
}

# List of files to clean
$filesToClean = @(
    '.vercel\*.json',
    '.netlify\*.json',
    'build-info.json',
    '.env.local',
    '.env.development.local',
    '.env.production.local',
    'public\sitemap*.xml',
    'public\robots.txt'
)

# Clean files
foreach ($filePattern in $filesToClean) {
    if (Test-Path $filePattern) {
        $files = Get-ChildItem -Path $filePattern
        foreach ($file in $files) {
            Write-Host "Removing $($file.FullName)..." -ForegroundColor $Yellow
            Remove-Item -Force $file.FullName
            Write-Host "✓ Removed $($file.FullName)" -ForegroundColor $Green
        }
    }
}

# Clean npm cache (optional but thorough)
Write-Host "Cleaning npm cache..." -ForegroundColor $Yellow
npm cache clean --force

# Remove Netlify link if exists
Write-Host "Checking for Netlify site link..." -ForegroundColor $Yellow
if (Test-Path ".netlify\state.json") {
    Write-Host "Removing Netlify site link..." -ForegroundColor $Yellow
    Remove-Item -Force ".netlify\state.json"
    Write-Host "✓ Removed Netlify site link" -ForegroundColor $Green
}

# Check for any invisible temp files
Write-Host "Checking for temporary files..." -ForegroundColor $Yellow
$tempFiles = Get-ChildItem -Hidden -File -Filter "*.tmp" -Recurse -ErrorAction SilentlyContinue
if ($tempFiles) {
    foreach ($file in $tempFiles) {
        Write-Host "Removing $($file.FullName)..." -ForegroundColor $Yellow
        Remove-Item -Force $file.FullName
        Write-Host "✓ Removed $($file.FullName)" -ForegroundColor $Green
    }
}

# Clean git index.lock if it exists
if (Test-Path ".git\index.lock") {
    Write-Host "Removing git index.lock..." -ForegroundColor $Yellow
    Remove-Item -Force ".git\index.lock"
    Write-Host "✓ Removed git index.lock" -ForegroundColor $Green
}

Write-Host ""
Write-Host "✅ DEEP CLEANING COMPLETE!" -ForegroundColor $Green
Write-Host "Your project is now in a pristine state with all deployment artifacts removed." -ForegroundColor $Green
Write-Host ""
Write-Host "To prepare for a fresh Netlify deployment, run:" -ForegroundColor $Cyan
Write-Host "npm run netlify:fresh-start" -ForegroundColor $Cyan 