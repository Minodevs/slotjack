#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const BUILD_DIR = '.next';
const DEPLOYMENT_DIR = 'deployment';

console.log('📦 Starting Netlify build process...');

// Clean previous builds
console.log('🧹 Cleaning previous builds...');
try {
  // Use PowerShell for Windows compatibility
  execSync('if (Test-Path .next) { Remove-Item -Recurse -Force .next }', { shell: 'powershell.exe' });
  console.log('✅ Cleaned .next directory');
} catch (error) {
  console.error('Failed to clean .next directory:', error);
}

// Run Next.js build (skip eslint)
console.log('🏗️ Building Next.js application...');
try {
  // Set environment variables to skip TypeScript and ESLint checks
  const env = {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: '1',
    NEXT_SKIP_ESLINT_DURING_BUILD: 'true',
    NEXT_SKIP_TYPE_CHECK: 'true',
  };
  
  execSync('next build', { stdio: 'inherit', env });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

// Create the deployment directory if it doesn't exist
console.log('📂 Setting up deployment directory...');
if (!fs.existsSync(DEPLOYMENT_DIR)) {
  fs.mkdirSync(DEPLOYMENT_DIR, { recursive: true });
}

// Copy necessary files to deployment directory
console.log('📋 Copying files to deployment directory...');
try {
  // Use PowerShell for Windows compatibility
  execSync(`if (Test-Path ${BUILD_DIR}) { Copy-Item -Path ${BUILD_DIR}/* -Destination ${DEPLOYMENT_DIR}/ -Recurse -Force }`, 
    { shell: 'powershell.exe' });
  
  // Copy other necessary files
  const filesToCopy = [
    'netlify.toml',
    '.nvmrc',
    'package.json',
    'package-lock.json',
    'next.config.js'
  ];
  
  for (const file of filesToCopy) {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(DEPLOYMENT_DIR, file));
      console.log(`Copied ${file} to ${DEPLOYMENT_DIR}`);
    }
  }
  
  console.log('✅ Files copied successfully');
} catch (error) {
  console.error('❌ Copy failed:', error);
  process.exit(1);
}

console.log('🚀 Netlify build ready for deployment!');
console.log(`📁 Deployment folder: ${DEPLOYMENT_DIR}`);
console.log('Run "npm run deploy" to deploy to Netlify'); 