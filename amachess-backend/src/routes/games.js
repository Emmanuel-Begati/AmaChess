const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/games/save
 * Save a game to the database
 */
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const {
      gameType,
      pgn,
      fen,
      result,
      playerColor,
      opponent,
      timeControl,
      opening,
      analysis,
      metadata,
      source,
      sourceId,
      difficulty,
      moveCount,
      duration,
      accuracy
    } = req.body;

    if (!gameType || !pgn || !playerColor) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'gameType, pgn, and playerColor are required'
      });
    }

    const game = await prisma.game.create({
      data: {
        userId: req.user.id,
        gameType,
        pgn,
        fen,
        result,
        playerColor,
        opponent,
        timeControl,
        opening,
        analysis: analysis ? JSON.stringify(analysis) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        source,
        sourceId,
        difficulty,
        moveCount: moveCount || 0,
        duration,
        accuracy
      }
    });

    res.json({
      success: true,
      game: {
        ...game,
        analysis: game.analysis ? JSON.parse(game.analysis) : null,
        metadata: game.metadata ? JSON.parse(game.metadata) : null
      }
    });

  } catch (error) {
    console.error('Error saving game:', error);
    res.status(500).json({
      error: 'Failed to save game',
      details: error.message
    });
  }
});

/**
 * GET /api/games/my-games
 * Get all games for the authenticated user
 */
router.get('/my-games', authenticateToken, async (req, res) => {
  try {
    const { 
      gameType, 
      source, 
      limit = 50, 
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where = { userId: req.user.id };
    
    if (gameType) where.gameType = gameType;
    if (source) where.source = source;

    const games = await prisma.game.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        chatSessions: {
          select: {
            id: true,
            title: true,
            sessionType: true,
            createdAt: true
          }
        }
      }
    });

    const total = await prisma.game.count({ where });

    const formattedGames = games.map(game => ({
      ...game,
      analysis: game.analysis ? JSON.parse(game.analysis) : null,
      metadata: game.metadata ? JSON.parse(game.metadata) : null
    }));

    res.json({
      success: true,
      games: formattedGames,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching user games:', error);
    res.status(500).json({
      error: 'Failed to fetch games',
      details: error.message
    });
  }
});

/**
 * GET /api/games/:id
 * Get a specific game by ID
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const game = await prisma.game.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        chatSessions: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    });

    if (!game) {
      return res.status(404).json({
        error: 'Game not found'
      });
    }

    res.json({
      success: true,
      game: {
        ...game,
        analysis: game.analysis ? JSON.parse(game.analysis) : null,
        metadata: game.metadata ? JSON.parse(game.metadata) : null
      }
    });

  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({
      error: 'Failed to fetch game',
      details: error.message
    });
  }
});

/**
 * PUT /api/games/:id
 * Update a game
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Convert objects to JSON strings if needed
    if (updateData.analysis && typeof updateData.analysis === 'object') {
      updateData.analysis = JSON.stringify(updateData.analysis);
    }
    if (updateData.metadata && typeof updateData.metadata === 'object') {
      updateData.metadata = JSON.stringify(updateData.metadata);
    }

    const game = await prisma.game.updateMany({
      where: {
        id,
        userId: req.user.id
      },
      data: updateData
    });

    if (game.count === 0) {
      return res.status(404).json({
        error: 'Game not found'
      });
    }

    // Fetch the updated game
    const updatedGame = await prisma.game.findUnique({
      where: { id }
    });

    res.json({
      success: true,
      game: {
        ...updatedGame,
        analysis: updatedGame.analysis ? JSON.parse(updatedGame.analysis) : null,
        metadata: updatedGame.metadata ? JSON.parse(updatedGame.metadata) : null
      }
    });

  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({
      error: 'Failed to update game',
      details: error.message
    });
  }
});

/**
 * DELETE /api/games/:id
 * Delete a game
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.game.deleteMany({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (result.count === 0) {
      return res.status(404).json({
        error: 'Game not found'
      });
    }

    res.json({
      success: true,
      message: 'Game deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({
      error: 'Failed to delete game',
      details: error.message
    });
  }
});

/**
 * GET /api/games/stats/summary
 * Get game statistics summary for the user
 */
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const stats = await prisma.game.groupBy({
      by: ['gameType', 'result'],
      where: { userId: req.user.id },
      _count: true
    });

    const totalGames = await prisma.game.count({
      where: { userId: req.user.id }
    });

    const avgAccuracy = await prisma.game.aggregate({
      where: { 
        userId: req.user.id,
        accuracy: { not: null }
      },
      _avg: { accuracy: true }
    });

    const recentGames = await prisma.game.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        gameType: true,
        result: true,
        opponent: true,
        createdAt: true,
        accuracy: true
      }
    });

    res.json({
      success: true,
      stats: {
        totalGames,
        averageAccuracy: avgAccuracy._avg.accuracy || 0,
        gamesByType: stats,
        recentGames
      }
    });

  } catch (error) {
    console.error('Error fetching game stats:', error);
    res.status(500).json({
      error: 'Failed to fetch game statistics',
      details: error.message
    });
  }
});

module.exports = router;
