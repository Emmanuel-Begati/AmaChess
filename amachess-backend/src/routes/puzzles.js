const express = require('express');
const router = express.Router();
const databasePuzzleService = require('../services/databasePuzzleService');
const { authenticateToken: auth } = require('../middleware/auth'); // For protected routes

// Use database service as the single source of truth
const activePuzzleService = databasePuzzleService;

// Get a random puzzle with adaptive difficulty
router.get('/random', async (req, res) => {
  try {
    const { themes, difficulty, minRating, maxRating, userId } = req.query;
    
    const filters = {};
    if (themes) {
      filters.themes = themes.split(',').map(t => t.trim());
    }
    if (difficulty) {
      filters.difficulty = difficulty;
    }
    if (minRating) {
      filters.minRating = parseInt(minRating);
    }
    if (maxRating) {
      filters.maxRating = parseInt(maxRating);
    }
    
    // Pass userId for adaptive difficulty
    const puzzle = await activePuzzleService.getRandomPuzzle(filters, userId);
    
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

    const puzzles = await activePuzzleService.getPuzzlesByTheme(theme, parseInt(limit));
    
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

// Get puzzle by ID
router.get('/:puzzleId', async (req, res) => {
  try {
    const { puzzleId } = req.params;
    
    const puzzle = await activePuzzleService.getPuzzleById(puzzleId);
    
    if (!puzzle) {
      return res.status(404).json({
        success: false,
        error: 'Puzzle not found'
      });
    }
    
    res.json({
      success: true,
      data: puzzle
    });
  } catch (error) {
    console.error('Error getting puzzle by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load puzzle',
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

// Get puzzle with complete game context
router.get('/:puzzleId/context', async (req, res) => {
  try {
    const { puzzleId } = req.params;
    
    const puzzle = await activePuzzleService.getPuzzleById(puzzleId);
    
    if (!puzzle) {
      return res.status(404).json({
        success: false,
        error: 'Puzzle not found'
      });
    }
    
    res.json({
      success: true,
      data: puzzle
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
    
    const puzzle = await activePuzzleService.getPuzzleById(puzzleId);
    
    if (!puzzle) {
      return res.status(404).json({
        success: false,
        error: 'Puzzle not found'
      });
    }
    
    res.json({
      success: true,
      data: puzzle
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

// Get user puzzle statistics
router.get('/user/:userId/stats', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userStats = await activePuzzleService.getUserStats(userId);
    
    res.json({
      success: true,
      data: userStats
    });
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load user statistics',
      message: error.message
    });
  }
});

// Update user statistics after puzzle completion
router.post('/user/:userId/stats/update', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { puzzleData, isCorrect, timeSpent, hintsUsed, solutionShown } = req.body;
    
    console.log('🎯 PUZZLE STATS UPDATE REQUEST:');
    console.log('- User ID:', userId);
    console.log('- Puzzle ID:', puzzleData?.id);
    console.log('- Is Correct:', isCorrect);
    console.log('- Time Spent:', timeSpent);
    console.log('- Hints Used:', hintsUsed);
    console.log('- Solution Shown:', solutionShown);
    console.log('- Auth User:', req.user?.id);
    
    // Verify user exists
    const userExists = await activePuzzleService.getUserStats(userId);
    console.log('- User exists in DB:', !!userExists);
    
    const updatedStats = await activePuzzleService.updateUserStatsAfterPuzzle(
      userId, 
      puzzleData, 
      isCorrect, 
      timeSpent,
      hintsUsed || 0,
      solutionShown || false
    );
    
    console.log('✅ PUZZLE STATS UPDATED SUCCESSFULLY');
    console.log('- New total solved:', updatedStats.totalPuzzlesSolved);
    console.log('- New rating:', updatedStats.currentPuzzleRating);
    console.log('- New streak:', updatedStats.currentStreak);
    
    res.json({
      success: true,
      data: updatedStats
    });
  } catch (error) {
    console.error('❌ ERROR UPDATING USER STATS:', error);
    console.error('- Error message:', error.message);
    console.error('- Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to update user statistics',
      message: error.message
    });
  }
});

// Get daily challenge puzzle
router.get('/daily-challenge', async (req, res) => {
  try {
    const dailyChallenge = await activePuzzleService.getDailyChallenge();
    
    res.json({
      success: true,
      data: dailyChallenge
    });
  } catch (error) {
    console.error('Error getting daily challenge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load daily challenge',
      message: error.message
    });
  }
});

// Get daily challenge statistics
router.get('/daily-challenge/stats', async (req, res) => {
  try {
    const { date } = req.query;
    
    const challengeStats = await activePuzzleService.getDailyChallengeStats(date);
    
    res.json({
      success: true,
      data: challengeStats
    });
  } catch (error) {
    console.error('Error getting daily challenge stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load daily challenge statistics',
      message: error.message
    });
  }
});

// Get puzzle rating leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const leaderboard = await activePuzzleService.getLeaderboard(parseInt(limit));
    
    res.json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load leaderboard',
      message: error.message
    });
  }
});

// Test endpoint for debugging API connectivity
router.get('/user/:userId/test', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('🧪 TEST ENDPOINT CALLED:');
    console.log('- User ID from params:', userId);
    console.log('- Auth User ID:', req.user?.id);
    console.log('- Auth User Email:', req.user?.email);
    
    res.json({
      success: true,
      data: {
        paramUserId: userId,
        authUserId: req.user?.id,
        authUserEmail: req.user?.email,
        message: 'API connectivity test successful'
      }
    });
  } catch (error) {
    console.error('❌ TEST ENDPOINT ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Test endpoint failed',
      message: error.message
    });
  }
});

// Get user performance analytics
router.get('/user/:userId/analytics', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 7 } = req.query; // Default to last 7 days
    
    const analytics = await activePuzzleService.getUserAnalytics(userId, parseInt(days));
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error getting user analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load user analytics',
      message: error.message
    });
  }
});

module.exports = router;
