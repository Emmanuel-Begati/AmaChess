@echo off

REM Chess Vision Service Startup Script for Windows

echo Starting Chess Vision Service...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Create necessary directories
if not exist "temp_uploads" mkdir temp_uploads
if not exist "pdf_cache" mkdir pdf_cache

REM Start the Flask application
echo Starting Flask application on port 5000...
python app.py
