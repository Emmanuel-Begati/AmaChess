#!/bin/bash

# AmaChess - Start Server Script
# This script starts the backend server which serves both API and frontend on port 3060

echo "🚀 Starting AmaChess Server..."
echo "📦 Backend + Frontend will be served on http://localhost:3060"
echo ""

cd amachess-backend
npm start
