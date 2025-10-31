const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken } = require('../middleware/auth');
const openaiService = require('../services/openaiService');

/**
 * POST /api/chat/sessions
 * Create a new chat session
 */
router.post('/sessions', authenticateToken, async (req, res) => {
  try {
    const { gameId, sessionType, title } = req.body;

    if (!sessionType) {
      return res.status(400).json({
        error: 'sessionType is required'
      });
    }

    const session = await prisma.chatSession.create({
      data: {
        userId: req.user.id,
        gameId: gameId || null,
        sessionType,
        title: title || `${sessionType} session`,
      },
      include: {
        game: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    res.json({
      success: true,
      session: {
        ...session,
        game: session.game ? {
          ...session.game,
          analysis: session.game.analysis ? JSON.parse(session.game.analysis) : null,
          metadata: session.game.metadata ? JSON.parse(session.game.metadata) : null
        } : null
      }
    });

  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({
      error: 'Failed to create chat session',
      details: error.message
    });
  }
});

/**
 * GET /api/chat/sessions/:id
 * Get a specific chat session
 */
router.get('/sessions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const session = await prisma.chatSession.findFirst({
      where: {
        id,
        userId: req.user.id
      },
      include: {
        game: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      session: {
        ...session,
        game: session.game ? {
          ...session.game,
          analysis: session.game.analysis ? JSON.parse(session.game.analysis) : null,
          metadata: session.game.metadata ? JSON.parse(session.game.metadata) : null
        } : null
      }
    });

  } catch (error) {
    console.error('Error fetching chat session:', error);
    res.status(500).json({
      error: 'Failed to fetch chat session',
      details: error.message
    });
  }
});

/**
 * GET /api/chat/sessions
 * Get all chat sessions for the user
 */
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const sessions = await prisma.chatSession.findMany({
      where: { userId: req.user.id },
      orderBy: { updatedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        game: {
          select: {
            id: true,
            gameType: true,
            opponent: true,
            result: true,
            createdAt: true
          }
        },
        _count: {
          select: { messages: true }
        }
      }
    });

    res.json({
      success: true,
      sessions
    });

  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    res.status(500).json({
      error: 'Failed to fetch chat sessions',
      details: error.message
    });
  }
});

/**
 * POST /api/chat/message
 * Send a message and get AI response
 */
router.post('/message', authenticateToken, async (req, res) => {
  try {
    const { message, sessionId, gameId, sessionType } = req.body;

    if (!message || !sessionId) {
      return res.status(400).json({
        error: 'message and sessionId are required'
      });
    }

    // Verify session belongs to user
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: req.user.id
      },
      include: {
        game: true
      }
    });

    if (!session) {
      return res.status(404).json({
        error: 'Chat session not found'
      });
    }

    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        sender: 'user',
        message,
        messageType: 'text'
      }
    });

    // Get user's game history for context
    const userGames = await prisma.game.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to recent games for context
    });

    // Generate AI response
    const aiResponse = await generateAIResponse({
      message,
      session,
      userGames,
      user: req.user
    });

    // Save AI message
    const aiMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        sender: 'ai',
        message: aiResponse.message,
        messageType: aiResponse.messageType || 'text',
        metadata: aiResponse.metadata ? JSON.stringify(aiResponse.metadata) : null
      }
    });

    // Update session timestamp
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    });

    res.json({
      success: true,
      userMessage,
      response: {
        ...aiMessage,
        metadata: aiMessage.metadata ? JSON.parse(aiMessage.metadata) : null
      }
    });

  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({
      error: 'Failed to process message',
      details: error.message
    });
  }
});

/**
 * Generate AI response based on context
 */
async function generateAIResponse({ message, session, userGames, user }) {
  try {
    if (!openaiService.isConfigured()) {
      throw new Error('Groq AI service not configured');
    }

    // Build context for the AI
    const gameContext = session.game ? `

CURRENT GAME CONTEXT:
- Game Type: ${session.game.gameType}
- Opponent: ${session.game.opponent || 'AI/Unknown'}
- Result: ${session.game.result || 'Ongoing'}
- Player Color: ${session.game.playerColor}
- Moves: ${session.game.moveCount}
- Opening: ${session.game.opening || 'Unknown'}
- Accuracy: ${session.game.accuracy ? session.game.accuracy + '%' : 'Unknown'}

GAME PGN:
${session.game.pgn}` : '';

    // Use the new Groq-powered chat method
    const response = await openaiService.generateChatResponse(message, {
      user,
      session,
      userGames,
      gameContext
    });

    return response;

  } catch (error) {
    console.error('Error generating AI response:', error);
    
    // Use the fallback from the service
    return openaiService.getFallbackChatResponse();
  }
}

/**
 * DELETE /api/chat/sessions/:id
 * Delete a chat session
 */
router.delete('/sessions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.chatSession.deleteMany({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (result.count === 0) {
      return res.status(404).json({
        error: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({
      error: 'Failed to delete chat session',
      details: error.message
    });
  }
});

module.exports = router;
