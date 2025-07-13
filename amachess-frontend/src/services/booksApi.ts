import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export interface Book {
  id: string;
  title: string;
  author: string;
  originalFileName?: string;
  totalPages: number;
  currentPage: number;
  currentChapter: number;
  readingProgress: number;
  lastReadAt?: string;
  processedAt: string;
  status: string;
  type: string;
  totalChapters?: number;
  totalPositions?: number;
  totalExercises?: number;
  totalDiagrams?: number;
}

export interface BookChunk {
  id: number;
  chapterId: number;
  chapterTitle: string;
  content: string;
  positions?: ChessPosition[];
  diagrams?: ChessDiagram[];
  exercises?: ChessExercise[];
  isPartial: boolean;
  partNumber?: number;
  wordCount: number;
  hasChessContent: boolean;
  chessContentSummary?: {
    hasPositions: boolean;
    hasDiagrams: boolean;
    hasExercises: boolean;
    positionCount: number;
    diagramCount: number;
    exerciseCount: number;
  };
}

export interface ChessPosition {
  id: number;
  fen: string;
  context: string;
  isValid: boolean;
}

export interface ChessExercise {
  id: number;
  question: string;
  solution: string;
  hint?: string;
  fen?: string;
  context: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'tactical' | 'endgame' | 'opening' | 'mate_in_n' | 'best_move' | 'general';
  hasValidPosition: boolean;
  moveToPlay?: 'white' | 'black';
}

export interface ChessDiagram {
  id: number;
  type: string;
  caption: string;
  fen?: string;
  moveIndicator?: string;
  relatedMoves: string[];
  context: string;
  hasValidPosition: boolean;
}

export interface BookStats {
  totalChapters: number;
  totalPositions: number;
  totalExercises: number;
  totalDiagrams: number;
  totalMoves: number;
  totalAnnotations: number;
  chessBoardImages: number;
  readingProgress: number;
  currentPage: number;
  totalPages: number;
  wordCount: number;
  exercisesByDifficulty: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
  exercisesByType: {
    tactical: number;
    endgame: number;
    opening: number;
    mate_in_n: number;
    best_move: number;
    general: number;
  };
}

export interface BookData {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  currentChapter: number;
  readingProgress: number;
  lastReadAt: string;
  processedAt: string;
  status: string;
  content?: any;
  diagrams?: any;
  pdfPath?: string; // Add PDF path
  originalFileName?: string; // Add original filename
}

// Configure axios for books API
const booksApi = axios.create({
  baseURL: `${API_BASE_URL}/books`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
booksApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class BooksApiService {
  // Upload a new book
  async uploadBook(file: File, title: string, author: string): Promise<Book> {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', title);
    formData.append('author', author);
    
    try {
      const response = await booksApi.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // 2 minute timeout for large files
      });
      
      // Handle warnings for processing issues
      if (response.data.warning) {
        console.warn('Upload warning:', response.data.warning);
        // You can store this warning to show to the user later
        if (response.data.processingDetails) {
          console.warn('Processing details:', response.data.processingDetails);
        }
      }
      
      return response.data.book;
    } catch (error: any) {
      console.error('Upload error details:', error);
      
      // Enhanced error handling with specific messages
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 413:
            throw new Error('File is too large. Please choose a PDF file smaller than 50MB.');
          case 422:
            throw new Error(data.error || 'The PDF file could not be processed. Please ensure it contains extractable text (not just scanned images).');
          case 507:
            throw new Error('Server storage is full. Please try again later.');
          case 503:
            throw new Error('Server is busy. Please wait a moment and try again.');
          case 500:
            throw new Error(data.error || 'Failed to process PDF. This may be due to file corruption or unsupported format.');
          default:
            throw new Error(data.error || 'Upload failed. Please try again.');
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Upload timed out. Please try with a smaller file or check your internet connection.');
      } else if (error.code === 'ERR_NETWORK') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error('Upload failed. Please check your file and try again.');
      }
    }
  }

  // Get all books for the authenticated user
  async getBooks(): Promise<Book[]> {
    const response = await booksApi.get('/');
    return response.data.books;
  }

  // Get a specific book by ID
  async getBook(bookId: string): Promise<Book> {
    const response = await booksApi.get(`/${bookId}`);
    return response.data.book;
  }

  // Get book content chunks
  async getBookChunks(bookId: string, page: number = 1, limit: number = 1): Promise<{
    chunks: BookChunk[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalChunks: number;
      hasNext: boolean;
      hasPrev: boolean;
      pageSize: number;
    };
    bookInfo: {
      id: string;
      title: string;
      author: string;
      currentPage: number;
      readingProgress: number;
      lastReadAt?: string;
    };
  }> {
    const response = await booksApi.get(`/${bookId}/chunks?page=${page}&limit=${limit}`);
    return response.data;
  }

  // Get chess positions from a book
  async getBookPositions(bookId: string): Promise<ChessPosition[]> {
    const response = await booksApi.get(`/${bookId}/positions`);
    return response.data.positions;
  }

  // Get exercises from a book
  async getBookExercises(bookId: string, difficulty?: string, type?: string): Promise<ChessExercise[]> {
    const params = new URLSearchParams();
    if (difficulty && difficulty !== 'all') params.append('difficulty', difficulty);
    if (type && type !== 'all') params.append('type', type);
    
    const response = await booksApi.get(`/${bookId}/exercises?${params.toString()}`);
    return response.data.exercises;
  }

  // Get diagrams from a book
  async getBookDiagrams(bookId: string): Promise<ChessDiagram[]> {
    const response = await booksApi.get(`/${bookId}/diagrams`);
    return response.data.diagrams;
  }

  // Get specific chapter
  async getBookChapter(bookId: string, chapterId: number): Promise<any> {
    const response = await booksApi.get(`/${bookId}/chapters/${chapterId}`);
    return response.data.chapter;
  }

  // Get book statistics
  async getBookStats(bookId: string): Promise<BookStats> {
    const response = await booksApi.get(`/${bookId}/stats`);
    return response.data.stats;
  }

  // Update reading progress
  async updateProgress(bookId: string, currentPage: number, currentChapter?: number, readingProgress?: number): Promise<void> {
    await booksApi.put(`/${bookId}/progress`, {
      currentPage,
      currentChapter,
      readingProgress
    });
  }

  // Save notes
  async saveNotes(bookId: string, notes: any): Promise<void> {
    await booksApi.put(`/${bookId}/notes`, { notes });
  }

  // Delete a book
  async deleteBook(bookId: string): Promise<void> {
    await booksApi.delete(`/${bookId}`);
  }

  // Search books (for now, just filter locally - you can implement backend search later)
  async searchBooks(query: string): Promise<Book[]> {
    const allBooks = await this.getBooks();
    return allBooks.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) ||
      book.author.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Get PDF URL for viewing
  async getPDFUrl(bookId: string): Promise<string> {
    try {
      // Return the URL to serve the PDF file
      return `${API_BASE_URL}/books/${bookId}/pdf`;
    } catch (error) {
      console.error('Error getting PDF URL:', error);
      throw new Error('Failed to get PDF URL');
    }
  }

  // Check if book has PDF available
  async hasPDFFile(bookId: string): Promise<boolean> {
    try {
      const response = await booksApi.get(`/${bookId}/pdf-status`);
      return response.data.hasPDF;
    } catch (error) {
      console.error('Error checking PDF status:', error);
      return false;
    }
  }
}

// Create and export an instance for easy importing
const booksApiService = new BooksApiService();
export { booksApiService };

// Keep the default export for backward compatibility
export default booksApiService;
