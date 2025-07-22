const express = require('express');
const router = express.Router();
const openaiService = require('../services/openaiService');
const OpenAIService = require('../services/openaiService').constructor;
const stockfishService = require('../services/stockfishService');
const { Chess } = require('chess.js');

/**
 * POST /api/coach/welcome
 * Get a personalized welcome message for starting a training session
 */
router.post('/welcome', async (req, res) => {
  try {
    const { 
      difficulty = 'intermediate',
      gameContext = {} 
    } = req.body;

    // Get welcome message from OpenAI GPT-4o
    const welcome = await openaiService.generateWelcomeMessage(difficulty, gameContext);

    res.json({
      success: true,
      welcome,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chess coach welcome error:', error);
    res.status(500).json({
      error: 'Failed to get welcome message',
      details: error.message
    });
  }
});

/**
 * POST /api/coach/chat
 * Chat with the AI chess coach about moves and positions
 */
router.post('/chat', async (req, res) => {
  try {
    const { 
      position, 
      playerMove, 
      moveHistory = [], 
      difficulty = 'intermediate',
      gameContext = {} 
    } = req.body;

    if (!position) {
      return res.status(400).json({ error: 'Chess position (FEN) is required' });
    }

    // Validate FEN position
    try {
      new Chess(position);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid FEN position' });
    }

    // Create game context for AI
    const context = {
      moveHistory,
      difficulty,
      ...gameContext
    };

    // Get coaching response from OpenAI
    const coaching = await openaiService.generateChessCoaching(position, playerMove, context);

    // Also get basic analysis from Stockfish if available
    let analysis = null;
    try {
      if (stockfishService) {
        analysis = await stockfishService.analyzePosition(position, 10);
      }
    } catch (error) {
      console.log('Stockfish analysis not available:', error.message);
    }

    res.json({
      success: true,
      coaching,
      analysis: analysis ? {
        evaluation: analysis.evaluation,
        bestMove: analysis.bestMove
      } : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chess coach chat error:', error);
    res.status(500).json({
      error: 'Failed to get coaching response',
      details: error.message
    });
  }
});

/**
 * POST /api/coach/hint
 * Get strategic hints for the current position with PGN context (USER-REQUESTED ONLY)
 */
router.post('/hint', async (req, res) => {
  try {
    const { 
      position,
      pgn = '',
      moveHistory = [],
      difficulty = 'intermediate',
      gameContext = {}
    } = req.body;

    if (!position) {
      return res.status(400).json({ error: 'Chess position (FEN) is required' });
    }

    // Validate FEN position
    try {
      new Chess(position);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid FEN position' });
    }

    // Create enhanced context with PGN for deeper analysis
    const enhancedContext = {
      difficulty,
      pgn: pgn.trim(),
      moveHistory,
      ...gameContext
    };

    // Get strategic hint from Coach B with full game context
    const hint = await openaiService.generateHint(position, enhancedContext);

    // Also provide basic position analysis from Stockfish if available
    let analysis = null;
    try {
      if (stockfishService) {
        analysis = await stockfishService.analyzePosition(position, 10);
      }
    } catch (error) {
      console.log('Stockfish analysis not available for hint:', error.message);
    }

    res.json({
      success: true,
      hint,
      analysis: analysis ? {
        evaluation: analysis.evaluation,
        bestMove: analysis.bestMove,
        depth: analysis.depth
      } : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chess hint error:', error);
    res.status(500).json({
      error: 'Failed to generate hint',
      details: error.message
    });
  }
});

/**
 * POST /api/coach/blunder-analysis  
 * Analyze blunders and provide targeted coaching (CRITICAL MOMENTS)
 */
router.post('/blunder-analysis', async (req, res) => {
  try {
    const { 
      position,
      playerMove,
      evaluationChange,
      isUserBlunder = false,
      bestMove = '',
      difficulty = 'intermediate',
      gameContext = {}
    } = req.body;

    if (!position || !playerMove || evaluationChange === undefined) {
      return res.status(400).json({ 
        error: 'Position, player move, and evaluation change are required' 
      });
    }

    // Validate FEN position
    try {
      new Chess(position);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid FEN position' });
    }

    // Only provide coaching for significant blunders to save API costs
    if (!openaiService.isBlunder(evaluationChange)) {
      return res.json({
        success: true,
        shouldProvideCoaching: false,
        message: 'Move evaluation change not significant enough for coaching intervention',
        evaluationChange
      });
    }

    // Create context for blunder analysis
    const context = {
      difficulty,
      isUserBlunder,
      bestMove,
      ...gameContext
    };

    // Get targeted blunder coaching from Coach B
    const coaching = await openaiService.analyzeBlunder(
      position, 
      playerMove, 
      evaluationChange,
      context
    );

    res.json({
      success: true,
      shouldProvideCoaching: true,
      coaching,
      evaluationChange,
      severity: coaching.severity,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Blunder analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze blunder',
      details: error.message
    });
  }
});

/**
 * POST /api/coach/should-intervene
 * Check if an evaluation change warrants coaching intervention (COST OPTIMIZATION)
 */
router.post('/should-intervene', async (req, res) => {
  try {
    const { 
      evaluationChange,
      gamePhase = 'middlegame'
    } = req.body;

    if (evaluationChange === undefined) {
      return res.status(400).json({ 
        error: 'Evaluation change is required' 
      });
    }

    const isBlunder = openaiService.isBlunder(evaluationChange, gamePhase);
    const isSignificant = openaiService.isSignificantChange(evaluationChange);

    res.json({
      success: true,
      shouldIntervene: isBlunder,
      isBlunder,
      isSignificant,
      evaluationChange,
      gamePhase,
      severity: isBlunder ? (Math.abs(evaluationChange) > 300 ? 'major' : Math.abs(evaluationChange) > 150 ? 'moderate' : 'minor') : 'none',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Intervention check error:', error);
    res.status(500).json({
      error: 'Failed to check intervention criteria',
      details: error.message
    });
  }
});

/**
 * POST /api/coach/analyze-move
 * Analyze a specific move and provide detailed feedback
 */
router.post('/analyze-move', async (req, res) => {
  try {
    const { 
      beforePosition, 
      afterPosition, 
      playerMove, 
      difficulty = 'intermediate' 
    } = req.body;

    if (!beforePosition || !afterPosition || !playerMove) {
      return res.status(400).json({ 
        error: 'Before position, after position, and player move are required' 
      });
    }

    // Validate FEN positions
    try {
      new Chess(beforePosition);
      new Chess(afterPosition);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid FEN position' });
    }

    // Get Stockfish analysis for both positions if available
    let beforeAnalysis = null;
    let afterAnalysis = null;

    try {
      if (stockfishService) {
        [beforeAnalysis, afterAnalysis] = await Promise.all([
          stockfishService.analyzePosition(beforePosition, 12),
          stockfishService.analyzePosition(afterPosition, 12)
        ]);
      }
    } catch (error) {
      console.log('Stockfish analysis not available:', error.message);
    }

    // Create context with analysis data
    const gameContext = {
      difficulty,
      beforeAnalysis,
      afterAnalysis,
      moveAnalysis: true
    };

    // Get detailed coaching feedback
    const coaching = await openaiService.generateChessCoaching(
      afterPosition, 
      playerMove, 
      gameContext
    );

    // Calculate move quality if we have analysis
    let moveQuality = 'Good';
    if (beforeAnalysis && afterAnalysis) {
      const evalChange = (afterAnalysis.evaluation?.value || 0) - (beforeAnalysis.evaluation?.value || 0);
      
      if (evalChange < -100) moveQuality = 'Excellent';
      else if (evalChange < -50) moveQuality = 'Good';
      else if (evalChange < 50) moveQuality = 'OK';
      else if (evalChange < 150) moveQuality = 'Inaccuracy';
      else moveQuality = 'Mistake';
    }

    res.json({
      success: true,
      coaching,
      moveQuality,
      analysis: {
        before: beforeAnalysis ? {
          evaluation: beforeAnalysis.evaluation,
          bestMove: beforeAnalysis.bestMove
        } : null,
        after: afterAnalysis ? {
          evaluation: afterAnalysis.evaluation,
          bestMove: afterAnalysis.bestMove
        } : null
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Move analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze move',
      details: error.message
    });
  }
});

/**
 * POST /api/coach/hint
 * Get strategic hints for the current position with PGN context (USER-REQUESTED ONLY)
 */
router.post('/hint', async (req, res) => {
  try {
    const { 
      position,
      pgn = '',
      moveHistory = [],
      difficulty = 'intermediate',
      gameContext = {}
    } = req.body;

    if (!position) {
      return res.status(400).json({ error: 'Chess position (FEN) is required' });
    }

    // Validate FEN position
    try {
      new Chess(position);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid FEN position' });
    }

    // Create enhanced context with PGN for deeper analysis
    const enhancedContext = {
      difficulty,
      pgn: pgn.trim(),
      moveHistory,
      ...gameContext
    };

    // Get strategic hint from Coach B with full game context
    const hint = await openaiService.generateHint(position, enhancedContext);

    // Also provide basic position analysis from Stockfish if available
    let analysis = null;
    try {
      if (stockfishService) {
        analysis = await stockfishService.analyzePosition(position, 10);
      }
    } catch (error) {
      console.log('Stockfish analysis not available for hint:', error.message);
    }

    res.json({
      success: true,
      hint,
      analysis: analysis ? {
        evaluation: analysis.evaluation,
        bestMove: analysis.bestMove,
        depth: analysis.depth
      } : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chess hint error:', error);
    res.status(500).json({
      error: 'Failed to generate hint',
      details: error.message
    });
  }
});

/**
 * POST /api/coach/evaluation-monitor
 * Monitor evaluation changes and trigger coaching for critical moments
 */
router.post('/evaluation-monitor', async (req, res) => {
  try {
    const { 
      previousEvaluation,
      currentEvaluation,
      playerMove,
      position,
      gamePhase = 'middlegame',
      isUserMove = true,
      difficulty = 'intermediate',
      gameContext = {}
    } = req.body;

    if (previousEvaluation === undefined || currentEvaluation === undefined || !playerMove || !position) {
      return res.status(400).json({ 
        error: 'Previous evaluation, current evaluation, player move, and position are required' 
      });
    }

    // Calculate evaluation change (positive = better for current player)
    const evaluationChange = isUserMove 
      ? currentEvaluation - previousEvaluation  // User move: + is good, - is bad
      : previousEvaluation - currentEvaluation; // Engine move: flipped perspective

    // Check if this warrants coaching intervention
    const isBlunder = openaiService.isBlunder(Math.abs(evaluationChange), gamePhase);
    
    if (!isBlunder) {
      return res.json({
        success: true,
        shouldIntervene: false,
        evaluationChange,
        severity: 'none',
        message: 'No coaching intervention needed'
      });
    }

    // Determine who made the blunder
    const isUserBlunder = isUserMove && evaluationChange < 0;
    const isEngineBlunder = !isUserMove && evaluationChange > 0;

    if (!isUserBlunder && !isEngineBlunder) {
      return res.json({
        success: true,
        shouldIntervene: false,
        evaluationChange,
        severity: 'none',
        message: 'Evaluation change not significant enough'
      });
    }

    // Create context for blunder analysis
    const context = {
      difficulty,
      isUserBlunder,
      gamePhase,
      ...gameContext
    };

    // Get targeted coaching from Coach B for critical moment
    const coaching = await openaiService.analyzeBlunder(
      position, 
      playerMove, 
      Math.abs(evaluationChange),
      context
    );

    res.json({
      success: true,
      shouldIntervene: true,
      coaching,
      evaluationChange,
      isUserBlunder,
      isEngineBlunder,
      severity: coaching.severity,
      criticalMoment: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Evaluation monitoring error:', error);
    res.status(500).json({
      error: 'Failed to monitor evaluation',
      details: error.message
    });
  }
});

/**
 * GET /api/coach/health
 * Check if the coaching service is available
 */
router.get('/health', (req, res) => {
  const openaiAvailable = openaiService.isConfigured();
  
  res.json({
    success: true,
    services: {
      openai: {
        available: openaiAvailable,
        model: 'gpt-4o',
        status: openaiAvailable ? 'ready' : 'not configured'
      },
      stockfish: {
        available: !!stockfishService,
        status: stockfishService ? 'ready' : 'not available'
      }
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/coach/game-chat
 * Chat about a completed game with full context
 */
router.post('/game-chat', async (req, res) => {
  try {
    const { 
      gameData, 
      userMessage, 
      conversationHistory = [] 
    } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'User message is required' });
    }

    // Create system prompt for game discussion
    const systemPrompt = `You are Magnus Carlsen, world chess champion, discussing a completed chess game. 

Game context:
${gameData ? `
- Opponent: ${gameData.opponent || 'Unknown'}
- Result: ${gameData.result || 'Unknown'}
- Time Control: ${gameData.timeControl || 'Unknown'}
- Opening: ${gameData.opening || 'Unknown'}
` : 'No specific game data provided.'}

Your style:
- Encouraging and educational
- Focus on learning opportunities
- Provide specific, actionable advice
- Keep responses conversational and engaging
- Reference specific moments in the game when relevant`;

    // Build conversation context
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    });

    // Add current user message
    messages.push({ role: 'user', content: userMessage });

    const response = await openaiService.client.chat.completions.create({
      model: openaiService.model,
      messages: messages,
      max_tokens: 200,
      temperature: 0.7
    });

    const aiResponse = {
      id: Date.now(),
      sender: 'ai',
      text: response.choices[0].message.content.trim(),
      timestamp: new Date().toLocaleTimeString()
    };

    res.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Game chat error:', error);
    
    // Fallback response
    const fallbackResponses = [
      "That's a great question! Let me analyze that position for you...",
      "Interesting point! This is a common pattern that many players struggle with.",
      "Good observation! This type of position requires careful calculation.",
      "Excellent question! Understanding this concept will definitely improve your play.",
      "I see what you're getting at. This is actually a key moment in the game."
    ];

    const fallbackResponse = {
      id: Date.now(),
      sender: 'ai',
      text: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      timestamp: new Date().toLocaleTimeString(),
      fallback: true
    };

    res.json({
      success: true,
      response: fallbackResponse,
      error: 'Using fallback response',
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
