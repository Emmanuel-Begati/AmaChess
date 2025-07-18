const express = require('express');
const router = express.Router();
const StockfishService = require('../services/stockfishService');

const stockfishService = new StockfishService();

// Play against Stockfish with configurable difficulty - IMPROVED VERSION
router.post('/play/move-difficulty', async (req, res) => {
  try {
    const { fen, difficulty = 'intermediate', timeLimit = 3000 } = req.body;
    
    console.log('Received move request:', { fen: fen?.substring(0, 30), difficulty, timeLimit });
    
    if (!fen) {
      return res.status(400).json({ error: 'FEN position is required' });
    }

    // Validate FEN format
    try {
      const Chess = require('chess.js').Chess;
      const testGame = new Chess(fen);
      if (testGame.isGameOver()) {
        return res.json({
          success: true,
          game: {
            move: null,
            gameOver: true,
            result: testGame.isCheckmate() ? 'checkmate' : 'draw',
            winner: testGame.isCheckmate() ? (testGame.turn() === 'w' ? 'black' : 'white') : null
          }
        });
      }
    } catch (error) {
      return res.status(400).json({ error: 'Invalid FEN position' });
    }

    // Get move from Stockfish
    const result = await stockfishService.getBestMoveWithDifficulty(fen, difficulty, timeLimit);
    
    if (!result.bestMove || result.bestMove === '(none)') {
      return res.status(500).json({ error: 'No valid move found' });
    }

    // Prepare response
    const response = {
      success: true,
      bestMove: result.bestMove,
      evaluation: result.evaluation,
      game: {
        move: result.bestMove,
        evaluation: result.evaluation,
        principalVariation: result.principalVariation || [],
        depth: result.depth || 0,
        calculationTime: result.timeUsed || 0,
        difficulty: result.difficulty,
        skillLevel: result.skillLevel,
        fen: fen
      }
    };

    console.log('Sending response:', { 
      move: response.bestMove, 
      difficulty: response.game.difficulty,
      time: response.game.calculationTime 
    });

    res.json(response);

  } catch (error) {
    console.error('Stockfish move error:', error);
    res.status(500).json({ 
      error: 'Failed to get Stockfish move',
      details: error.message 
    });
  }
});

// Analyze position endpoint
router.post('/analyze', async (req, res) => {
  try {
    const { fen, depth = 15, time = 2000 } = req.body;
    
    if (!fen) {
      return res.status(400).json({ error: 'FEN position is required' });
    }

    console.log('Analyzing position:', fen.substring(0, 30));

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

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    stockfish: 'available',
    activeEngines: stockfishService.engines.size
  });
});

// Test Stockfish installation
router.get('/test', async (req, res) => {
  try {
    const engineId = 'test_' + Date.now();
    const engine = await stockfishService.createEngine(engineId);
    
    // Test with starting position
    const testFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const result = await stockfishService.getBestMoveWithDifficulty(testFen, 'beginner', 2000);
    
    engine.close();
    
    res.json({
      status: 'success',
      message: 'Stockfish is working correctly',
      testResult: {
        move: result.bestMove,
        evaluation: result.evaluation,
        time: result.timeUsed
      }
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Stockfish test failed',
      error: error.message
    });
  }
});

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

// Play against Stockfish - highest level
router.post('/play/move', async (req, res) => {
  try {
    const { fen, depth = 22, skillLevel = 20, timeLimit = 15000 } = req.body;
    
    if (!fen) {
      return res.status(400).json({ error: 'FEN position is required' });
    }

    // Configure Stockfish for strongest play
    const engineId = `game_${Date.now()}`;
    const engine = await stockfishService.createEngine(engineId);
    
    return new Promise((resolve, reject) => {
      let gameResult = {
        move: null,
        evaluation: null,
        pv: [],
        depth: 0,
        time: 0,
        nodes: 0
      };

      let isComplete = false;
      const startTime = Date.now();

      const timeout = setTimeout(() => {
        if (!isComplete) {
          isComplete = true;
          engine.close();
          reject(new Error('Move calculation timeout'));
        }
      }, timeLimit + 5000); // Add 5 seconds buffer

      const handleData = (data) => {
        const lines = data.toString().split('\n');
        
        lines.forEach(line => {
          line = line.trim();
          if (!line) return;

          if (line.startsWith('bestmove') && !isComplete) {
            isComplete = true;
            clearTimeout(timeout);
            
            const move = line.split(' ')[1];
            gameResult.move = move;
            gameResult.evaluation = engine.getEvaluation();
            gameResult.pv = engine.getPrincipalVariation();
            gameResult.time = Date.now() - startTime;
            
            console.log('Stockfish move:', gameResult);
            engine.close();
            
            res.json({
              success: true,
              game: {
                move: gameResult.move,
                evaluation: gameResult.evaluation,
                principalVariation: gameResult.pv,
                depth: gameResult.depth,
                calculationTime: gameResult.time,
                nodesSearched: gameResult.nodes,
                difficulty: 'Maximum Level (3200+ Elo)',
                fen: fen
              }
            });
          }

          if (line.includes('depth') && line.includes('score')) {
            const depthMatch = line.match(/depth (\d+)/);
            const nodesMatch = line.match(/nodes (\d+)/);
            if (depthMatch) {
              gameResult.depth = parseInt(depthMatch[1]);
            }
            if (nodesMatch) {
              gameResult.nodes = parseInt(nodesMatch[1]);
            }
          }
        });
      };

      // Listen for move data
      engine.engine.stdout.on('data', handleData);

      // Configure engine for maximum strength
      engine.send('ucinewgame');
      engine.send('setoption name Hash value 1024'); // 1GB hash for maximum strength
      engine.send('setoption name Threads value 8'); // Use maximum threads
      engine.send('setoption name Skill Level value 20'); // Maximum skill
      engine.send('setoption name UCI_LimitStrength value false'); // No strength limit
      engine.send('setoption name MultiPV value 1'); // Single best line
      engine.send('setoption name Contempt value 0'); // Neutral contempt
      engine.send('setoption name Ponder value false'); // Don't ponder
      engine.send('setoption name OwnBook value false'); // Don't use opening book
      engine.send('setoption name UCI_AnalyseMode value false'); // Game mode, not analysis
      engine.send(`position fen ${fen}`);
      engine.send(`go depth ${depth} movetime ${timeLimit}`); // Deep search with time limit
    });

  } catch (error) {
    console.error('Stockfish game move error:', error);
    res.status(500).json({ 
      error: 'Failed to get Stockfish move',
      details: error.message 
    });
  }
});

// Start new game against Stockfish
router.post('/play/new', async (req, res) => {
  try {
    const { playerColor = 'white', difficulty = 'maximum' } = req.body;
    
    const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    
    // If player is black, get Stockfish's opening move
    let stockfishMove = null;
    if (playerColor === 'black') {
      const moveResponse = await fetch('http://localhost:3001/api/stockfish/play/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen: startingFen, depth: 20, skillLevel: 20 })
      });
      
      if (moveResponse.ok) {
        const moveData = await moveResponse.json();
        stockfishMove = moveData.game.move;
      }
    }

    res.json({
      success: true,
      game: {
        id: `game_${Date.now()}`,
        startingFen: startingFen,
        playerColor: playerColor,
        difficulty: difficulty,
        stockfishMove: stockfishMove,
        created: new Date().toISOString(),
        status: 'active'
      }
    });

  } catch (error) {
    console.error('New game error:', error);
    res.status(500).json({ 
      error: 'Failed to start new game',
      details: error.message 
    });
  }
});

// Get position evaluation for current game
router.post('/play/evaluate', async (req, res) => {
  try {
    const { fen, depth = 15 } = req.body;
    
    if (!fen) {
      return res.status(400).json({ error: 'FEN position is required' });
    }

    const analysis = await stockfishService.analyzePosition(fen, depth, 3000);
    
    res.json({
      success: true,
      evaluation: {
        position: fen,
        bestMove: analysis.bestMove,
        evaluation: analysis.evaluation,
        principalVariation: analysis.principalVariation,
        depth: analysis.depth,
        mate: analysis.evaluation?.type === 'mate',
        advantage: calculateAdvantage(analysis.evaluation)
      }
    });

  } catch (error) {
    console.error('Position evaluation error:', error);
    res.status(500).json({ 
      error: 'Failed to evaluate position',
      details: error.message 
    });
  }
});

// Play against Stockfish with configurable difficulty
router.post('/play/move-difficulty', async (req, res) => {
  try {
    const { fen, difficulty = 'maximum' } = req.body;
    
    if (!fen) {
      return res.status(400).json({ error: 'FEN position is required' });
    }

    // Configure different difficulty levels
    const difficultySettings = {
      beginner: {
        skillLevel: 1,
        depth: 8,
        timeLimit: 1000,
        hash: 16,
        threads: 1,
        description: 'Beginner (800 Elo)'
      },
      intermediate: {
        skillLevel: 10,
        depth: 12,
        timeLimit: 3000,
        hash: 128,
        threads: 2,
        description: 'Intermediate (1500 Elo)'
      },
      advanced: {
        skillLevel: 15,
        depth: 16,
        timeLimit: 8000,
        hash: 256,
        threads: 4,
        description: 'Advanced (2000 Elo)'
      },
      expert: {
        skillLevel: 18,
        depth: 20,
        timeLimit: 12000,
        hash: 512,
        threads: 6,
        description: 'Expert (2500 Elo)'
      },
      maximum: {
        skillLevel: 20,
        depth: 25,
        timeLimit: 20000,
        hash: 1024,
        threads: 8,
        description: 'Maximum Level (3200+ Elo)'
      }
    };

    const settings = difficultySettings[difficulty] || difficultySettings.maximum;
    
    const engineId = `game_${Date.now()}`;
    const engine = await stockfishService.createEngine(engineId);
    
    return new Promise((resolve, reject) => {
      let gameResult = {
        move: null,
        evaluation: null,
        pv: [],
        depth: 0,
        time: 0,
        nodes: 0
      };

      let isComplete = false;
      const startTime = Date.now();

      const timeout = setTimeout(() => {
        if (!isComplete) {
          isComplete = true;
          engine.close();
          reject(new Error('Move calculation timeout'));
        }
      }, settings.timeLimit + 5000);

      const handleData = (data) => {
        const lines = data.toString().split('\n');
        
        lines.forEach(line => {
          line = line.trim();
          if (!line) return;

          if (line.startsWith('bestmove') && !isComplete) {
            isComplete = true;
            clearTimeout(timeout);
            
            const move = line.split(' ')[1];
            gameResult.move = move;
            gameResult.evaluation = engine.getEvaluation();
            gameResult.pv = engine.getPrincipalVariation();
            gameResult.time = Date.now() - startTime;
            
            console.log(`Stockfish move (${difficulty}):`, gameResult);
            engine.close();
            
            res.json({
              success: true,
              game: {
                move: gameResult.move,
                evaluation: gameResult.evaluation,
                principalVariation: gameResult.pv,
                depth: gameResult.depth,
                calculationTime: gameResult.time,
                nodesSearched: gameResult.nodes,
                difficulty: settings.description,
                skillLevel: settings.skillLevel,
                fen: fen
              }
            });
          }

          if (line.includes('depth') && line.includes('score')) {
            const depthMatch = line.match(/depth (\d+)/);
            const nodesMatch = line.match(/nodes (\d+)/);
            if (depthMatch) {
              gameResult.depth = parseInt(depthMatch[1]);
            }
            if (nodesMatch) {
              gameResult.nodes = parseInt(nodesMatch[1]);
            }
          }
        });
      };

      // Listen for move data
      engine.engine.stdout.on('data', handleData);

      // Configure engine based on difficulty
      engine.send('ucinewgame');
      engine.send(`setoption name Hash value ${settings.hash}`);
      engine.send(`setoption name Threads value ${settings.threads}`);
      engine.send(`setoption name Skill Level value ${settings.skillLevel}`);
      engine.send('setoption name UCI_LimitStrength value false');
      engine.send('setoption name MultiPV value 1');
      engine.send('setoption name Contempt value 0');
      engine.send('setoption name Ponder value false');
      engine.send('setoption name OwnBook value false');
      engine.send(`position fen ${fen}`);
      engine.send(`go depth ${settings.depth} movetime ${settings.timeLimit}`);
    });

  } catch (error) {
    console.error('Stockfish difficulty move error:', error);
    res.status(500).json({ 
      error: 'Failed to get Stockfish move',
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

function calculateAdvantage(evaluation) {
  if (!evaluation) return 'Equal';
  
  if (evaluation.type === 'mate') {
    return evaluation.value > 0 ? 'White winning' : 'Black winning';
  }
  
  if (evaluation.type === 'centipawn') {
    const pawns = evaluation.value / 100;
    if (pawns > 3) return 'White winning';
    if (pawns > 1) return 'White advantage';
    if (pawns > 0.5) return 'White slightly better';
    if (pawns > -0.5) return 'Equal';
    if (pawns > -1) return 'Black slightly better';
    if (pawns > -3) return 'Black advantage';
    return 'Black winning';
  }
  
  return 'Equal';
}

// ...rest of existing helper functions...
module.exports = router;
