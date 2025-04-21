#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting enhanced Netlify build process...');

// Check if this is a fresh deployment
const isFreshDeploy = process.env.NETLIFY_FRESH_DEPLOY === 'true';
if (isFreshDeploy) {
  console.log('🔄 FRESH DEPLOYMENT MODE ACTIVATED');
  console.log('This build will completely replace any existing deployment');
}

// Set critical environment variables
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';
process.env.NEXT_PUBLIC_DEPLOY_ENV = 'production';
process.env.NEXT_EXPORT = 'true';
process.env.NEXT_SKIP_ESLINT_DURING_BUILD = 'true';
process.env.NEXT_SKIP_TYPE_CHECK = 'true';

// Display build information
console.log(`Node version: ${process.version}`);
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Platform: ${process.platform}`);

// Ensure .next directory is clean
try {
  console.log('🧹 Cleaning previous build artifacts...');
  if (fs.existsSync('.next')) {
    if (process.platform === 'win32') {
      execSync('if exist .next rd /s /q .next', { stdio: 'inherit' });
    } else {
      execSync('rm -rf .next', { stdio: 'inherit' });
    }
  }
  
  // Clean cache
  console.log('🧹 Cleaning build cache...');
  const cachePath = path.join('node_modules', '.cache');
  if (fs.existsSync(cachePath)) {
    if (process.platform === 'win32') {
      execSync(`if exist "${cachePath}" rd /s /q "${cachePath}"`, { stdio: 'inherit' });
    } else {
      execSync(`rm -rf "${cachePath}"`, { stdio: 'inherit' });
    }
  }

  // Build Next.js app
  console.log('🔨 Building Next.js application for Netlify...');
  execSync('next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_EXPORT: 'true',
      NETLIFY: 'true'
    }
  });

  // Generate sitemap
  console.log('🗺️ Generating sitemap...');
  execSync('next-sitemap', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully for Netlify deployment');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Create the deployment directory if it doesn't exist
console.log('📂 Setting up deployment directory...');
const DEPLOYMENT_DIR = 'deployment';
if (!fs.existsSync(DEPLOYMENT_DIR)) {
  fs.mkdirSync(DEPLOYMENT_DIR, { recursive: true });
}

// Copy necessary files to deployment directory
console.log('📋 Copying files to deployment directory...');
try {
  // Use PowerShell for Windows compatibility
  execSync(`if (Test-Path .next) { Copy-Item -Path .next/* -Destination ${DEPLOYMENT_DIR}/ -Recurse -Force }`, 
    { shell: 'powershell.exe' });
  
  // Copy public folder to ensure all static assets are included
  execSync(`if (Test-Path public) { Copy-Item -Path public/* -Destination ${DEPLOYMENT_DIR}/ -Recurse -Force }`, 
    { shell: 'powershell.exe' });
  
  // Copy additional files needed for Netlify
  const filesToCopy = [
    'netlify.toml',
    '.nvmrc',
    'package.json',
    'package-lock.json',
    'next.config.js',
    'public/robots.txt',
    'public/sitemap.xml',
    'public/sitemap-0.xml'
  ];
  
  for (const file of filesToCopy) {
    if (fs.existsSync(file)) {
      // Create directory structure if needed
      const targetPath = path.join(DEPLOYMENT_DIR, file);
      const targetDir = path.dirname(targetPath);
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      fs.copyFileSync(file, targetPath);
      console.log(`Copied ${file} to ${targetPath}`);
    }
  }
  
  console.log('✅ Files copied successfully');
  
  // Create a verification file to ensure the build is fresh
  const buildInfo = {
    timestamp: new Date().toISOString(),
    commit: process.env.COMMIT_REF || 'local-build',
    buildId: Math.random().toString(36).substring(2, 15)
  };
  
  fs.writeFileSync(
    path.join(DEPLOYMENT_DIR, 'build-info.json'), 
    JSON.stringify(buildInfo, null, 2)
  );
  
} catch (error) {
  console.error('❌ Copy failed:', error);
  process.exit(1);
}

console.log('🚀 Netlify build ready for deployment!');
console.log(`📁 Deployment folder: ${DEPLOYMENT_DIR}`);
console.log('Run "npm run deploy" to deploy to Netlify'); 