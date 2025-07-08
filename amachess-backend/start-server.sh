#!/bin/bash

echo "🚀 Starting AmaChess Backend Server..."
echo "📍 Working directory: $(pwd)"
echo "⏰ Timestamp: $(date)"

# Check if Stockfish is installed
if [ ! -f "stockfish/stockfish.exe" ]; then
    echo "❌ Stockfish not found. Installing..."
    npm run install-stockfish
fi

# Test Stockfish quickly
echo "🧪 Quick Stockfish test..."
npm run test-stockfish > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Stockfish is working correctly"
else
    echo "⚠️ Stockfish test failed, but continuing..."
fi

echo "🌐 Starting server on port 3001..."
echo "📊 Health check will be available at: http://localhost:3001/api/health"
echo "🔧 API documentation: see API_DOCUMENTATION.md"
echo ""

# Start the server
node src/server.js
