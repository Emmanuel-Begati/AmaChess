const express = require('express');
const router = express.Router();
const StockfishService = require('../services/stockfishService');

const stockfishService = new StockfishService();

// Analyze chess position
router.post('/analyze', async (req, res) => {
  try {
    const { fen, depth = 15, time = 2000 } = req.body;
    
    if (!fen) {
      return res.status(400).json({ error: 'FEN position is required' });
    }

    const analysis = await stockfishService.analyzePosition(fen, depth, time);
    
    res.json({
      success: true,
      analysis: {
        bestMove: analysis.bestMove,
        evaluation: analysis.evaluation,
        principalVariation: analysis.principalVariation,
        depth: analysis.depth,
        fen: fen
      }
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze position',
      details: error.message 
    });
  }
});

// Get best move for AI coach
router.post('/coach/move', async (req, res) => {
  try {
    const { fen, skillLevel = 15, depth = 12 } = req.body;
    
    if (!fen) {
      return res.status(400).json({ error: 'FEN position is required' });
    }

    // Adjust skill level based on difficulty
    const adjustedSkillLevel = Math.max(1, Math.min(20, skillLevel));
    
    const result = await stockfishService.getBestMove(fen, adjustedSkillLevel, depth);
    
    res.json({
      success: true,
      coaching: {
        suggestedMove: result.move,
        evaluation: result.evaluation,
        principalVariation: result.pv,
        skillLevel: adjustedSkillLevel,
        explanation: generateMoveExplanation(result)
      }
    });

  } catch (error) {
    console.error('Coach move error:', error);
    res.status(500).json({ 
      error: 'Failed to get coaching move',
      details: error.message 
    });
  }
});

// Evaluate player move vs best move
router.post('/coach/evaluate', async (req, res) => {
  try {
    const { fen, playerMove, depth = 12 } = req.body;
    
    if (!fen || !playerMove) {
      return res.status(400).json({ error: 'FEN position and player move are required' });
    }

    // Get best move analysis
    const bestAnalysis = await stockfishService.analyzePosition(fen, depth, 1500);
    
    // Evaluate the moves
    const moveEvaluations = await stockfishService.evaluateMoves(fen, [playerMove, bestAnalysis.bestMove], depth);
    
    const playerEval = moveEvaluations.find(m => m.move === playerMove);
    const bestEval = moveEvaluations.find(m => m.move === bestAnalysis.bestMove);
    
    // Calculate move quality
    const quality = calculateMoveQuality(playerEval, bestEval);
    
    res.json({
      success: true,
      evaluation: {
        playerMove: playerMove,
        playerEvaluation: playerEval?.evaluation,
        bestMove: bestAnalysis.bestMove,
        bestEvaluation: bestEval?.evaluation,
        quality: quality,
        feedback: generateMoveFeedback(quality, playerMove, bestAnalysis.bestMove),
        improvement: quality.rating < 80 ? `Consider ${bestAnalysis.bestMove} instead` : null
      }
    });

  } catch (error) {
    console.error('Move evaluation error:', error);
    res.status(500).json({ 
      error: 'Failed to evaluate move',
      details: error.message 
    });
  }
});

// Get coaching hint
router.post('/coach/hint', async (req, res) => {
  try {
    const { fen, difficulty = 'medium' } = req.body;
    
    if (!fen) {
      return res.status(400).json({ error: 'FEN position is required' });
    }

    const hint = await stockfishService.generateHint(fen, difficulty);
    
    res.json({
      success: true,
      hint: {
        message: hint.hint,
        level: difficulty,
        hasMove: hint.bestMove ? true : false,
        evaluation: hint.evaluation
      }
    });

  } catch (error) {
    console.error('Hint generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate hint',
      details: error.message 
    });
  }
});

// Start coaching session with multiple difficulty levels
router.post('/coach/session', async (req, res) => {
  try {
    const { startingFen, difficulty = 'intermediate', sessionType = 'practice' } = req.body;
    
    const sessionConfig = {
      easy: { skillLevel: 8, depth: 10, timePerMove: 1000 },
      intermediate: { skillLevel: 15, depth: 12, timePerMove: 1500 },
      hard: { skillLevel: 18, depth: 15, timePerMove: 2000 },
      expert: { skillLevel: 20, depth: 18, timePerMove: 3000 }
    };

    const config = sessionConfig[difficulty] || sessionConfig.intermediate;
    
    res.json({
      success: true,
      session: {
        id: `session_${Date.now()}`,
        startingPosition: startingFen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        difficulty: difficulty,
        config: config,
        type: sessionType,
        created: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create coaching session',
      details: error.message 
    });
  }
});

// Advanced coaching endpoints for AI Chess Coach

// Get detailed position analysis with suggestions
router.post('/coach/analysis', async (req, res) => {
  try {
    const { fen, depth = 15, skillLevel = 15 } = req.body;
    
    if (!fen) {
      return res.status(400).json({ error: 'FEN position is required' });
    }

    // Get comprehensive analysis
    const analysis = await stockfishService.analyzePosition(fen, depth, 3000);
    const bestMove = await stockfishService.getBestMove(fen, skillLevel, depth);
    
    // Evaluate multiple candidate moves
    const candidateMoves = ['e2e4', 'd2d4', 'g1f3', 'c2c4', 'f2f4', 'b1c3']; // Can be made dynamic
    const moveEvaluations = await stockfishService.evaluateMoves(fen, candidateMoves, 10);
    
    // Sort moves by evaluation
    const sortedMoves = moveEvaluations
      .filter(m => m.evaluation && m.evaluation.type === 'centipawn')
      .sort((a, b) => (b.evaluation?.value || -1000) - (a.evaluation?.value || -1000))
      .slice(0, 3);

    res.json({
      success: true,
      coaching: {
        position: fen,
        bestMove: analysis.bestMove,
        bestMoveEvaluation: analysis.evaluation,
        coachSuggestion: bestMove.move,
        principalVariation: analysis.principalVariation,
        topMoves: sortedMoves,
        explanation: generatePositionExplanation(analysis),
        difficulty: skillLevel
      }
    });

  } catch (error) {
    console.error('Coaching analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze position for coaching',
      details: error.message 
    });
  }
});

// Practice mode - step-by-step guidance
router.post('/coach/practice', async (req, res) => {
  try {
    const { fen, playerMove, difficulty = 'intermediate' } = req.body;
    
    if (!fen) {
      return res.status(400).json({ error: 'FEN position is required' });
    }

    const skillLevels = {
      beginner: 8,
      intermediate: 15,
      advanced: 18,
      expert: 20
    };

    const skillLevel = skillLevels[difficulty] || 15;
    const analysis = await stockfishService.analyzePosition(fen, 12, 2000);
    
    let feedback = null;
    if (playerMove) {
      // Evaluate the player's move
      const moveEvals = await stockfishService.evaluateMoves(fen, [playerMove, analysis.bestMove], 10);
      const playerEval = moveEvals.find(m => m.move === playerMove);
      const bestEval = moveEvals.find(m => m.move === analysis.bestMove);
      
      feedback = generatePracticeFeedback(playerMove, analysis.bestMove, playerEval, bestEval, difficulty);
    }

    // Get next move suggestion
    const suggestion = await stockfishService.getBestMove(fen, skillLevel, 12);
    const hint = await stockfishService.generateHint(fen, difficulty);

    res.json({
      success: true,
      practice: {
        position: fen,
        bestMove: analysis.bestMove,
        suggestion: suggestion.move,
        hint: hint.hint,
        evaluation: analysis.evaluation,
        feedback: feedback,
        difficulty: difficulty,
        nextSteps: generateNextSteps(analysis, difficulty)
      }
    });

  } catch (error) {
    console.error('Practice mode error:', error);
    res.status(500).json({ 
      error: 'Failed to generate practice guidance',
      details: error.message 
    });
  }
});

// Teaching mode - explain chess concepts
router.post('/coach/explain', async (req, res) => {
  try {
    const { fen, concept = 'general' } = req.body;
    
    if (!fen) {
      return res.status(400).json({ error: 'FEN position is required' });
    }

    const analysis = await stockfishService.analyzePosition(fen, 15, 2000);
    const explanation = generateConceptExplanation(fen, analysis, concept);

    res.json({
      success: true,
      explanation: {
        concept: concept,
        position: fen,
        bestMove: analysis.bestMove,
        evaluation: analysis.evaluation,
        teaching: explanation,
        examples: generateExamples(concept, analysis)
      }
    });

  } catch (error) {
    console.error('Explanation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate explanation',
      details: error.message 
    });
  }
});

// Helper functions
function generateMoveExplanation(result) {
  if (!result.evaluation) {
    return "This move maintains the position";
  }

  const { evaluation } = result;
  
  if (evaluation.type === 'mate') {
    return evaluation.value > 0 
      ? `This move leads to checkmate in ${evaluation.value} moves!`
      : `This move prevents mate in ${Math.abs(evaluation.value)} moves`;
  }
  
  if (evaluation.type === 'centipawn') {
    const pawns = evaluation.value / 100;
    if (pawns > 2) return "This move gives a significant advantage";
    if (pawns > 0.5) return "This move gives a slight advantage";
    if (pawns > -0.5) return "This move maintains equality";
    if (pawns > -2) return "This move is slightly unfavorable";
    return "This move gives the opponent an advantage";
  }

  return "This is a reasonable move";
}

function calculateMoveQuality(playerEval, bestEval) {
  if (!playerEval?.evaluation || !bestEval?.evaluation) {
    return { rating: 50, description: "Unknown" };
  }

  const playerScore = playerEval.evaluation.type === 'centipawn' ? playerEval.evaluation.value : 0;
  const bestScore = bestEval.evaluation.type === 'centipawn' ? bestEval.evaluation.value : 0;
  
  const difference = Math.abs(bestScore - playerScore);
  
  if (difference < 25) return { rating: 95, description: "Excellent" };
  if (difference < 50) return { rating: 85, description: "Good" };
  if (difference < 100) return { rating: 70, description: "Inaccuracy" };
  if (difference < 200) return { rating: 50, description: "Mistake" };
  return { rating: 25, description: "Blunder" };
}

function generateMoveFeedback(quality, playerMove, bestMove) {
  const messages = {
    95: [`Excellent move! ${playerMove} is the best choice.`, "Perfect! You found the strongest continuation."],
    85: [`Good move! ${playerMove} is very solid.`, "Well played! This maintains your advantage."],
    70: [`${playerMove} is playable but not optimal.`, `Consider ${bestMove} for better chances.`],
    50: [`${playerMove} gives your opponent an opportunity.`, `${bestMove} would be much stronger here.`],
    25: [`${playerMove} is a serious mistake.`, `${bestMove} was the key move to find.`]
  };

  const ratingKey = quality.rating >= 95 ? 95 : 
                   quality.rating >= 85 ? 85 :
                   quality.rating >= 70 ? 70 :
                   quality.rating >= 50 ? 50 : 25;

  const feedbackOptions = messages[ratingKey] || messages[50];
  return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
}

module.exports = router;
