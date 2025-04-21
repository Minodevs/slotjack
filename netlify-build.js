#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const BUILD_DIR = '.next';
const DEPLOYMENT_DIR = 'deployment';

console.log('🚀 Starting FRESH Netlify build process...');
console.log('This is a complete reset of all previous deployments');

// Set critical environment variables
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';
process.env.NEXT_PUBLIC_DEPLOY_ENV = 'production';
process.env.NEXT_EXPORT = 'true';
process.env.NEXT_SKIP_ESLINT_DURING_BUILD = 'true';
process.env.NEXT_SKIP_TYPE_CHECK = 'true';
process.env.FRESH_DEPLOY = 'true';  // Flag to indicate a fresh deploy

// Display build information
console.log(`Node version: ${process.version}`);
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Platform: ${process.platform}`);

// Deep clean previous builds
console.log('🧹 Deep cleaning previous builds...');

// Clean build directories
const dirsToClean = [BUILD_DIR, 'out', 'build', 'dist', DEPLOYMENT_DIR, path.join('node_modules', '.cache')];
for (const dir of dirsToClean) {
  if (fs.existsSync(dir)) {
    try {
      if (process.platform === 'win32') {
        execSync(`if exist "${dir}" rd /s /q "${dir}"`, { stdio: 'inherit' });
      } else {
        execSync(`rm -rf "${dir}"`, { stdio: 'inherit' });
      }
      console.log(`✅ Removed ${dir}`);
    } catch (error) {
      console.error(`Failed to remove ${dir}:`, error.message);
    }
  }
}

// Run Next.js build
console.log('🏗️ Building Next.js application (FRESH BUILD)...');
try {
  execSync('next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_EXPORT: 'true',
      NETLIFY: 'true',
      FORCE_CLEAN_BUILD: 'true'
    }
  });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

// Create the deployment directory
console.log('📂 Setting up fresh deployment directory...');
if (!fs.existsSync(DEPLOYMENT_DIR)) {
  fs.mkdirSync(DEPLOYMENT_DIR, { recursive: true });
}

// Copy necessary files to deployment directory
console.log('📋 Copying files to deployment directory...');
try {
  // Copy the .next folder
  if (process.platform === 'win32') {
    execSync(`if exist "${BUILD_DIR}" xcopy /E /I /Y "${BUILD_DIR}\\*" "${DEPLOYMENT_DIR}\\*"`, { stdio: 'inherit' });
  } else {
    execSync(`cp -r ${BUILD_DIR}/* ${DEPLOYMENT_DIR}/`, { stdio: 'inherit' });
  }
  
  // Copy other necessary files
  const filesToCopy = [
    'netlify.toml',
    '.nvmrc',
    'package.json',
    'package-lock.json',
    'next.config.js'
  ];
  
  filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(DEPLOYMENT_DIR, file));
      console.log(`✅ Copied ${file}`);
    }
  });
  
  // Create a fresh build marker file
  const buildInfo = {
    timestamp: new Date().toISOString(),
    buildId: Math.random().toString(36).substring(2, 15),
    freshBuild: true
  };
  
  fs.writeFileSync(
    path.join(DEPLOYMENT_DIR, 'fresh-build-info.json'), 
    JSON.stringify(buildInfo, null, 2)
  );
  
  console.log('✅ Files copied successfully');
} catch (error) {
  console.error('❌ Copy failed:', error);
  process.exit(1);
}

console.log('🚀 Fresh Netlify build ready for deployment!');
console.log(`📁 Deployment folder: ${DEPLOYMENT_DIR}`);
console.log('Run "npm run deploy:fresh" to deploy a completely fresh build to Netlify'); 