const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * GET /api/goals
 * Fetch the user's current coaching goals.
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        chessGoal: true,
        focusAreas: true,
        targetRating: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        chessGoal: user.chessGoal || '',
        focusAreas: user.focusAreas ? JSON.parse(user.focusAreas) : [],
        targetRating: user.targetRating || ''
      }
    });
  } catch (error) {
    console.error('Error fetching coaching goals:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch goals' });
  }
});

/**
 * PUT /api/goals
 * Update the user's coaching goals.
 */
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { chessGoal, focusAreas, targetRating } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        chessGoal: chessGoal || null,
        focusAreas: focusAreas ? JSON.stringify(focusAreas) : null,
        targetRating: targetRating ? parseInt(targetRating, 10) : null
      },
      select: {
        chessGoal: true,
        focusAreas: true,
        targetRating: true
      }
    });

    res.json({
      success: true,
      data: {
        chessGoal: updatedUser.chessGoal || '',
        focusAreas: updatedUser.focusAreas ? JSON.parse(updatedUser.focusAreas) : [],
        targetRating: updatedUser.targetRating || ''
      }
    });
  } catch (error) {
    console.error('Error updating coaching goals:', error);
    res.status(500).json({ success: false, error: 'Failed to update goals' });
  }
});

module.exports = router;
