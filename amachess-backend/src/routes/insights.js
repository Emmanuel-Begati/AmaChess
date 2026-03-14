const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const InsightsService = require('../services/insightsService');

const prisma = new PrismaClient();
const insightsService = new InsightsService();

/**
 * GET /api/insights/dashboard
 * Generate AI-powered coaching insights from the user's recent Lichess games.
 * Returns both the AI coaching text and compact analysis stats.
 */
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Get the user's Lichess username from the database
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { lichessUsername: true }
    });

    if (!user?.lichessUsername) {
      return res.status(400).json({
        success: false,
        error: 'No Lichess username',
        message: 'Please add your Lichess username in Settings to get AI coaching insights.'
      });
    }

    const forceRefresh = req.query.refresh === 'true';

    const result = await insightsService.generateDashboardInsights(
      user.lichessUsername,
      forceRefresh
    );

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error generating dashboard insights:', error);

    if (error.message?.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Lichess user not found',
        message: 'The Lichess username in your profile was not found. Please check your username in Settings.'
      });
    }

    if (error.message?.includes('Rate limit')) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again in a minute.',
        retryAfter: 60
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to generate insights',
      message: 'Something went wrong generating your coaching insights. Please try again later.'
    });
  }
});

module.exports = router;
