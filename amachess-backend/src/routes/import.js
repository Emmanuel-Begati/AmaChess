const express = require('express');
const router = express.Router();
const LichessService = require('../services/lichessService');

// Initialize Lichess service
const lichessService = new LichessService();

// Import games from Lichess
router.post('/lichess/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { maxGames = 50 } = req.body;

    // Fetch games from Lichess
    const games = await lichessService.getUserGames(username, maxGames);
    
    if (!games || games.length === 0) {
      return res.json({
        success: true,
        username: username,
        games: [],
        analysis: null,
        gamesImported: 0,
        message: 'No games found for this user'
      });
    }
    
    // Perform bulk analysis
    const analysis = await lichessService.analyzeBulkGames(games, username);

    // Format games for frontend (similar to lichess route)
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

    // Store games and analysis in database
    // ... database storage logic here ...

    res.json({
      success: true,
      username: username,
      games: formattedGames,
      gamesImported: games.length,
      analysis: analysis,
      fetchedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error importing from Lichess:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
