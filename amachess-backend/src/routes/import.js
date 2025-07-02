const express = require('express');
const router = express.Router();
const lichessService = require('../services/lichessService');

// Import games from Lichess
router.post('/lichess/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { maxGames = 50 } = req.body;

    // Fetch games from Lichess
    const games = await lichessService.getUserGames(username, maxGames);
    
    // Perform bulk analysis
    const analysis = await lichessService.analyzeBulkGames(games);

    // Store games and analysis in database
    // ... database storage logic here ...

    res.json({
      success: true,
      gamesImported: games.length,
      analysis: analysis
    });
  } catch (error) {
    console.error('Error importing from Lichess:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Import games from Chess.com
router.post('/chesscom/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Chess.com API integration would go here
    // Note: Chess.com has different API endpoints and rate limits
    
    res.json({
      success: true,
      message: "Chess.com import not yet implemented"
    });
  } catch (error) {
    console.error('Error importing from Chess.com:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
