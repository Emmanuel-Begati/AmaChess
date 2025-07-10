from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
import uuid

class MoveAnnotation(BaseModel):
    type: Literal["move_annotation"] = "move_annotation"
    symbol: str
    text: str

class PositionDiagram(BaseModel):
    type: Literal["position_diagram"] = "position_diagram"
    fen: str
    caption: str

class Exercise(BaseModel):
    id: int
    question: str
    fen: str
    solution: str
    explanation: str
    difficulty: Literal["beginner", "intermediate", "advanced"]
    type: Literal["tactical", "strategic", "endgame", "opening"]

class Page(BaseModel):
    id: int
    content: str
    position: Optional[str] = None  # FEN notation
    moveNumber: Optional[str] = None
    annotations: List[MoveAnnotation] = []
    diagrams: List[PositionDiagram] = []
    exercises: List[Exercise] = []

class Chapter(BaseModel):
    id: int
    title: str
    pages: List[Page] = []

class PracticePosition(BaseModel):
    id: int
    fen: str
    question: str
    solution: str
    explanation: str
    difficulty: Literal["beginner", "intermediate", "advanced"]
    chapter: int
    page: int

class BookMetadata(BaseModel):
    totalPages: int
    totalChapters: int
    language: str = "en"
    format: str = "pgn_enhanced"
    difficulty: Literal["beginner", "intermediate", "advanced"]
    topics: List[str] = []
    isbn: Optional[str] = None
    publicationYear: Optional[int] = None
    parser_version: str = "1.0.0"
    parsing_date: datetime = Field(default_factory=datetime.utcnow)

class ChessBook(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    author: str
    cover: Optional[str] = None
    uploadDate: datetime = Field(default_factory=datetime.utcnow)
    rating: Optional[float] = None
    totalPositions: int = 0
    chapters: List[Chapter] = []
    practicePositions: List[PracticePosition] = []
    metadata: BookMetadata

class BookUploadResponse(BaseModel):
    success: bool
    message: str
    book_id: Optional[str] = None
    total_positions: Optional[int] = None
    total_chapters: Optional[int] = None
