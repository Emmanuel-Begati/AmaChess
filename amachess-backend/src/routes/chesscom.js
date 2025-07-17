const express = require('express');
const router = express.Router();
const ChesscomService = require('../services/chesscomService');
const { authenticateToken } = require('../middleware/auth');

// Initialize Chess.com service
const chesscomService = new ChesscomService();

/**
 * GET /api/chesscom/:username/stats
 * Get user statistics from Chess.com
 */
router.get('/:username/stats', async (req, res) => {
  try {
    const { username } = req.params;

    // Validate username
    if (!username || username.length < 3) {
      return res.status(400).json({
        error: 'Invalid username',
        message: 'Username must be at least 3 characters long'
      });
    }

    console.log(`Fetching Chess.com user statistics for: ${username}`);

    // Fetch user statistics from Chess.com
    const stats = await chesscomService.getUserStats(username);

    res.json({
      success: true,
      username,
      stats,
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching Chess.com user stats:', error);

    // Handle different error types
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'User not found',
        message: error.message
      });
    }

    if (error.message.includes('Rate limit exceeded')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests to Chess.com API. Please try again later.',
        retryAfter: 60
      });
    }

    if (error.message.includes('Access forbidden')) {
      return res.status(403).json({
        error: 'Access forbidden',
        message: 'Access forbidden to Chess.com API'
      });
    }

    if (error.message.includes('No response')) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Chess.com API is currently unavailable'
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user statistics from Chess.com'
    });
  }
});

/**
 * GET /api/chesscom/:username/games
 * Fetch recent games for a specific Chess.com user
 */
router.get('/:username/games', async (req, res) => {
  try {
    const { username } = req.params;
    const { max = 10 } = req.query;

    // Validate username
    if (!username || username.length < 3) {
      return res.status(400).json({
        error: 'Invalid username',
        message: 'Username must be at least 3 characters long'
      });
    }

    // Validate max parameter
    const maxGames = parseInt(max);
    if (isNaN(maxGames) || maxGames < 1 || maxGames > 100) {
      return res.status(400).json({
        error: 'Invalid max parameter',
        message: 'max must be a number between 1 and 100'
      });
    }

    console.log(`Fetching Chess.com games for user: ${username}, max: ${maxGames}`);

    // Fetch games from Chess.com
    const games = await chesscomService.getUserGames(username, maxGames);

    res.json({
      success: true,
      username,
      gameCount: games.length,
      games,
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching Chess.com games:', error);

    // Handle different error types
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({
        error: 'User not found',
        message: error.message
      });
    }

    if (error.message && error.message.includes('Rate limit exceeded')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests to Chess.com API. Please try again later.',
        retryAfter: 60
      });
    }

    if (error.message && error.message.includes('No response')) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Chess.com API is currently unavailable'
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch games from Chess.com'
    });
  }
});

/**
 * GET /api/chesscom/:username/profile
 * Get user profile information from Chess.com
 */
router.get('/:username/profile', async (req, res) => {
  try {
    const { username } = req.params;

    // Validate username
    if (!username || username.length < 3) {
      return res.status(400).json({
        error: 'Invalid username',
        message: 'Username must be at least 3 characters long'
      });
    }

    console.log(`Fetching Chess.com profile for user: ${username}`);

    // We can extract profile data from getUserStats since it calls the profile endpoint
    const stats = await chesscomService.getUserStats(username);
    
    // Extract just the profile-related information
    const profile = {
      username: stats.username,
      name: stats.name,
      title: stats.title,
      country: stats.country,
      location: stats.location,
      joined: stats.joined,
      lastOnline: stats.lastOnline,
      followers: stats.followers,
      isStreamer: stats.isStreamer,
      twitchUrl: stats.twitchUrl,
      fideRating: stats.fideRating,
      avatar: stats.avatar,
      online: stats.online
    };

    res.json({
      success: true,
      username,
      profile,
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching Chess.com profile:', error);

    // Handle different error types
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({
        error: 'User not found',
        message: error.message
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch profile from Chess.com'
    });
  }
});

module.exports = router;
