# Chess Vision Service

A Flask-based service for detecting chess boards in PDF files and extracting FEN notation from chess positions.

## Features

- **PDF Chess Board Detection**: Upload PDF files and detect chess board locations
- **FEN Extraction**: Extract FEN notation from detected chess boards
- **Image Caching**: Efficient caching of PDF images to reduce processing time
- **OpenCV Integration**: Uses OpenCV for computer vision tasks
- **RESTful API**: Simple JSON-based API endpoints

## API Endpoints

### 1. POST /detect-boards

Detects chess boards in a PDF file.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: PDF file in form field named 'pdf'

**Response:**
```json
{
  "success": true,
  "boundingBoxes": [
    {
      "page": 1,
      "x": 100,
      "y": 150,
      "width": 200,
      "height": 200,
      "confidence": 0.95
    }
  ],
  "message": "Found 1 chess boards across 1 pages",
  "pdf_hash": "abc123..."
}
```

### 2. POST /extract_fen

Extracts FEN notation from a specific region of a PDF page.

**Request:**
- Method: POST
- Content-Type: application/json
- Body:
```json
{
  "page": 1,
  "x": 100,
  "y": 150,
  "width": 200,
  "height": 200,
  "pdf_hash": "abc123..."
}
```

**Response:**
```json
{
  "success": true,
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "confidence": 0.95,
  "message": "FEN extracted successfully"
}
```

### 3. GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "message": "Chess Vision Service is running",
  "cache_size": 5
}
```

### 4. POST /clear-cache

Clears the PDF image cache.

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared. Removed 5 entries."
}
```

## Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Setup

1. **Clone or navigate to the chess_vision_service directory:**
   ```bash
   cd chess_vision_service
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Install system dependencies:**
   
   **Ubuntu/Debian:**
   ```bash
   sudo apt-get update
   sudo apt-get install poppler-utils
   ```
   
   **macOS:**
   ```bash
   brew install poppler
   ```
   
   **Windows:**
   - Download poppler from: https://github.com/oschwartz10612/poppler-windows/releases
   - Extract and add to PATH

4. **Run the service:**
   ```bash
   python app.py
   ```

   Or use the startup scripts:
   
   **Linux/macOS:**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
   
   **Windows:**
   ```cmd
   start.bat
   ```

## Configuration

The service runs on `http://localhost:5000` by default.

### Environment Variables

- `FLASK_ENV`: Set to 'development' for debugging
- `CACHE_EXPIRY_HOURS`: Cache expiry time in hours (default: 24)
- `MAX_CONTENT_LENGTH`: Maximum file size in bytes (default: 50MB)

### Cache Settings

- PDF images are cached for 24 hours by default
- Cache is cleaned up automatically every hour
- Use `/clear-cache` endpoint to manually clear cache

## Development

### File Structure

```
chess_vision_service/
├── app.py                 # Main Flask application
├── app_with_cache.py      # Enhanced version with caching
├── requirements.txt       # Python dependencies
├── start.sh              # Linux/macOS startup script
├── start.bat             # Windows startup script
├── README.md             # This file
├── temp_uploads/         # Temporary file uploads
└── pdf_cache/            # PDF image cache
```

### Key Components

1. **Chess Board Detection**: Uses OpenCV to detect rectangular contours that resemble chess boards
2. **PDF Processing**: Uses pdf2image to convert PDF pages to images
3. **FEN Extraction**: Placeholder for chess position recognition (would use Chesscog in production)
4. **Caching**: Efficient image caching to reduce PDF processing overhead

### Testing

Test the service with curl:

```bash
# Test chess board detection
curl -X POST \
  -F "pdf=@test_chess_book.pdf" \
  http://localhost:5000/detect-boards

# Test FEN extraction
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "x": 100, "y": 150, "width": 200, "height": 200}' \
  http://localhost:5000/extract_fen

# Test health check
curl http://localhost:5000/health
```

## Integration with Node.js Backend

The service is designed to work with the existing Node.js backend. The Node.js routes in `chessVision.js` forward requests to this Python service.

### Node.js Integration Points

1. **PDF Upload**: Node.js receives PDF upload and forwards to `/detect-boards`
2. **FEN Extraction**: Node.js forwards coordinate requests to `/extract_fen`
3. **Error Handling**: Both services use consistent error response format

## Limitations and Future Improvements

### Current Limitations

1. **Mock FEN Extraction**: Currently returns mock FEN strings
2. **Basic Chess Board Detection**: Uses simple contour detection
3. **Memory Usage**: Large PDFs may consume significant memory

### Future Improvements

1. **Real FEN Extraction**: Integrate with Chesscog or similar chess position recognition
2. **Advanced Detection**: Use machine learning for better chess board detection
3. **Database Integration**: Store PDF metadata and cache in database
4. **Performance Optimization**: Implement streaming for large PDFs
5. **Authentication**: Add authentication for production use

## Troubleshooting

### Common Issues

1. **Import Error - cv2**: Install OpenCV with `pip install opencv-python`
2. **Import Error - pdf2image**: Install poppler system dependency
3. **Permission Denied**: Check file permissions for temp_uploads and pdf_cache directories
4. **Memory Issues**: Reduce DPI setting for large PDFs

### Logging

The service uses Python's logging module. Check console output for detailed error messages.

## License

This service is part of the AmaChess project.
