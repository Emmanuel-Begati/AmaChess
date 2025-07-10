from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import List, Optional
import json
import os
import uuid
from datetime import datetime
import logging

from models import ChessBook, BookUploadResponse, Chapter, PracticePosition
from parser import ChessBookParser
from config import Config

# Configure logging
logging.basicConfig(level=getattr(logging, Config.LOG_LEVEL), format=Config.LOG_FORMAT)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Chess Book Parser API",
    description="API for parsing chess books and extracting positions and content",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize parser
parser = ChessBookParser()

# Storage directory for parsed books
os.makedirs(Config.STORAGE_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "Chess Book Parser API is running"}

@app.post("/upload-book", response_model=BookUploadResponse)
async def upload_book(
    file: UploadFile = File(...),
    title: str = Form(...),
    author: str = Form(...),
    cover_url: Optional[str] = Form(None)
):
    """Upload and parse a chess book"""
    try:
        # Validate file type
        allowed_extensions = Config.ALLOWED_EXTENSIONS
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Check file size
        file_size = 0
        content_chunks = []
        
        # Read file in chunks to check size
        while True:
            chunk = await file.read(8192)  # 8KB chunks
            if not chunk:
                break
            file_size += len(chunk)
            content_chunks.append(chunk)
            
            if file_size > Config.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Maximum size: {Config.MAX_FILE_SIZE // (1024*1024)}MB"
                )
        
        # Combine chunks
        content = b''.join(content_chunks)
        
        # Handle different file types for text extraction
        if file_extension in ['.txt', '.md', '.pgn']:
            try:
                text_content = content.decode('utf-8')
            except UnicodeDecodeError:
                try:
                    text_content = content.decode('latin-1')
                except UnicodeDecodeError:
                    text_content = content.decode('utf-8', errors='replace')
        elif file_extension == '.pdf':
            # For PDF files, pass as binary and let parser handle
            text_content = content  # Pass binary content directly
        elif file_extension == '.docx':
            # For DOCX files, pass as binary and let parser handle
            text_content = content  # Pass binary content directly
        else:
            # For other files, try to decode as text
            try:
                text_content = content.decode('utf-8')
            except UnicodeDecodeError:
                text_content = content.decode('utf-8', errors='replace')
        
        # Parse the book
        book = parser.parse_book(text_content, file.filename, title, author)
        
        # Add cover URL if provided
        if cover_url:
            book.cover = cover_url
        
        # Save to JSON
        book_filename = f"{book.id}.json"
        book_filepath = os.path.join(Config.STORAGE_DIR, book_filename)
        parser.save_book_to_json(book, book_filepath)
        
        logger.info(f"Book '{title}' by {author} parsed successfully. ID: {book.id}")
        
        return BookUploadResponse(
            success=True,
            message="Book uploaded and parsed successfully",
            book_id=book.id,
            total_positions=book.totalPositions,
            total_chapters=len(book.chapters)
        )
        
    except Exception as e:
        logger.error(f"Error uploading book: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/books")
async def list_books():
    """List all parsed books"""
    try:
        books = []
        for filename in os.listdir(Config.STORAGE_DIR):
            if filename.endswith('.json'):
                filepath = os.path.join(Config.STORAGE_DIR, filename)
                try:
                    book = parser.load_book_from_json(filepath)
                    books.append({
                        "id": book.id,
                        "title": book.title,
                        "author": book.author,
                        "cover": book.cover,
                        "uploadDate": book.uploadDate,
                        "rating": book.rating,
                        "totalPositions": book.totalPositions,
                        "totalChapters": len(book.chapters)
                    })
                except Exception as e:
                    logger.error(f"Error loading book {filename}: {str(e)}")
                    continue
        
        return {"books": books}
        
    except Exception as e:
        logger.error(f"Error listing books: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/books/{book_id}")
async def get_book(book_id: str):
    """Get a specific book by ID"""
    try:
        book_filepath = os.path.join(Config.STORAGE_DIR, f"{book_id}.json")
        
        if not os.path.exists(book_filepath):
            raise HTTPException(status_code=404, detail="Book not found")
        
        book = parser.load_book_from_json(book_filepath)
        return book
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting book {book_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/books/{book_id}/chapters")
async def get_book_chapters(book_id: str):
    """Get all chapters of a book"""
    try:
        book_filepath = os.path.join(Config.STORAGE_DIR, f"{book_id}.json")
        
        if not os.path.exists(book_filepath):
            raise HTTPException(status_code=404, detail="Book not found")
        
        book = parser.load_book_from_json(book_filepath)
        return {"chapters": book.chapters}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chapters for book {book_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/books/{book_id}/chapters/{chapter_id}")
async def get_chapter(book_id: str, chapter_id: int):
    """Get a specific chapter"""
    try:
        book_filepath = os.path.join(Config.STORAGE_DIR, f"{book_id}.json")
        
        if not os.path.exists(book_filepath):
            raise HTTPException(status_code=404, detail="Book not found")
        
        book = parser.load_book_from_json(book_filepath)
        
        chapter = next((ch for ch in book.chapters if ch.id == chapter_id), None)
        if not chapter:
            raise HTTPException(status_code=404, detail="Chapter not found")
        
        return chapter
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chapter {chapter_id} from book {book_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/books/{book_id}/positions")
async def get_book_positions(book_id: str):
    """Get all positions from a book"""
    try:
        book_filepath = os.path.join(Config.STORAGE_DIR, f"{book_id}.json")
        
        if not os.path.exists(book_filepath):
            raise HTTPException(status_code=404, detail="Book not found")
        
        book = parser.load_book_from_json(book_filepath)
        
        # Extract all positions from pages
        positions = []
        for chapter in book.chapters:
            for page in chapter.pages:
                if page.position:
                    positions.append({
                        "fen": page.position,
                        "chapter": chapter.id,
                        "chapter_title": chapter.title,
                        "page": page.id,
                        "move_number": page.moveNumber,
                        "content": page.content[:200] + "..." if len(page.content) > 200 else page.content
                    })
        
        return {"positions": positions}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting positions for book {book_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/books/{book_id}/practice-positions")
async def get_practice_positions(book_id: str):
    """Get all practice positions from a book"""
    try:
        book_filepath = os.path.join(Config.STORAGE_DIR, f"{book_id}.json")
        
        if not os.path.exists(book_filepath):
            raise HTTPException(status_code=404, detail="Book not found")
        
        book = parser.load_book_from_json(book_filepath)
        return {"practice_positions": book.practicePositions}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting practice positions for book {book_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/books/{book_id}/exercises")
async def get_book_exercises(book_id: str):
    """Get all exercises from a book"""
    try:
        book_filepath = os.path.join(Config.STORAGE_DIR, f"{book_id}.json")
        
        if not os.path.exists(book_filepath):
            raise HTTPException(status_code=404, detail="Book not found")
        
        book = parser.load_book_from_json(book_filepath)
        
        # Extract all exercises from pages
        exercises = []
        for chapter in book.chapters:
            for page in chapter.pages:
                for exercise in page.exercises:
                    exercises.append({
                        **exercise.dict(),
                        "chapter": chapter.id,
                        "chapter_title": chapter.title,
                        "page": page.id
                    })
        
        return {"exercises": exercises}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting exercises for book {book_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/books/{book_id}")
async def delete_book(book_id: str):
    """Delete a book"""
    try:
        book_filepath = os.path.join(Config.STORAGE_DIR, f"{book_id}.json")
        
        if not os.path.exists(book_filepath):
            raise HTTPException(status_code=404, detail="Book not found")
        
        os.remove(book_filepath)
        logger.info(f"Book {book_id} deleted successfully")
        
        return {"message": "Book deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting book {book_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.utcnow()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=Config.HOST, port=Config.PORT)
