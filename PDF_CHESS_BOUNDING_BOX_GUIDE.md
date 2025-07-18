# PDF Chess Bounding Box Implementation

This document explains how the bounding box functionality works in the PDFChessViewer component to detect and interact with chess diagrams in PDF files.

## Overview

The PDFChessViewer component renders interactive bounding boxes on top of PDF pages to highlight detected chess diagrams. When users click on these boxes, the system sends a request to the backend to extract the FEN (Forsyth-Edwards Notation) of the chess position and updates the connected chess board.

## Components

### Frontend: PDFChessViewer.tsx

The main component that handles:
- PDF rendering with react-pdf
- Bounding box overlay rendering
- Click handling for FEN extraction
- Chess board integration

### Backend: chessVision.js

Backend routes that provide:
- Chess diagram detection (`/api/detect-chess`)
- FEN extraction (`/api/get-fen`)
- Batch processing capabilities
- Validation and statistics

### Service: chessVisionService.ts

Service layer that:
- Communicates with backend APIs
- Handles authentication
- Provides typed interfaces
- Manages error handling

## Key Features

### 1. Bounding Box Rendering

```typescript
// Calculate bounding box style for absolute positioning
const getBoundingBoxStyle = (box: ChessBoundingBox, pageNumber: number): React.CSSProperties => {
  const scaledX = (box.x * scale);
  const scaledY = (box.y * scale);
  const scaledWidth = (box.width * scale);
  const scaledHeight = (box.height * scale);

  return {
    position: 'absolute',
    left: `${scaledX}px`,
    top: `${scaledY}px`,
    width: `${scaledWidth}px`,
    height: `${scaledHeight}px`,
    border: selectedBox === box ? '2px solid #10b981' : '2px solid #3b82f6',
    backgroundColor: processingBox === box ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.1)',
    cursor: 'pointer',
    borderRadius: '4px',
    zIndex: 10
  };
};
```

### 2. Click Handler for FEN Extraction

```typescript
const handleBoundingBoxClick = async (boundingBox: ChessBoundingBox) => {
  try {
    setSelectedBox(boundingBox);
    setProcessingBox(boundingBox);
    
    // Send POST request to /api/get-fen with bounding box coordinates
    const fen = await chessVisionService.extractFenFromBoundingBox(pdfUrl, boundingBox);
    
    // Update chess board via ref
    if (chessBoardRef?.current && fen) {
      chessBoardRef.current.resetBoard();
      if (onFenDetected) {
        onFenDetected(fen, boundingBox);
      }
    }
  } catch (error) {
    console.error('Error getting FEN from bounding box:', error);
  } finally {
    setProcessingBox(null);
  }
};
```

### 3. Backend API Endpoints

#### POST /api/detect-chess
Detects chess diagrams on a specific PDF page.

**Request Body:**
```json
{
  "pdfUrl": "string",
  "page": "number"
}
```

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
  ]
}
```

#### POST /api/get-fen
Extracts FEN from a specific bounding box region.

**Request Body:**
```json
{
  "pdfUrl": "string",
  "page": "number",
  "x": "number",
  "y": "number",
  "width": "number",
  "height": "number"
}
```

**Response:**
```json
{
  "success": true,
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "confidence": 0.90
}
```

## Usage Example

```typescript
import { PDFChessViewer } from './components/PDFChessViewer';
import { ChessBoard } from './components/ChessBoard';

const ChessBookReader = () => {
  const chessBoardRef = useRef<ChessBoardRef>(null);
  const [currentFen, setCurrentFen] = useState<string>('');

  const handleFenDetected = (fen: string, boundingBox: ChessBoundingBox) => {
    setCurrentFen(fen);
    // Additional processing...
  };

  return (
    <div className="flex">
      <PDFChessViewer
        pdfUrl="/path/to/chess-book.pdf"
        onFenDetected={handleFenDetected}
        chessBoardRef={chessBoardRef}
        showBoundingBoxes={true}
        autoDetectChess={true}
      />
      <ChessBoard
        ref={chessBoardRef}
        initialFen={currentFen}
      />
    </div>
  );
};
```

## Visual States

### 1. Default State
- Blue border (`#3b82f6`)
- Semi-transparent background (`rgba(59, 130, 246, 0.1)`)
- Hover effect for better UX

### 2. Selected State
- Green border (`#10b981`)
- "Selected" label displayed
- Maintained until another box is clicked

### 3. Processing State
- More opaque background (`rgba(59, 130, 246, 0.3)`)
- Loading spinner animation
- Click disabled during processing

## Dependencies

### Frontend
```json
{
  "react-pdf": "^8.0.0",
  "axios": "^1.6.0",
  "react": "^18.0.0"
}
```

### Backend
```json
{
  "express": "^4.18.0",
  "multer": "^1.4.5",
  "cors": "^2.8.5"
}
```

## Integration Points

### 1. Chess Board Integration
The PDFChessViewer communicates with a chess board component through:
- `chessBoardRef` prop for direct method calls
- `onFenDetected` callback for state updates
- Position synchronization

### 2. Authentication
- Uses JWT tokens for protected endpoints
- Handles token refresh and validation
- Graceful degradation for unauthenticated users

### 3. Error Handling
- Network error recovery
- Invalid FEN validation
- User-friendly error messages

## Future Enhancements

1. **Real Computer Vision**: Replace mock data with actual OpenCV/ML model
2. **Batch Processing**: Process multiple diagrams simultaneously
3. **Caching**: Cache detection results for better performance
4. **Accuracy Improvements**: Better chess position recognition
5. **Multi-format Support**: Support for different chess notation formats

## Development Notes

- The current implementation uses mock data for demonstration
- Real chess vision would require OpenCV or similar computer vision libraries
- Consider performance implications when processing large PDFs
- Implement proper error boundaries for production use

## Testing

To test the bounding box functionality:

1. Start the backend server
2. Load a PDF with chess diagrams
3. Click "Detect Chess" to find diagrams
4. Click on highlighted bounding boxes
5. Verify FEN extraction and board updates

The system provides visual feedback throughout the process and handles edge cases gracefully.
