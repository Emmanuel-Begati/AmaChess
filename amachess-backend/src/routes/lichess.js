const express = require('express');
const router = express.Router();
const LichessService = require('../services/lichessService');
const { authenticateToken } = require('../middleware/auth');

// Initialize Lichess service
const lichessService = new LichessService();

/**
 * GET /api/games/:username
 * Fetch PGN games for a specific Lichess user
 */
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const {
      max = 10,
      rated = 'true',
      variant = 'standard',
      since,
      until,
      color,
      opening,
      rated: ratedParam,
      perfType,
      sort = 'dateDesc'
    } = req.query;

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

    // Build options object
    const options = {
      max: maxGames,
      rated: ratedParam || rated,
      variant,
      sort
    };

    // Add optional parameters if provided
    if (since) options.since = since;
    if (until) options.until = until;
    if (color) options.color = color;
    if (opening) options.opening = opening;
    if (perfType) options.perfType = perfType;

    console.log(`Fetching PGN games for user: ${username} with options:`, options);

    // Fetch PGN data from Lichess
    const pgnData = await lichessService.getLichessGamesPGN(username, options);

    // Count games in response
    const gameCount = lichessService.countGames(pgnData);

    // Set appropriate headers for PGN response
    res.set({
      'Content-Type': 'application/x-chess-pgn',
      'Content-Disposition': `attachment; filename="${username}_games.pgn"`,
      'X-Game-Count': gameCount,
      'X-User': username
    });

    // Return PGN data
    res.send(pgnData);

  } catch (error) {
    console.error('Error fetching Lichess games:', error);

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
        message: 'Too many requests to Lichess API. Please try again later.',
        retryAfter: 60
      });
    }

    if (error.message.includes('API token')) {
      return res.status(401).json({
        error: 'Authentication error',
        message: 'Invalid or missing Lichess API token'
      });
    }

    if (error.message.includes('No response')) {
      return res.status(503).json({
        error: 'Service unavailable',
        message: 'Lichess API is currently unavailable'
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch games from Lichess'
    });
  }
});

/**
 * GET /api/games/:username/json
 * Fetch games in JSON format with metadata
 */
router.get('/:username/json', async (req, res) => {
  try {
    const { username } = req.params;
    const options = {
      max: parseInt(req.query.max) || 10,
      rated: req.query.rated || 'true',
      variant: req.query.variant || 'standard',
      sort: req.query.sort || 'dateDesc'
    };

    // Add optional parameters
    if (req.query.since) options.since = req.query.since;
    if (req.query.until) options.until = req.query.until;
    if (req.query.color) options.color = req.query.color;
    if (req.query.opening) options.opening = req.query.opening;
    if (req.query.perfType) options.perfType = req.query.perfType;

    const pgnData = await lichessService.getLichessGamesPGN(username, options);
    const gameCount = lichessService.countGames(pgnData);

    res.json({
      username,
      gameCount,
      options,
      pgnData,
      fetchedAt: new Date().toISOString(),
      cacheStatus: 'fresh'
    });

  } catch (error) {
    console.error('Error fetching Lichess games (JSON):', error);
    res.status(500).json({
      error: 'Failed to fetch games',
      message: error.message
    });
  }
});

/**
 * GET /api/games/:username/stats
 * Get user statistics from Lichess
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

    console.log(`Fetching user statistics for: ${username}`);

    // Fetch user statistics from Lichess
    const stats = await lichessService.getUserStats(username);

    res.json({
      success: true,
      username,
      stats,
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching Lichess user stats:', error);

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
        message: 'Too many requests to Lichess API. Please try again later.',
        retryAfter: 60
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch user statistics from Lichess'
    });
  }
});

/**
 * GET /api/games/:username/cache
 * Get cached PGN files for a user
 */
router.get('/:username/cache', async (req, res) => {
  try {
    const { username } = req.params;
    const cachedFiles = await lichessService.getCachedFiles(username);

    res.json({
      username,
      cachedFiles,
      totalFiles: cachedFiles.length
    });

  } catch (error) {
    console.error('Error fetching cached files:', error);
    res.status(500).json({
      error: 'Failed to fetch cached files',
      message: error.message
    });
  }
});

/**
 * DELETE /api/games/:username/cache
 * Clear cache for a specific user
 */
router.delete('/:username/cache', async (req, res) => {
  try {
    const { username } = req.params;
    lichessService.clearCache(username);

    res.json({
      message: `Cache cleared for user: ${username}`,
      clearedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

/**
 * GET /api/games/status
 * Get Lichess API status and rate limit information
 */
router.get('/status', async (req, res) => {
  try {
    const status = await lichessService.getAPIStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting API status:', error);
    res.status(500).json({
      error: 'Failed to get API status',
      message: error.message
    });
  }
});

/**
 * GET /api/lichess/:username/analyze
 * Fetch games from Lichess and analyze them
 */
router.get('/:username/analyze', async (req, res) => {
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

    console.log(`Fetching and analyzing games for user: ${username}`);

    // First, get games in JSON format
    const games = await lichessService.getUserGames(username, parseInt(max));
    
    if (!games || games.length === 0) {
      return res.json({
        username,
        games: [],
        analysis: null,
        message: 'No games found for this user'
      });
    }

    // Analyze the bulk games
    const bulkAnalysis = await lichessService.analyzeBulkGames(games, username);

    // Format games for frontend
    const formattedGames = games.map(game => ({
      id: game.id,
      url: `https://lichess.org/${game.id}`,
      opponent: game.players.white.user?.name === username 
        ? game.players.black.user?.name || 'Anonymous'
        : game.players.white.user?.name || 'Anonymous',
      result: game.winner === 'white' 
        ? (game.players.white.user?.name === username ? 'Win' : 'Loss')
        : game.winner === 'black'
        ? (game.players.black.user?.name === username ? 'Win' : 'Loss')
        : 'Draw',
      rating: game.players.white.user?.name === username 
        ? game.players.white.rating
        : game.players.black.rating,
      opponentRating: game.players.white.user?.name === username 
        ? game.players.black.rating
        : game.players.white.rating,
      ratingChange: game.players.white.user?.name === username 
        ? (game.players.white.ratingDiff || 0)
        : (game.players.black.ratingDiff || 0),
      timeControl: `${Math.floor(game.clock?.initial / 60)}+${game.clock?.increment || 0}`,
      opening: game.opening?.name || 'Unknown',
      date: new Date(game.createdAt).toISOString().split('T')[0],
      accuracy: game.accuracy 
        ? (game.players.white.user?.name === username 
           ? game.accuracy.white 
           : game.accuracy.black)
        : null,
      platform: 'lichess',
      moves: game.moves,
      pgn: game.pgn
    }));

    res.json({
      success: true,
      username,
      games: formattedGames,
      analysis: bulkAnalysis,
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching and analyzing Lichess games:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'User not found',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Failed to fetch and analyze games',
      message: error.message
    });
  }
});

/**
 * GET /api/lichess/me/stats
 * Get authenticated user's own Lichess statistics
 */
router.get('/me/stats', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.lichessUsername) {
      return res.status(400).json({
        error: 'No Lichess username',
        message: 'Please add your Lichess username to your profile first'
      });
    }

    console.log(`Fetching Lichess stats for authenticated user: ${user.lichessUsername}`);

    // Fetch user statistics from Lichess
    const stats = await lichessService.getUserStats(user.lichessUsername);

    res.json({
      success: true,
      username: user.lichessUsername,
      stats,
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching user\'s Lichess stats:', error);

    // Handle different error types
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Lichess user not found',
        message: 'The Lichess username in your profile was not found. Please check your username.'
      });
    }

    if (error.message.includes('Rate limit exceeded')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests to Lichess API. Please try again later.',
        retryAfter: 60
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch your Lichess statistics'
    });
  }
});

/**
 * GET /api/lichess/me/games
 * Get authenticated user's own Lichess games
 */
router.get('/me/games', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { max = 10 } = req.query;
    
    if (!user.lichessUsername) {
      return res.status(400).json({
        error: 'No Lichess username',
        message: 'Please add your Lichess username to your profile first'
      });
    }

    console.log(`Fetching Lichess games for authenticated user: ${user.lichessUsername}`);

    // First, get games in JSON format
    const games = await lichessService.getUserGames(user.lichessUsername, parseInt(max));
    
    if (!games || games.length === 0) {
      return res.json({
        success: true,
        username: user.lichessUsername,
        games: [],
        analysis: null,
        message: 'No games found'
      });
    }

    // Analyze the bulk games
    const bulkAnalysis = await lichessService.analyzeBulkGames(games, user.lichessUsername);

    // Format games for frontend
    const formattedGames = games.map(game => ({
      id: game.id,
      url: `https://lichess.org/${game.id}`,
      opponent: game.players.white.user?.name === user.lichessUsername 
        ? game.players.black.user?.name || 'Anonymous'
        : game.players.white.user?.name || 'Anonymous',
      result: game.winner === 'white' 
        ? (game.players.white.user?.name === user.lichessUsername ? 'Win' : 'Loss')
        : game.winner === 'black'
        ? (game.players.black.user?.name === user.lichessUsername ? 'Win' : 'Loss')
        : 'Draw',
      rating: game.players.white.user?.name === user.lichessUsername 
        ? game.players.white.rating
        : game.players.black.rating,
      opponentRating: game.players.white.user?.name === user.lichessUsername 
        ? game.players.black.rating
        : game.players.white.rating,
      ratingChange: game.players.white.user?.name === user.lichessUsername 
        ? (game.players.white.ratingDiff || 0)
        : (game.players.black.ratingDiff || 0),
      timeControl: `${Math.floor(game.clock?.initial / 60)}+${game.clock?.increment || 0}`,
      opening: game.opening?.name || 'Unknown',
      date: new Date(game.createdAt).toISOString().split('T')[0],
      accuracy: game.accuracy 
        ? (game.players.white.user?.name === user.lichessUsername 
           ? game.accuracy.white 
           : game.accuracy.black)
        : null,
      platform: 'lichess',
      moves: game.moves,
      pgn: game.pgn
    }));

    res.json({
      success: true,
      username: user.lichessUsername,
      games: formattedGames,
      analysis: bulkAnalysis,
      fetchedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching user\'s Lichess games:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Lichess user not found',
        message: 'The Lichess username in your profile was not found. Please check your username.'
      });
    }

    if (error.message.includes('Rate limit exceeded')) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests to Lichess API. Please try again later.',
        retryAfter: 60
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch your Lichess games'
    });
  }
});

module.exports = router;
