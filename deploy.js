#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting AmaChess deployment...\n');

try {
  // Check if frontend dist exists, if not build it
  const distPath = path.join(__dirname, 'amachess-frontend', 'dist');
  if (!fs.existsSync(distPath)) {
    console.log('📦 Building frontend...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Frontend built successfully\n');
  } else {
    console.log('📦 Frontend already built, skipping build step\n');
  }

  // Start the backend server
  console.log('🔧 Starting backend server...');
  execSync('npm start', { stdio: 'inherit' });

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}