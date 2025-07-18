#!/bin/bash

# Chess Vision Service Startup Script

echo "Starting Chess Vision Service..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create necessary directories
mkdir -p temp_uploads
mkdir -p pdf_cache

# Start the Flask application
echo "Starting Flask application on port 5000..."
python app.py
