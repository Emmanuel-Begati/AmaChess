import os
from typing import List

class Config:
    # Server configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    
    # Storage configuration
    STORAGE_DIR = os.getenv("STORAGE_DIR", "storage")
    
    # File upload configuration
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.pgn']
    
    # CORS configuration
    CORS_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]
    
    # Parser configuration
    MAX_CHUNK_SIZE = 1000  # Words per page
    MIN_CHAPTER_LENGTH = 50  # Minimum characters for a chapter
    
    # Chess validation
    VALIDATE_FEN = True
    DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    
    # Logging configuration
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
