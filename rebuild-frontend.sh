#!/bin/bash

# Rebuild Frontend Script
# Use this whenever you make changes to the frontend code

echo "🔨 Rebuilding AmaChess Frontend..."
echo ""

cd amachess-frontend

echo "📦 Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Frontend rebuilt successfully!"
    echo ""
    echo "The new build is in: amachess-frontend/dist"
    echo ""
    echo "If the backend is running, it will automatically serve the new build."
    echo "If not, start it with: ./start-server.sh"
    echo ""
else
    echo ""
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
