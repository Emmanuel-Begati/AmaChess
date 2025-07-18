const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const LichessService = require('../services/lichessService');
const ChesscomService = require('../services/chesscomService');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const lichessService = new LichessService();
const chesscomService = new ChesscomService();
const prisma = new PrismaClient();

// Protected dashboard data endpoint
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Get full user data including lichessUsername
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        lichessUsername: true,
        chesscomUsername: true,
        country: true,
        fideRating: true,
        createdAt: true
      }
    });

    let lichessStats = null;
    let chesscomStats = null;
    let lichessAnalytics = null;
    let chesscomAnalytics = null;
    let recentGames = [];
    
    // If user has a Lichess username, fetch their stats and analytics
    if (user.lichessUsername) {
      try {
        lichessStats = await lichessService.getUserStats(user.lichessUsername);
        lichessAnalytics = await lichessService.getUserRatingAnalytics(user.lichessUsername);
        
        // Fetch recent rapid games from Lichess
        const lichessGames = await lichessService.getRecentRapidGames(user.lichessUsername, 3);
        recentGames.push(...lichessGames);
      } catch (error) {
        console.error('Error fetching Lichess data for dashboard:', error);
        // Don't fail the entire request if Lichess API is down
      }
    }

    // If user has a Chess.com username, fetch their stats and analytics
    if (user.chesscomUsername) {
      try {
        chesscomStats = await chesscomService.getUserStats(user.chesscomUsername);
        chesscomAnalytics = await chesscomService.getUserRatingAnalytics(user.chesscomUsername);
        
        // Fetch recent rapid games from Chess.com
        const chesscomGames = await chesscomService.getRecentRapidGames(user.chesscomUsername, 3);
        recentGames.push(...chesscomGames);
      } catch (error) {
        console.error('Error fetching Chess.com data for dashboard:', error);
        // Don't fail the entire request if Chess.com API is down
      }
    }

    // Sort all games by date (most recent first) and take top 5
    recentGames.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    recentGames = recentGames.slice(0, 5);

    // Prepare stats with Lichess and Chess.com data if available
    const stats = {
      gamesPlayed: lichessStats?.gameCount?.total || chesscomStats?.gameCount?.total || 42,
      winRate: lichessStats ? Math.round(lichessStats.winRate * 100) : 
               chesscomStats ? Math.round(chesscomStats.winRate * 100) : 67.5,
      currentRating: lichessStats?.rating?.rapid || lichessStats?.rating?.blitz || lichessStats?.rating?.bullet || 
                    chesscomStats?.rating?.rapid || chesscomStats?.rating?.blitz || chesscomStats?.rating?.bullet || 1650,
      favoriteOpening: 'Sicilian Defense',
      lichess: lichessStats ? {
        rating: lichessStats.rating?.rapid || lichessStats.rating?.blitz || lichessStats.rating?.bullet,
        gamesPlayed: lichessStats.gameCount?.total,
        winRate: Math.round(lichessStats.winRate * 100),
        online: lichessStats.online,
        title: lichessStats.title
      } : null,
      chesscom: chesscomStats ? {
        rating: chesscomStats.rating?.rapid || chesscomStats.rating?.blitz || chesscomStats.rating?.bullet,
        gamesPlayed: chesscomStats.gameCount?.total,
        winRate: Math.round(chesscomStats.winRate * 100),
        online: chesscomStats.online,
        title: chesscomStats.title
      } : null
    };

    res.json({
      success: true,
      message: 'Welcome to your protected dashboard!',
      data: {
        user,
        stats,
        lichessStats,
        chesscomStats,
        lichessAnalytics,
        chesscomAnalytics,
        recentGames: recentGames.length > 0 ? recentGames : [
          { id: 'demo1', platform: 'demo', opponent: 'No recent games', result: 'draw', date: new Date().toISOString().split('T')[0], ratingChange: '0', timeControl: 'N/A', opening: 'Connect your accounts' }
        ]
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard data',
      message: error.message
    });
  }
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
