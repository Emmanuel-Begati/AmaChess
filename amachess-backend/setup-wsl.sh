#!/bin/bash

# AmaChess Backend Development Setup for Linux/WSL
# This script ensures proper environment configuration for WSL/Linux development

echo "🚀 Setting up AmaChess Backend for Linux/WSL..."
echo "================================================"

# Set proper PATH for Linux
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:$PATH"

# Remove any Windows-specific environment variables that might interfere
unset WINDIR
unset PROGRAMFILES
unset SYSTEMROOT

# Set Node.js environment
export NODE_ENV=development
export NODE_OPTIONS="--max-old-space-size=4096"

# Ensure proper line endings (convert any CRLF to LF)
find ./src -type f -name "*.js" -exec dos2unix {} \; 2>/dev/null || true
find ./scripts -type f -name "*.js" -exec dos2unix {} \; 2>/dev/null || true

# Make scripts executable
chmod +x scripts/*.sh 2>/dev/null || true

echo "✅ Environment configured for Linux/WSL"
echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"
echo "✅ Current directory: $(pwd)"

# Check if database connection works
echo ""
echo "🔍 Checking database configuration..."
if [ -f .env ]; then
    echo "✅ .env file found"
else
    echo "⚠️  .env file not found - you may need to configure database settings"
fi

echo ""
echo "🎯 Ready to start development server!"
echo "Run: npm run dev"
