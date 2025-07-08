const express = require('express');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Protected dashboard data endpoint
router.get('/dashboard', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to your protected dashboard!',
    data: {
      user: req.user,
      stats: {
        gamesPlayed: 42,
        winRate: 67.5,
        currentRating: 1650,
        favoriteOpening: 'Sicilian Defense'
      },
      recentGames: [
        { id: 1, opponent: 'Player1', result: 'win', date: '2025-01-08' },
        { id: 2, opponent: 'Player2', result: 'loss', date: '2025-01-07' },
        { id: 3, opponent: 'Player3', result: 'draw', date: '2025-01-06' }
      ]
    }
  });
});

// Protected user settings endpoint
router.get('/settings', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'User settings retrieved successfully',
    data: {
      user: req.user,
      preferences: {
        theme: 'dark',
        boardStyle: 'classic',
        soundEnabled: true,
        notifications: true
      }
    }
  });
});

// Protected games history endpoint
router.get('/games', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Games history retrieved successfully',
    data: {
      user: req.user,
      games: [
        {
          id: 1,
          white: req.user.email,
          black: 'opponent1@example.com',
          result: '1-0',
          moves: 'e4 e5 Nf3 Nc6 Bb5',
          date: '2025-01-08',
          timeControl: '10+0'
        },
        {
          id: 2,
          white: 'opponent2@example.com',
          black: req.user.email,
          result: '0-1',
          moves: 'd4 Nf6 c4 e6 Nc3',
          date: '2025-01-07',
          timeControl: '15+10'
        }
      ]
    }
  });
});

module.exports = router;
