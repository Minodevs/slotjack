const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting Vercel build process...');

// Set environment variables for Vercel build
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NODE_ENV = 'production';
process.env.NEXT_PUBLIC_DEPLOY_ENV = 'production';

// Log build info
console.log(`Building with Node ${process.version}`);
console.log('Environment:', process.env.NODE_ENV);

try {
  // Clean any previous builds
  console.log('🧹 Cleaning previous build artifacts...');
  if (fs.existsSync('.next')) {
    if (process.platform === 'win32') {
      execSync('if exist .next rd /s /q .next');
    } else {
      execSync('rm -rf .next');
    }
  }

  // Run the build
  console.log('🔨 Building Next.js application...');
  execSync('next build', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully for Vercel deployment');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 