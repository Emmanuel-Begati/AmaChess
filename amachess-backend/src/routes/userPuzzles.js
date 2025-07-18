const express = require('express');
const router = express.Router();
const databasePuzzleService = require('../services/databasePuzzleService');
const { authenticateToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Record puzzle attempt (protected route)
router.post('/attempts', authenticateToken, async (req, res) => {
  try {
    const {
      puzzleId,
      isCompleted,
      isSolved,
      movesPlayed,
      timeSpent,
      hintsUsed,
      solutionShown,
      accuracy
    } = req.body;

    if (!puzzleId) {
      return res.status(400).json({
        success: false,
        error: 'puzzleId is required'
      });
    }

    const attemptData = {
      isCompleted: isCompleted || false,
      isSolved: isSolved || false,
      movesPlayed: movesPlayed || [],
      timeSpent: timeSpent || 0,
      hintsUsed: hintsUsed || 0,
      solutionShown: solutionShown || false,
      accuracy: accuracy || null
    };

    const attempt = await databasePuzzleService.recordPuzzleAttempt(
      req.userId, 
      puzzleId, 
      attemptData
    );

    res.json({
      success: true,
      data: attempt,
      message: 'Puzzle attempt recorded successfully'
    });

  } catch (error) {
    console.error('Error recording puzzle attempt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record puzzle attempt',
      message: error.message
    });
  }
});

// Get user puzzle statistics (protected route)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userStats = await databasePuzzleService.getUserStats(req.userId);

    res.json({
      success: true,
      data: userStats
    });

  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics',
      message: error.message
    });
  }
});

// Get user's puzzle attempt history (protected route)
router.get('/attempts', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, completed } = req.query;

    const where = { userId: req.userId };
    if (completed !== undefined) {
      where.isCompleted = completed === 'true';
    }

    const [attempts, total] = await Promise.all([
      prisma.puzzleAttempt.findMany({
        where,
        include: {
          puzzle: {
            select: {
              lichessId: true,
              rating: true,
              themes: true,
              difficulty: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit)
      }),
      prisma.puzzleAttempt.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        attempts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error getting user attempts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user attempts',
      message: error.message
    });
  }
});

// Start a new puzzle session (protected route)
router.post('/sessions', authenticateToken, async (req, res) => {
  try {
    const {
      sessionType = 'training',
      themes = [],
      difficulty,
      targetPuzzleCount = 10
    } = req.body;

    const session = await prisma.puzzleSession.create({
      data: {
        userId: req.userId,
        sessionType,
        themes,
        difficulty,
        totalPuzzles: targetPuzzleCount
      }
    });

    res.json({
      success: true,
      data: session,
      message: 'Puzzle session started successfully'
    });

  } catch (error) {
    console.error('Error starting puzzle session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start puzzle session',
      message: error.message
    });
  }
});

// Update puzzle session (protected route)
router.put('/sessions/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { puzzlesSolved, totalTime, accuracy, isCompleted } = req.body;

    const session = await prisma.puzzleSession.update({
      where: {
        id: sessionId,
        userId: req.userId // Ensure user can only update their own sessions
      },
      data: {
        puzzlesSolved,
        totalTime,
        accuracy,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      data: session,
      message: 'Puzzle session updated successfully'
    });

  } catch (error) {
    console.error('Error updating puzzle session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update puzzle session',
      message: error.message
    });
  }
});

// Get user's active puzzle sessions (protected route)
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const { active = false } = req.query;

    const where = { userId: req.userId };
    if (active === 'true') {
      where.isCompleted = false;
    }

    const sessions = await prisma.puzzleSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10 // Limit to recent 10 sessions
    });

    res.json({
      success: true,
      data: sessions
    });

  } catch (error) {
    console.error('Error getting user sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user sessions',
      message: error.message
    });
  }
});

// Get personalized puzzle recommendations (protected route)
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    // Get user stats to make personalized recommendations
    const userStats = await databasePuzzleService.getUserStats(req.userId);
    
    // Calculate recommended rating range based on user's current rating
    const baseRating = userStats.currentPuzzleRating || 1500;
    const ratingRange = 200;
    
    const filters = {
      minRating: Math.max(800, baseRating - ratingRange),
      maxRating: Math.min(3000, baseRating + ratingRange)
    };

    // If user has favorite themes, include them
    if (userStats.favoriteThemes && userStats.favoriteThemes.length > 0) {
      filters.themes = userStats.favoriteThemes.slice(0, 3); // Top 3 favorite themes
    }

    const recommendations = await Promise.all([
      databasePuzzleService.getRandomPuzzle(filters),
      databasePuzzleService.getRandomPuzzle(filters),
      databasePuzzleService.getRandomPuzzle(filters)
    ]);

    res.json({
      success: true,
      data: {
        recommendations,
        rationale: {
          baseRating,
          ratingRange: [filters.minRating, filters.maxRating],
          favoriteThemes: userStats.favoriteThemes || [],
          currentStreak: userStats.currentStreak
        }
      }
    });

  } catch (error) {
    console.error('Error getting puzzle recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get puzzle recommendations',
      message: error.message
    });
  }
});

module.exports = router;
