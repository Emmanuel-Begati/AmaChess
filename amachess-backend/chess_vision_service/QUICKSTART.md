# Quick Start Guide - Chess Vision Service

## Prerequisites
- Python 3.8 or higher
- pip package manager

## Installation

### 1. Navigate to the chess_vision_service directory
```bash
cd amachess-backend/chess_vision_service
```

### 2. Run the setup script
```bash
python setup.py
```

This will:
- Check Python version
- Install system dependencies (poppler)
- Create virtual environment
- Install Python dependencies
- Create necessary directories
- Test the installation

### 3. Start the service

**Linux/macOS:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

**Manual start:**
```bash
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate     # Windows

python app.py
```

### 4. Test the service

The service will be available at `http://localhost:5000`

Test with:
```bash
python test_service.py
```

## API Endpoints

### POST /detect-boards
Upload a PDF file and get chess board locations:
```bash
curl -X POST -F "pdf=@your_chess_book.pdf" http://localhost:5000/detect-boards
```

### POST /extract_fen
Extract FEN from specific coordinates:
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"page": 1, "x": 100, "y": 150, "width": 200, "height": 200}' \
  http://localhost:5000/extract_fen
```

### GET /health
Check service health:
```bash
curl http://localhost:5000/health
```

## Integration with Node.js Backend

Once the Python service is running, the Node.js backend will automatically forward requests to it:

- `POST /api/get-board-bounds` → forwards to Python `/detect-boards`
- `POST /api/get-fen` → forwards to Python `/extract_fen`

## Troubleshooting

### Common Issues

1. **Import Error - cv2**: Install OpenCV
   ```bash
   pip install opencv-python
   ```

2. **Import Error - pdf2image**: Install poppler
   - Ubuntu/Debian: `sudo apt-get install poppler-utils`
   - macOS: `brew install poppler`
   - Windows: Download from https://github.com/oschwartz10612/poppler-windows/releases

3. **Permission Denied**: Check directory permissions
   ```bash
   chmod +x start.sh
   ```

4. **Service not accessible**: Check if port 5000 is available
   ```bash
   lsof -i :5000  # Linux/macOS
   netstat -an | find "5000"  # Windows
   ```

### Testing without Python Service

If you want to test the Node.js backend without the Python service, the Node.js endpoints will return appropriate error messages indicating the Python service is unavailable.

## Next Steps

1. Start the Python service: `python app.py`
2. Start the Node.js backend: `npm run backend-start`
3. Start the frontend: `npm run frontend-dev`
4. Test the complete integration through the web interface

The frontend will be able to:
- Upload PDF files
- Detect chess boards
- Extract FEN notation
- Display chess positions
