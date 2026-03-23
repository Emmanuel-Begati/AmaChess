const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const openaiService = require('../services/openaiService');

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
        targetRating: true,
        customGoals: true
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
        targetRating: user.targetRating || '',
        customGoals: user.customGoals ? JSON.parse(user.customGoals) : []
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
    const { chessGoal, focusAreas, targetRating, customGoals } = req.body;

    const data = {
      chessGoal: chessGoal || null,
      focusAreas: focusAreas ? JSON.stringify(focusAreas) : null,
      targetRating: targetRating ? parseInt(targetRating, 10) : null,
    };

    // Only update customGoals if it was included in the request
    if (customGoals !== undefined) {
      data.customGoals = customGoals && customGoals.length > 0
        ? JSON.stringify(customGoals)
        : null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        chessGoal: true,
        focusAreas: true,
        targetRating: true,
        customGoals: true
      }
    });

    res.json({
      success: true,
      data: {
        chessGoal: updatedUser.chessGoal || '',
        focusAreas: updatedUser.focusAreas ? JSON.parse(updatedUser.focusAreas) : [],
        targetRating: updatedUser.targetRating || '',
        customGoals: updatedUser.customGoals ? JSON.parse(updatedUser.customGoals) : []
      }
    });
  } catch (error) {
    console.error('Error updating coaching goals:', error);
    res.status(500).json({ success: false, error: 'Failed to update goals' });
  }
});

/**
 * POST /api/goals/validate
 * Validate that a custom goal is chess-related using AI.
 */
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const { goal } = req.body;

    if (!goal || typeof goal !== 'string' || goal.trim().length === 0) {
      return res.status(400).json({
        success: false,
        isChessRelated: false,
        reason: 'Goal text is required.'
      });
    }

    const trimmed = goal.trim();

    if (trimmed.length > 200) {
      return res.status(400).json({
        success: false,
        isChessRelated: false,
        reason: 'Goal must be 200 characters or less.'
      });
    }

    // If AI is not configured, use keyword-based fallback validation
    if (!openaiService.isConfigured()) {
      const result = fallbackChessValidation(trimmed);
      return res.json({ success: true, ...result });
    }

    // Use AI to validate the goal
    const response = await openaiService.client.chat.completions.create({
      model: openaiService.model,
      messages: [
        {
          role: 'system',
          content: `You are a chess goal validator. Your ONLY job is to determine if the given text is a valid chess improvement goal. 

Respond with exactly one JSON object: {"isChessRelated": true/false, "reason": "brief explanation"}

Chess-related goals include:
- Rating targets (e.g., "Reach 1800 ELO")
- Skill improvement (e.g., "Master the Sicilian Defense", "Improve endgame technique")
- Training habits (e.g., "Solve 10 puzzles daily", "Study openings for 30 min/day")
- Competitive goals (e.g., "Win the school tournament", "Beat my friend in blitz")
- Specific chess concepts (e.g., "Learn the London System", "Reduce blunders in middlegame")

NOT chess-related:
- Anything about cooking, fitness, school, work, gaming (non-chess), etc.
- Generic life goals unrelated to chess
- Inappropriate or offensive content

Be strict: if it's not clearly about chess, reject it.`
        },
        {
          role: 'user',
          content: `Is this a valid chess improvement goal? "${trimmed}"`
        }
      ],
      max_tokens: 80,
      temperature: 0.1
    });

    const aiText = response.choices[0].message.content.trim();
    
    // Parse JSON from AI response
    let result;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      result = null;
    }

    if (!result) {
      // Fallback if AI response can't be parsed
      const fallback = fallbackChessValidation(trimmed);
      return res.json({ success: true, ...fallback });
    }

    return res.json({
      success: true,
      isChessRelated: !!result.isChessRelated,
      reason: result.reason || (result.isChessRelated ? 'Valid chess goal.' : 'This doesn\'t appear to be chess-related.')
    });

  } catch (error) {
    console.error('Error validating goal:', error);
    // On error, use fallback so the feature still works
    const fallback = fallbackChessValidation(req.body.goal || '');
    return res.json({ success: true, ...fallback });
  }
});

/**
 * Keyword-based fallback when AI is unavailable.
 */
function fallbackChessValidation(goal) {
  const lower = goal.toLowerCase();
  const chessKeywords = [
    'chess', 'elo', 'rating', 'puzzle', 'opening', 'endgame', 'middlegame',
    'tactic', 'blunder', 'checkmate', 'fork', 'pin', 'skewer', 'castl',
    'gambit', 'defense', 'defence', 'sicilian', 'french', 'caro', 'king',
    'queen', 'rook', 'bishop', 'knight', 'pawn', 'lichess', 'tournament',
    'blitz', 'rapid', 'bullet', 'classical', 'fide', 'calculation',
    'positional', 'strategy', 'repertoire', 'variation', 'sacrifice',
    'attack', 'defend', 'study', 'analyze', 'pgn', 'fen', 'coach',
    'grandmaster', 'master', 'rank', 'win rate', 'opponent', 'match'
  ];

  const isChessRelated = chessKeywords.some(kw => lower.includes(kw));
  return {
    isChessRelated,
    reason: isChessRelated
      ? 'Valid chess goal.'
      : 'This doesn\'t appear to be chess-related. Please set a goal about chess improvement.'
  };
}

module.exports = router;
