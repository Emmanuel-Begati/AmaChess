@echo off

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Create storage directory
if not exist storage mkdir storage

REM Start the FastAPI server
echo Starting FastAPI server...
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
