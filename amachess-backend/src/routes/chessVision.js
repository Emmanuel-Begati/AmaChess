const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');
const FormData = require('form-data');

// For now, we'll simulate the chess vision service
// In a real implementation, you would integrate with OpenCV or similar

// Mock chess detection data - in reality this would come from computer vision
const mockBoundingBoxes = [
  { page: 1, x: 100, y: 150, width: 200, height: 200, confidence: 0.95 },
  { page: 1, x: 400, y: 300, width: 180, height: 180, confidence: 0.87 },
  { page: 2, x: 120, y: 200, width: 190, height: 190, confidence: 0.92 },
];

// Mock FEN responses - in reality this would come from chess position recognition
const mockFenResponses = {
  '1_100_150_200_200': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  '1_400_300_180_180': 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
  '2_120_200_190_190': 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2',
};

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
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

// Python service base URL
const PYTHON_SERVICE_URL = 'http://localhost:5000';

/**
 * POST /api/get-board-bounds
 * Accept a PDF file and forward it to Python service for chess board detection
 * Returns: { success: boolean, boundingBoxes: ChessBoundingBox[] }
 */
router.post('/get-board-bounds', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'PDF file is required'
      });
    }

    console.log(`Processing PDF file: ${req.file.originalname}, Size: ${req.file.size} bytes`);

    // Create form data to send to Python service
    const formData = new FormData();
    formData.append('pdf', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // Forward to Python service with increased timeout
    const response = await axios.post(`${PYTHON_SERVICE_URL}/detect-boards`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 120000, // 2 minute timeout for PDF processing
      maxContentLength: 50 * 1024 * 1024, // 50MB
      maxBodyLength: 50 * 1024 * 1024, // 50MB
    });

    // Return the response from Python service
    res.json({
      success: true,
      boundingBoxes: response.data.boundingBoxes || [],
      message: response.data.message || 'Chess boards detected successfully',
      pdf_hash: response.data.pdf_hash // Include PDF hash for FEN extraction
    });

  } catch (error) {
    console.error('Error calling Python service for board detection:', error);
    
    let errorMessage = 'Failed to detect chess boards';
    let statusCode = 500;

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Python service is not available. Please ensure it is running on localhost:5000';
      statusCode = 503;
    } else if (error.response) {
      errorMessage = error.response.data?.message || 'Python service error';
      statusCode = error.response.status;
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Request timeout - PDF processing took too long';
      statusCode = 408;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
});

/**
 * POST /api/get-fen
 * Accept bounding box coordinates and forward to Python service for FEN extraction
 * Body: { page: number, x: number, y: number, width: number, height: number }
 * Returns: { success: boolean, fen: string }
 */
router.post('/get-fen', async (req, res) => {
  try {
    const { page, x, y, width, height, pdf_hash } = req.body;
    
    if (page === undefined || x === undefined || y === undefined || !width || !height) {
      return res.status(400).json({
        success: false,
        message: 'Page, x, y, width, and height coordinates are required'
      });
    }

    console.log(`Extracting FEN from bounding box: page=${page}, x=${x}, y=${y}, width=${width}, height=${height}`);

    // Forward to Python service
    const response = await axios.post(`${PYTHON_SERVICE_URL}/extract_fen`, {
      page,
      x,
      y,
      width,
      height,
      pdf_hash
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    // Return the response from Python service
    res.json({
      success: true,
      fen: response.data.fen || '',
      confidence: response.data.confidence,
      message: response.data.message || 'FEN extracted successfully'
    });

  } catch (error) {
    console.error('Error calling Python service for FEN extraction:', error);
    
    let errorMessage = 'Failed to extract FEN';
    let statusCode = 500;

    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Python service is not available. Please ensure it is running on localhost:5000';
      statusCode = 503;
    } else if (error.response) {
      errorMessage = error.response.data?.message || 'Python service error';
      statusCode = error.response.status;
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Request timeout - FEN extraction took too long';
      statusCode = 408;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
});

/**
 * POST /api/detect-chess
 * Detect chess diagrams on a specific page of a PDF
 * Body: { pdfUrl: string, page: number }
 * Returns: { success: boolean, boundingBoxes: ChessBoundingBox[] }
 */
router.post('/detect-chess', async (req, res) => {
  try {
    const { pdfUrl, page } = req.body;
    
    if (!pdfUrl || !page) {
      return res.status(400).json({
        success: false,
        message: 'PDF URL and page number are required'
      });
    }

    console.log(`Detecting chess diagrams on page ${page} of PDF: ${pdfUrl}`);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Filter mock data for the requested page
    const boundingBoxes = mockBoundingBoxes.filter(box => box.page === page);

    res.json({
      success: true,
      boundingBoxes,
      message: `Found ${boundingBoxes.length} chess diagrams on page ${page}`
    });

  } catch (error) {
    console.error('Error detecting chess diagrams:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to detect chess diagrams',
      error: error.message
    });
  }
});



/**
 * POST /api/detect-chess-all
 * Detect chess diagrams on all pages of a PDF
 * Body: { pdfUrl: string, maxPages?: number }
 * Returns: { success: boolean, boundingBoxes: ChessBoundingBox[] }
 */
router.post('/detect-chess-all', async (req, res) => {
  try {
    const { pdfUrl, maxPages = 10 } = req.body;
    
    if (!pdfUrl) {
      return res.status(400).json({
        success: false,
        message: 'PDF URL is required'
      });
    }

    console.log(`Detecting chess diagrams on all pages of PDF: ${pdfUrl}`);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return all mock bounding boxes (limited by maxPages)
    const boundingBoxes = mockBoundingBoxes.filter(box => box.page <= maxPages);

    res.json({
      success: true,
      boundingBoxes,
      message: `Found ${boundingBoxes.length} chess diagrams across all pages`
    });

  } catch (error) {
    console.error('Error detecting chess diagrams on all pages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to detect chess diagrams on all pages',
      error: error.message
    });
  }
});

/**
 * POST /api/batch-get-fen
 * Extract FENs from multiple bounding boxes
 * Body: { pdfUrl: string, boundingBoxes: ChessBoundingBox[] }
 * Returns: { success: boolean, fens: string[] }
 */
router.post('/batch-get-fen', async (req, res) => {
  try {
    const { pdfUrl, boundingBoxes } = req.body;
    
    if (!pdfUrl || !Array.isArray(boundingBoxes)) {
      return res.status(400).json({
        success: false,
        message: 'PDF URL and bounding boxes array are required'
      });
    }

    console.log(`Extracting FENs from ${boundingBoxes.length} bounding boxes`);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Extract FENs for each bounding box
    const fens = boundingBoxes.map(box => {
      const key = `${box.page}_${box.x}_${box.y}_${box.width}_${box.height}`;
      return mockFenResponses[key] || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    });

    res.json({
      success: true,
      fens,
      message: `Extracted ${fens.length} FENs successfully`
    });

  } catch (error) {
    console.error('Error in batch FEN extraction:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extract FENs from bounding boxes',
      error: error.message
    });
  }
});

/**
 * POST /api/validate-chess
 * Validate if a bounding box actually contains a chess diagram
 * Body: { pdfUrl: string, page: number, x: number, y: number, width: number, height: number }
 * Returns: { success: boolean, isValid: boolean, confidence?: number }
 */
router.post('/validate-chess', async (req, res) => {
  try {
    const { pdfUrl, page, x, y, width, height } = req.body;
    
    if (!pdfUrl || !page || x === undefined || y === undefined || !width || !height) {
      return res.status(400).json({
        success: false,
        message: 'PDF URL, page, x, y, width, and height are required'
      });
    }

    console.log(`Validating chess diagram at: page=${page}, x=${x}, y=${y}, width=${width}, height=${height}`);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Simple validation - check if we have a FEN for this position
    const key = `${page}_${x}_${y}_${width}_${height}`;
    const isValid = !!mockFenResponses[key];

    res.json({
      success: true,
      isValid,
      confidence: isValid ? 0.90 : 0.20,
      message: isValid ? 'Valid chess diagram detected' : 'No chess diagram found'
    });

  } catch (error) {
    console.error('Error validating chess bounding box:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate chess bounding box',
      error: error.message
    });
  }
});

/**
 * POST /api/chess-stats
 * Get chess detection statistics for a PDF
 * Body: { pdfUrl: string }
 * Returns: { success: boolean, stats: object }
 */
router.post('/chess-stats', async (req, res) => {
  try {
    const { pdfUrl } = req.body;
    
    if (!pdfUrl) {
      return res.status(400).json({
        success: false,
        message: 'PDF URL is required'
      });
    }

    console.log(`Getting chess detection stats for PDF: ${pdfUrl}`);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Calculate stats from mock data
    const totalDiagrams = mockBoundingBoxes.length;
    const pagesWithChess = [...new Set(mockBoundingBoxes.map(box => box.page))].length;
    const totalPages = Math.max(...mockBoundingBoxes.map(box => box.page));
    const averageConfidence = mockBoundingBoxes.reduce((sum, box) => sum + (box.confidence || 0), 0) / totalDiagrams;

    const stats = {
      totalPages,
      pagesWithChess,
      totalDiagrams,
      averageConfidence: Math.round(averageConfidence * 100) / 100
    };

    res.json({
      success: true,
      stats,
      message: 'Chess detection statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting chess detection stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chess detection statistics',
      error: error.message
    });
  }
});

module.exports = router;
