#!/bin/bash

# AmaChess Development Environment Setup
# This script sets up proper PATH for Linux development

# Remove Windows paths that might interfere
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:$PATH"

# Add project-specific settings
export NODE_ENV=development

echo "✅ AmaChess Linux environment configured"
echo "   - Linux binaries prioritized in PATH"
echo "   - Stockfish available at: $(which stockfish)"
echo "   - Node.js version: $(node --version)"
echo "   - npm version: $(npm --version)"
