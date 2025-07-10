# Chess Book Parser API

A production-ready FastAPI application for parsing chess books and extracting chess positions, chapters, exercises, and content in JSON format.

## Features

- **Book Upload & Parsing**: Upload chess books in PDF, DOCX, TXT, or PGN format
- **Content Extraction**: Extract chapters, pages, positions (FEN), moves, and annotations
- **Exercise Detection**: Automatically detect and parse chess exercises with solutions
- **Position Analysis**: Extract all chess positions for analysis and practice
- **JSON Storage**: Save parsed books in structured JSON format
- **RESTful API**: Complete API for integration with React frontend
- **CORS Support**: Ready for frontend integration

## Installation

### Prerequisites
- Python 3.8+
- pip

### Setup

1. **Clone/Download the project**:
   ```bash
   cd c:\Users\begat\Desktop\AmaChess\book_parser
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Create storage directory**:
   ```bash
   mkdir storage
   ```

## Running the Application

### Option 1: Using the start script (Windows)
```bash
start.bat
```

### Option 2: Using the start script (Linux/Mac)
```bash
chmod +x start.sh
./start.sh
```

### Option 3: Manual start
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Book Management
- `POST /upload-book` - Upload and parse a chess book
- `GET /books` - List all parsed books
- `GET /books/{book_id}` - Get specific book details
- `DELETE /books/{book_id}` - Delete a book

### Content Access
- `GET /books/{book_id}/chapters` - Get all chapters
- `GET /books/{book_id}/chapters/{chapter_id}` - Get specific chapter
- `GET /books/{book_id}/positions` - Get all chess positions
- `GET /books/{book_id}/exercises` - Get all exercises
- `GET /books/{book_id}/practice-positions` - Get practice positions

### System
- `GET /` - Root endpoint
- `GET /health` - Health check

## JSON Format

The parsed books are saved in the following JSON structure:

```json
{
  "id": "unique-book-id",
  "title": "Chess Fundamentals",
  "author": "Jose Capablanca",
  "cover": "https://example.com/book-cover.jpg",
  "uploadDate": "2025-01-15T10:30:00Z",
  "rating": 4.8,
  "totalPositions": 156,
  "chapters": [
    {
      "id": 1,
      "title": "Chapter 1: First Principles",
      "pages": [
        {
          "id": 1,
          "content": "The game of chess is played by two armies...",
          "position": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          "moveNumber": "1.e4",
          "annotations": [
            {
              "type": "move_annotation",
              "symbol": "!",
              "text": "A classical opening move"
            }
          ],
          "diagrams": [
            {
              "type": "position_diagram",
              "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
              "caption": "After 1.e4"
            }
          ],
          "exercises": [
            {
              "id": 1,
              "question": "What is the best move for Black?",
              "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
              "solution": "e5",
              "explanation": "1...e5 is the classical response",
              "difficulty": "beginner",
              "type": "tactical"
            }
          ]
        }
      ]
    }
  ],
  "practicePositions": [
    {
      "id": 1,
      "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4",
      "question": "White to move. What is the best continuation?",
      "solution": "Ng5",
      "explanation": "Attacking the f7 square",
      "difficulty": "intermediate",
      "chapter": 1,
      "page": 5
    }
  ],
  "metadata": {
    "totalPages": 250,
    "totalChapters": 12,
    "language": "en",
    "format": "pgn_enhanced",
    "difficulty": "intermediate",
    "topics": ["openings", "tactics", "endgames"],
    "parser_version": "1.0.0",
    "parsing_date": "2025-01-15T10:30:00Z"
  }
}
```

## Usage Examples

### Upload a Book
```bash
curl -X POST "http://localhost:8000/upload-book" \
  -F "file=@chess_book.pdf" \
  -F "title=Chess Fundamentals" \
  -F "author=Jose Capablanca"
```

### Get Book Positions
```bash
curl "http://localhost:8000/books/{book_id}/positions"
```

### Get Exercises
```bash
curl "http://localhost:8000/books/{book_id}/exercises"
```

## Parser Features

### Supported File Formats
- **PDF**: Text extraction from PDF files
- **DOCX**: Microsoft Word documents
- **TXT**: Plain text files
- **PGN**: Portable Game Notation files

### Content Detection
- **Chapters**: Automatically detects chapter titles and boundaries
- **Chess Positions**: Extracts FEN notation from text
- **Moves**: Parses algebraic notation moves
- **Annotations**: Detects move annotations (!!, !, ?, ??, !?, ?!)
- **Exercises**: Finds and parses chess exercises with solutions
- **Diagrams**: Identifies position diagrams with captions

### Robust Parsing
- **Error Handling**: Graceful handling of malformed content
- **Validation**: FEN validation using python-chess
- **Fallbacks**: Default values for missing information
- **Logging**: Comprehensive logging for debugging

## Testing

Test the API using the provided test script:

```bash
python test_api.py
```

This will test all endpoints with sample data.

## Integration with React

The API is designed to work seamlessly with React applications:

1. **CORS Enabled**: Configured for `localhost:3000` and `localhost:3001`
2. **JSON Responses**: All endpoints return JSON data
3. **Error Handling**: Proper HTTP status codes and error messages
4. **File Upload**: Supports multipart form data for file uploads

### Example React Integration

```javascript
// Upload a book
const uploadBook = async (file, title, author) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('author', author);
  
  const response = await fetch('http://localhost:8000/upload-book', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
};

// Get book positions
const getPositions = async (bookId) => {
  const response = await fetch(`http://localhost:8000/books/${bookId}/positions`);
  return await response.json();
};
```

## Production Deployment

### Environment Variables
- `PORT`: Server port (default: 8000)
- `HOST`: Server host (default: 0.0.0.0)
- `STORAGE_DIR`: Directory for storing parsed books (default: storage)

### Docker Deployment
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Performance Considerations
- **Async Processing**: All endpoints are async for better performance
- **File Validation**: Input validation to prevent malicious uploads
- **Error Handling**: Comprehensive error handling and logging
- **Memory Management**: Efficient text processing for large books

## Troubleshooting

### Common Issues
1. **Import Errors**: Make sure all dependencies are installed
2. **File Upload Fails**: Check file format and size limits
3. **FEN Validation**: Ensure chess positions are valid
4. **Storage Issues**: Verify storage directory permissions

### Logs
Check the console output for detailed error messages and parsing information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
