const express = require('express');
const router = express.Router();
const puzzleService = require('../services/puzzleService'); // Legacy CSV service
const databasePuzzleService = require('../services/databasePuzzleService'); // New database service
const auth = require('../middleware/auth'); // For protected routes

// Choose which service to use based on environment or preference
const USE_DATABASE = process.env.USE_DATABASE_PUZZLES === 'true' || true; // Default to database
const activePuzzleService = USE_DATABASE ? databasePuzzleService : puzzleService;

// Get a random puzzle with optional filters
router.get('/random', async (req, res) => {
  try {
    const { 
      minRating, 
      maxRating, 
      themes, 
      difficulty 
    } = req.query;

    const filters = {};
    
    if (minRating) filters.minRating = parseInt(minRating);
    if (maxRating) filters.maxRating = parseInt(maxRating);
    if (themes) filters.themes = Array.isArray(themes) ? themes : themes.split(',');
    if (difficulty) filters.difficulty = difficulty;

    const puzzle = await activePuzzleService.getRandomPuzzle(filters);
    
    res.json({
      success: true,
      data: puzzle
    });
  } catch (error) {
    console.error('Error getting random puzzle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load puzzle',
      message: error.message
    });
  }
});

// Get puzzles by theme
router.get('/theme/:theme', async (req, res) => {
  try {
    const { theme } = req.params;
    const { limit = 10 } = req.query;

    const puzzles = await puzzleService.getPuzzlesByTheme(theme, parseInt(limit));
    
    res.json({
      success: true,
      data: puzzles,
      count: puzzles.length
    });
  } catch (error) {
    console.error('Error getting puzzles by theme:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load puzzles',
      message: error.message
    });
  }
});

// Get available themes
router.get('/themes', async (req, res) => {
  try {
    const themes = await activePuzzleService.getAvailableThemes();
    
    res.json({
      success: true,
      data: themes
    });
  } catch (error) {
    console.error('Error getting themes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load themes',
      message: error.message
    });
  }
});

// Get puzzle database statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await activePuzzleService.getPuzzleStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting puzzle stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load stats',
      message: error.message
    });
  }
});

// Validate a move against the puzzle solution
router.post('/validate', async (req, res) => {
  try {
    const { puzzleId, userMove, moveIndex = 0 } = req.body;

    if (!puzzleId || !userMove) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: puzzleId and userMove'
      });
    }

    // This is a basic validation - in a real app you'd want to store puzzle state
    // For now, we'll just check if the move matches the expected solution move
    
    res.json({
      success: true,
      data: {
        isCorrect: false, // You'll need to implement proper move validation
        feedback: 'Move validation not fully implemented yet',
        nextMove: null
      }
    });
  } catch (error) {
    console.error('Error validating move:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate move',
      message: error.message
    });
  }
});

// Initialize puzzle database (load puzzles into memory)
router.post('/initialize', async (req, res) => {
  try {
    await puzzleService.loadPuzzles();
    const stats = puzzleService.getPuzzleStats();
    
    res.json({
      success: true,
      message: 'Puzzle database initialized successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error initializing puzzle database:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize puzzle database',
      message: error.message
    });
  }
});

// Get puzzle with complete game context (PGN, etc.)
router.get('/:puzzleId/context', async (req, res) => {
  try {
    const { puzzleId } = req.params;
    
    const puzzleWithContext = await puzzleService.getPuzzleWithGameContext(puzzleId);
    
    if (!puzzleWithContext) {
      return res.status(404).json({
        success: false,
        error: 'Puzzle not found'
      });
    }
    
    res.json({
      success: true,
      data: puzzleWithContext
    });
  } catch (error) {
    console.error('Error getting puzzle context:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load puzzle context',
      message: error.message
    });
  }
});

// Get enhanced puzzle with analysis data
router.get('/:puzzleId/analysis', async (req, res) => {
  try {
    const { puzzleId } = req.params;
    
    const puzzleAnalysis = await puzzleService.getPuzzleWithAnalysis(puzzleId);
    
    if (!puzzleAnalysis) {
      return res.status(404).json({
        success: false,
        error: 'Puzzle not found'
      });
    }
    
    res.json({
      success: true,
      data: puzzleAnalysis
    });
  } catch (error) {
    console.error('Error getting puzzle analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load puzzle analysis',
      message: error.message
    });
  }
});

// Validate puzzle solution
router.post('/:puzzleId/validate', async (req, res) => {
  try {
    const { puzzleId } = req.params;
    const { moves } = req.body;
    
    const puzzle = await activePuzzleService.getPuzzleById(puzzleId);
    if (!puzzle) {
      return res.status(404).json({
        success: false,
        error: 'Puzzle not found'
      });
    }
    
    // Check if the provided moves match the puzzle solution
    const isCorrect = moves.every((move, index) => 
      index < puzzle.solution.length && move === puzzle.solution[index]
    );
    
    const isComplete = moves.length === puzzle.solution.length && isCorrect;
    
    res.json({
      success: true,
      data: {
        correct: isCorrect,
        complete: isComplete,
        moveIndex: moves.length - 1,
        expectedMove: puzzle.solution[moves.length - 1] || null,
        solutionLength: puzzle.solution.length,
        progress: (moves.length / puzzle.solution.length) * 100
      }
    });
  } catch (error) {
    console.error('Error validating puzzle solution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate solution',
      message: error.message
    });
  }
});

module.exports = router;
