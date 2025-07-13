const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const PDFParsingService = require('../services/pdfParsingService');
const prisma = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

const pdfParsingService = new PDFParsingService();

// Upload and parse PDF book
router.post('/upload', authenticateToken, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file provided'
      });
    }

    const { title, author } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        success: false,
        error: 'Title and author are required'
      });
    }

    console.log(`Processing PDF upload: ${req.file.originalname}, Size: ${req.file.size} bytes`);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads');
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    let book;
    let parsedContent;
    let pdfPath;

    try {
      // Save PDF file first
      const pdfFileName = `${Date.now()}_${req.file.originalname}`;
      pdfPath = path.join(uploadsDir, pdfFileName);
      await fs.writeFile(pdfPath, req.file.buffer);

      console.log('PDF file saved, starting parsing...');

      // Parse PDF content - this now handles errors gracefully
      parsedContent = await pdfParsingService.parsePDF(req.file.buffer, req.file.originalname);

      console.log('PDF parsing completed, saving to database...');

      // Save to database
      book = await prisma.book.create({
        data: {
          title: title,
          author: author,
          originalFileName: req.file.originalname,
          content: JSON.stringify(parsedContent),
          totalPages: parsedContent.chunks ? parsedContent.chunks.length : 1,
          pdfPath: pdfPath,
          type: 'PDF',
          status: parsedContent.metadata?.hasParsingErrors ? 'processed_with_errors' : 'processed',
          userId: req.userId,
          diagramMap: JSON.stringify({
            positions: parsedContent.positions || [],
            diagrams: parsedContent.diagrams || [],
            exercises: parsedContent.exercises || []
          })
        }
      });

      console.log(`Book saved to database with ID: ${book.id}`);

      // Prepare response with appropriate status
      const response = {
        success: true,
        book: {
          id: book.id,
          title: book.title,
          author: book.author,
          totalPages: book.totalPages,
          totalChapters: parsedContent.chapters ? parsedContent.chapters.length : 0,
          totalPositions: parsedContent.positions ? parsedContent.positions.length : 0,
          totalExercises: parsedContent.exercises ? parsedContent.exercises.length : 0,
          totalDiagrams: parsedContent.diagrams ? parsedContent.diagrams.length : 0,
          processedAt: book.processedAt,
          status: book.status
        }
      };

      // Add processing warnings if there were issues
      if (parsedContent.metadata?.hasParsingErrors) {
        response.warning = 'PDF was processed but some content extraction issues were encountered. The book is still readable but some features may be limited.';
        response.processingDetails = {
          extractionMethod: parsedContent.metadata.extractionMethod,
          extractionSuccess: parsedContent.metadata.extractionSuccess,
          errorMessage: parsedContent.metadata.errorMessage
        };
      } else {
        response.message = 'PDF uploaded and parsed successfully';
      }

      res.json(response);

    } catch (dbError) {
      console.error('Database save error:', dbError);
      
      // Clean up file if database save failed
      if (pdfPath) {
        try {
          await fs.unlink(pdfPath);
        } catch (cleanupError) {
          console.warn('Could not clean up PDF file:', cleanupError.message);
        }
      }

      res.status(500).json({
        success: false,
        error: 'Failed to save book to database: ' + dbError.message
      });
    }

  } catch (error) {
    console.error('PDF upload error:', error);
    
    // Provide specific error messages based on error type
    let errorMessage = 'An unexpected error occurred while processing your PDF';
    let statusCode = 500;

    if (error.message.includes('pdf-parse')) {
      errorMessage = 'The PDF file could not be read. Please ensure it\'s a valid PDF with extractable text (not a scanned image).';
      statusCode = 422;
    } else if (error.message.includes('memory') || error.message.includes('Memory')) {
      errorMessage = 'The PDF file is too large or complex to process. Please try a smaller file or contact support.';
      statusCode = 413;
    } else if (error.code === 'ENOSPC') {
      errorMessage = 'Server storage is full. Please try again later or contact support.';
      statusCode = 507;
    } else if (error.code === 'EMFILE' || error.code === 'ENFILE') {
      errorMessage = 'Server is busy processing other files. Please try again in a moment.';
      statusCode = 503;
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      technicalDetails: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all books for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      where: {
        userId: req.userId
      },
      select: {
        id: true,
        title: true,
        author: true,
        totalPages: true,
        currentPage: true,
        readingProgress: true,
        lastReadAt: true,
        processedAt: true,
        createdAt: true,
        status: true,
        type: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add additional metadata
    const booksWithMetadata = books.map(book => {
      const content = book.content ? JSON.parse(book.content) : {};
      return {
        ...book,
        totalChapters: content.chapters ? content.chapters.length : 0,
        totalPositions: content.positions ? content.positions.length : 0,
        totalExercises: content.exercises ? content.exercises.length : 0
      };
    });

    res.json({
      success: true,
      books: booksWithMetadata
    });

  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific book details
router.get('/:bookId', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: req.userId
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    // Parse content
    const content = book.content ? JSON.parse(book.content) : {};
    const diagramMap = book.diagramMap ? JSON.parse(book.diagramMap) : {};

    res.json({
      success: true,
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        totalPages: book.totalPages,
        currentPage: book.currentPage,
        currentChapter: book.currentChapter,
        readingProgress: book.readingProgress,
        lastReadAt: book.lastReadAt,
        processedAt: book.processedAt,
        status: book.status,
        content: content,
        diagrams: diagramMap
      }
    });

  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get book content by chunks for pagination
router.get('/:bookId/chunks', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;
    const { page = 1, limit = 1, chapterFilter, contentType } = req.query;

    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: req.userId
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    const content = book.content ? JSON.parse(book.content) : {};
    let chunks = content.chunks || [];

    // Apply filters if provided
    if (chapterFilter) {
      const chapterId = parseInt(chapterFilter);
      chunks = chunks.filter(chunk => chunk.chapterId === chapterId);
    }

    if (contentType) {
      chunks = chunks.filter(chunk => chunk.contentType === contentType);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const currentChunks = chunks.slice(startIndex, endIndex);

    // Enhance chunks with additional metadata
    const enhancedChunks = currentChunks.map(chunk => {
      const baseChunk = {
        ...chunk,
        // Ensure chessContentSummary exists with proper structure
        chessContentSummary: chunk.chessContentSummary || {
          hasPositions: chunk.positions && chunk.positions.length > 0,
          hasDiagrams: chunk.diagrams && chunk.diagrams.length > 0,
          hasExercises: chunk.exercises && chunk.exercises.length > 0,
          hasMoves: false,
          hasFEN: false,
          positionCount: chunk.positions ? chunk.positions.length : 0,
          diagramCount: chunk.diagrams ? chunk.diagrams.length : 0,
          exerciseCount: chunk.exercises ? chunk.exercises.length : 0,
          moveCount: 0,
          fenCount: 0,
          chessTermCount: 0,
          complexity: 'beginner'
        },
        // Add reading metadata
        readingMeta: {
          estimatedReadingTime: chunk.readingTimeMinutes || Math.ceil((chunk.wordCount || 0) / 200),
          wordCount: chunk.wordCount || (chunk.content ? chunk.content.split(/\s+/).length : 0),
          characterCount: chunk.characterCount || (chunk.content ? chunk.content.length : 0),
          contentType: chunk.contentType || 'text',
          difficulty: chunk.chessContentSummary?.complexity || 'beginner'
        },
        // Add navigation info
        navigation: chunk.navigation || {
          isFirst: false,
          isLast: false,
          previousChunk: null,
          nextChunk: null,
          chunkIndex: 0,
          totalChunks: chunks.length
        }
      };

      return baseChunk;
    });

    // Get chapter information for context
    const chapters = content.chapters || [];
    const chapterInfo = chapters.map(chapter => ({
      id: chapter.id,
      title: chapter.title,
      chunkCount: chunks.filter(chunk => chunk.chapterId === chapter.id).length
    }));

    // Calculate overall reading progress
    const totalChunks = chunks.length;
    const currentChunkIndex = startIndex;
    const progressPercentage = totalChunks > 0 ? ((currentChunkIndex + currentChunks.length) / totalChunks) * 100 : 0;

    res.json({
      success: true,
      chunks: enhancedChunks,
      pagination: {
        currentPage: pageNum,
        totalPages: totalChunks,
        totalChunks: totalChunks,
        filteredChunks: chunks.length,
        hasNext: endIndex < chunks.length,
        hasPrev: pageNum > 1,
        pageSize: limitNum,
        startIndex: startIndex + 1,
        endIndex: Math.min(endIndex, chunks.length)
      },
      bookInfo: {
        id: book.id,
        title: book.title,
        author: book.author,
        currentPage: book.currentPage,
        readingProgress: book.readingProgress,
        lastReadAt: book.lastReadAt,
        status: book.status,
        totalChapters: chapters.length,
        progressPercentage: Math.round(progressPercentage)
      },
      chapters: chapterInfo,
      filters: {
        chapterFilter: chapterFilter || null,
        contentType: contentType || null,
        availableContentTypes: [...new Set(chunks.map(chunk => chunk.contentType || 'text'))]
      },
      statistics: {
        totalPositions: content.positions ? content.positions.length : 0,
        totalExercises: content.exercises ? content.exercises.length : 0,
        totalDiagrams: content.diagrams ? content.diagrams.length : 0,
        chessContentChunks: chunks.filter(chunk => chunk.hasChessContent).length,
        averageReadingTime: chunks.length > 0 ? 
          Math.ceil(chunks.reduce((sum, chunk) => sum + (chunk.readingTimeMinutes || 0), 0) / chunks.length) : 0
      }
    });

  } catch (error) {
    console.error('Error fetching book chunks:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update reading progress
router.put('/:bookId/progress', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;
    const { currentPage, currentChapter, readingProgress } = req.body;

    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: req.userId
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    const updatedBook = await prisma.book.update({
      where: {
        id: bookId
      },
      data: {
        currentPage: currentPage || book.currentPage,
        currentChapter: currentChapter || book.currentChapter,
        readingProgress: readingProgress || book.readingProgress,
        lastReadAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Reading progress updated',
      progress: {
        currentPage: updatedBook.currentPage,
        currentChapter: updatedBook.currentChapter,
        readingProgress: updatedBook.readingProgress,
        lastReadAt: updatedBook.lastReadAt
      }
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});



// Delete book
router.delete('/:bookId', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: req.userId
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    // Delete PDF file if it exists
    if (book.pdfPath) {
      try {
        await fs.unlink(book.pdfPath);
      } catch (error) {
        console.warn('Could not delete PDF file:', error.message);
      }
    }

    // Delete from database
    await prisma.book.delete({
      where: {
        id: bookId
      }
    });

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Save/update user notes for a book
router.put('/:bookId/notes', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;
    const { notes } = req.body;

    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: req.userId
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    const updatedBook = await prisma.book.update({
      where: {
        id: bookId
      },
      data: {
        notes: JSON.stringify(notes)
      }
    });

    res.json({
      success: true,
      message: 'Notes saved successfully'
    });

  } catch (error) {
    console.error('Error saving notes:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get chess positions from a book
router.get('/:bookId/positions', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: req.userId
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    const content = book.content ? JSON.parse(book.content) : {};
    const positions = content.positions || [];

    res.json({
      success: true,
      positions: positions,
      total: positions.length,
      bookTitle: book.title
    });

  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get chess exercises from a book
router.get('/:bookId/exercises', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;
    const { difficulty, type } = req.query;

    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: req.userId
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    const content = book.content ? JSON.parse(book.content) : {};
    let exercises = content.exercises || [];

    // Filter by difficulty if specified
    if (difficulty) {
      exercises = exercises.filter(ex => ex.difficulty === difficulty);
    }

    // Filter by type if specified
    if (type) {
      exercises = exercises.filter(ex => ex.type === type);
    }

    res.json({
      success: true,
      exercises: exercises,
      total: exercises.length,
      filters: {
        difficulty: difficulty || 'all',
        type: type || 'all'
      },
      bookTitle: book.title
    });

  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get chess diagrams from a book
router.get('/:bookId/diagrams', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: req.userId
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    const content = book.content ? JSON.parse(book.content) : {};
    const diagrams = content.diagrams || [];
    const chessBoardImages = content.chessBoardImages || [];

    res.json({
      success: true,
      diagrams: diagrams,
      chessBoardImages: chessBoardImages,
      total: diagrams.length + chessBoardImages.length,
      bookTitle: book.title
    });

  } catch (error) {
    console.error('Error fetching diagrams:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get specific chapter content
router.get('/:bookId/chapters/:chapterId', authenticateToken, async (req, res) => {
  try {
    const { bookId, chapterId } = req.params;

    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: req.userId
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    const content = book.content ? JSON.parse(book.content) : {};
    const chapters = content.chapters || [];
    const chapter = chapters.find(ch => ch.id === parseInt(chapterId));

    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: 'Chapter not found'
      });
    }

    res.json({
      success: true,
      chapter: chapter,
      bookTitle: book.title,
      totalChapters: chapters.length
    });

  } catch (error) {
    console.error('Error fetching chapter:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get book statistics
router.get('/:bookId/stats', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: req.userId
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    const content = book.content ? JSON.parse(book.content) : {};
    
    const stats = {
      totalChapters: content.chapters ? content.chapters.length : 0,
      totalPositions: content.positions ? content.positions.length : 0,
      totalExercises: content.exercises ? content.exercises.length : 0,
      totalDiagrams: content.diagrams ? content.diagrams.length : 0,
      totalMoves: content.moves ? content.moves.length : 0,
      totalAnnotations: content.annotations ? content.annotations.length : 0,
      chessBoardImages: content.chessBoardImages ? content.chessBoardImages.length : 0,
      readingProgress: book.readingProgress,
      currentPage: book.currentPage,
      totalPages: book.totalPages,
      wordCount: content.metadata ? content.metadata.wordCount : 0,
      exercisesByDifficulty: {
        beginner: content.exercises ? content.exercises.filter(ex => ex.difficulty === 'beginner').length : 0,
        intermediate: content.exercises ? content.exercises.filter(ex => ex.difficulty === 'intermediate').length : 0,
        advanced: content.exercises ? content.exercises.filter(ex => ex.difficulty === 'advanced').length : 0
      },
      exercisesByType: {
        tactical: content.exercises ? content.exercises.filter(ex => ex.type === 'tactical').length : 0,
        endgame: content.exercises ? content.exercises.filter(ex => ex.type === 'endgame').length : 0,
        opening: content.exercises ? content.exercises.filter(ex => ex.type === 'opening').length : 0,
        mate_in_n: content.exercises ? content.exercises.filter(ex => ex.type === 'mate_in_n').length : 0,
        best_move: content.exercises ? content.exercises.filter(ex => ex.type === 'best_move').length : 0,
        general: content.exercises ? content.exercises.filter(ex => ex.type === 'general').length : 0
      }
    };

    res.json({
      success: true,
      stats: stats,
      bookTitle: book.title,
      bookAuthor: book.author
    });

  } catch (error) {
    console.error('Error fetching book stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get content analysis and chunking options
router.get('/:bookId/analysis', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: req.userId
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    const content = book.content ? JSON.parse(book.content) : {};
    const chunks = content.chunks || [];
    const chapters = content.chapters || [];

    // Analyze content distribution
    const contentAnalysis = {
      overview: {
        totalChapters: chapters.length,
        totalChunks: chunks.length,
        averageChunkSize: chunks.length > 0 ? Math.round(chunks.reduce((sum, chunk) => sum + (chunk.wordCount || 0), 0) / chunks.length) : 0,
        totalWords: chunks.reduce((sum, chunk) => sum + (chunk.wordCount || 0), 0),
        estimatedReadingTime: Math.ceil(chunks.reduce((sum, chunk) => sum + (chunk.readingTimeMinutes || 0), 0))
      },
      chessContent: {
        totalPositions: content.positions ? content.positions.length : 0,
        totalExercises: content.exercises ? content.exercises.length : 0,
        totalDiagrams: content.diagrams ? content.diagrams.length : 0,
        chessContentChunks: chunks.filter(chunk => chunk.hasChessContent).length,
        textOnlyChunks: chunks.filter(chunk => !chunk.hasChessContent).length
      },
      chapterBreakdown: chapters.map(chapter => {
        const chapterChunks = chunks.filter(chunk => chunk.chapterId === chapter.id);
        return {
          id: chapter.id,
          title: chapter.title,
          chunkCount: chapterChunks.length,
          wordCount: chapterChunks.reduce((sum, chunk) => sum + (chunk.wordCount || 0), 0),
          hasChessContent: chapterChunks.some(chunk => chunk.hasChessContent),
          complexity: chapterChunks.length > 0 ? chapterChunks[0].chessContentSummary?.complexity || 'beginner' : 'beginner',
          estimatedReadingTime: Math.ceil(chapterChunks.reduce((sum, chunk) => sum + (chunk.readingTimeMinutes || 0), 0))
        };
      }),
      contentTypes: {
        distribution: chunks.reduce((acc, chunk) => {
          const type = chunk.contentType || 'text';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {}),
        available: [...new Set(chunks.map(chunk => chunk.contentType || 'text'))]
      },
      complexity: {
        beginner: chunks.filter(chunk => chunk.chessContentSummary?.complexity === 'beginner').length,
        intermediate: chunks.filter(chunk => chunk.chessContentSummary?.complexity === 'intermediate').length,
        advanced: chunks.filter(chunk => chunk.chessContentSummary?.complexity === 'advanced').length
      },
      readingOptions: {
        recommendedChunkSize: chunks.length > 0 ? 'current' : 'default',
        optimalReadingFlow: this.analyzeReadingFlow(chunks),
        suggestedFilters: this.suggestContentFilters(chunks)
      }
    };

    res.json({
      success: true,
      analysis: contentAnalysis,
      bookInfo: {
        id: book.id,
        title: book.title,
        author: book.author,
        status: book.status,
        processedAt: book.processedAt
      }
    });

  } catch (error) {
    console.error('Error analyzing book content:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Serve PDF file for viewing
router.get('/:bookId/pdf', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: req.userId
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    if (!book.pdfPath || !await fileExists(book.pdfPath)) {
      return res.status(404).json({
        success: false,
        error: 'PDF file not found'
      });
    }

    // Set appropriate headers for PDF viewing
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${book.originalFileName || 'book.pdf'}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Stream the PDF file
    const pdfBuffer = await fs.readFile(book.pdfPath);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error serving PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to serve PDF file'
    });
  }
});

// Check PDF availability
router.get('/:bookId/pdf-status', authenticateToken, async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: req.userId
      },
      select: {
        pdfPath: true,
        originalFileName: true
      }
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    const hasPDF = book.pdfPath && await fileExists(book.pdfPath);

    res.json({
      success: true,
      hasPDF,
      originalFileName: book.originalFileName
    });

  } catch (error) {
    console.error('Error checking PDF status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check PDF status'
    });
  }
});

// Helper function to check if file exists
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

module.exports = router;
