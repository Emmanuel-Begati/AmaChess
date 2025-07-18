# Chess Vision API Endpoints

This document describes the two new API endpoints that interface with the Python chess vision service.

## Prerequisites

- Python service running on `localhost:5000`
- Python service must have the following endpoints:
  - `POST /detect-boards` - Accepts PDF file and returns bounding boxes
  - `POST /extract_fen` - Accepts coordinates and returns FEN string

## Endpoints

### 1. POST /api/get-board-bounds

**Description:** Upload a PDF file and get chess board bounding boxes from the Python service.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: PDF file in form field named `pdf`

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
  "message": "Chess boards detected successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Python service is not available. Please ensure it is running on localhost:5000",
  "error": "ECONNREFUSED"
}
```

### 2. POST /api/get-fen

**Description:** Extract FEN string from specific bounding box coordinates.

**Request:**
- Method: `POST`
- Content-Type: `application/json`
- Body:
```json
{
  "page": 1,
  "x": 100,
  "y": 150,
  "width": 200,
  "height": 200
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

**Error Response:**
```json
{
  "success": false,
  "message": "Page, x, y, width, and height coordinates are required"
}
```

## Frontend Usage

The frontend service has been updated with two new methods:

### detectChessBoards(pdfFile: File)
```typescript
import { chessVisionService } from '../services/chessVisionService';

const handleFileUpload = async (file: File) => {
  try {
    const boundingBoxes = await chessVisionService.detectChessBoards(file);
    console.log('Detected boards:', boundingBoxes);
  } catch (error) {
    console.error('Detection failed:', error);
  }
};
```

### extractFenFromCoordinates(page, x, y, width, height)
```typescript
import { chessVisionService } from '../services/chessVisionService';

const extractFen = async () => {
  try {
    const fen = await chessVisionService.extractFenFromCoordinates(1, 100, 150, 200, 200);
    console.log('Extracted FEN:', fen);
  } catch (error) {
    console.error('FEN extraction failed:', error);
  }
};
```

## Error Handling

Both endpoints include comprehensive error handling for:
- Missing parameters
- Python service unavailability (ECONNREFUSED)
- Request timeouts
- Invalid file types (PDF only)
- File size limits (50MB)

## Testing

Run the test script to verify the endpoints:

```bash
npm run test-chess-vision
```

This will test:
- Parameter validation
- Error handling
- Service availability checks
- Response format validation

## Configuration

The Python service URL is configured in the route file:
```javascript
const PYTHON_SERVICE_URL = 'http://localhost:5000';
```

Update this URL if your Python service runs on a different host or port.
