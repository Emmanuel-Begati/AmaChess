const express = require('express');
const router = express.Router();
const PGNAnalysisService = require('../services/pgnAnalysisService');

// Initialize PGN Analysis service
const pgnAnalysisService = new PGNAnalysisService();

/**
 * POST /api/analyze
 * Analyze a single PGN game and return statistics
 */
router.post('/', async (req, res) => {
  try {
    const { 
      pgn, 
      depth = 15, 
      timePerMove = 2000, 
      username = null,
      enableCache = true 
    } = req.body;

    // Validate input
    if (!pgn || typeof pgn !== 'string') {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'PGN string is required'
      });
    }

    if (pgn.trim().length < 50) {
      return res.status(400).json({
        error: 'Invalid PGN',
        message: 'PGN appears to be too short or empty'
      });
    }

    // Validate analysis parameters
    if (depth < 5 || depth > 25) {
      return res.status(400).json({
        error: 'Invalid depth',
        message: 'Depth must be between 5 and 25'
      });
    }

    if (timePerMove < 500 || timePerMove > 10000) {
      return res.status(400).json({
        error: 'Invalid time per move',
        message: 'Time per move must be between 500ms and 10000ms'
      });
    }

    console.log(`Starting PGN analysis - depth: ${depth}, timePerMove: ${timePerMove}ms`);

    // Perform analysis
    const startTime = Date.now();
    const analysis = await pgnAnalysisService.analyzePGN(pgn, {
      depth,
      timePerMove,
      enableCache,
      username
    });

    const analysisTime = Date.now() - startTime;
    console.log(`PGN analysis completed in ${analysisTime}ms`);

    // Return results in the format expected by frontend
    res.json({
      success: true,
      analysis: {
        // Game metadata
        metadata: analysis.metadata,
        
        // Player statistics (what frontend expects)
        accuracy: analysis.statistics.playerStats?.accuracy || analysis.statistics.overallStats.accuracy,
        blunders: analysis.statistics.playerStats?.blunders || analysis.statistics.overallStats.blunders || 0,
        mistakes: analysis.statistics.playerStats?.mistakes || analysis.statistics.overallStats.mistakes || 0,
        inaccuracies: analysis.statistics.playerStats?.inaccuracies || analysis.statistics.overallStats.inaccuracies || 0,
        excellentMoves: analysis.statistics.playerStats?.excellent || analysis.statistics.overallStats.excellent || 0,
        goodMoves: analysis.statistics.playerStats?.good || analysis.statistics.overallStats.good || 0,
        
        // Additional statistics
        centipawnLoss: analysis.statistics.playerStats?.centipawnLoss || analysis.statistics.overallStats.centipawnLoss || 0,
        totalMoves: analysis.statistics.totalMoves,
        playerSide: analysis.statistics.playerSide || 'unknown',
        
        // Phase analysis
        phaseAnalysis: {
          opening: {
            accuracy: analysis.phaseAnalysis.opening.avgAccuracy,
            movesAnalyzed: analysis.phaseAnalysis.opening.moves.length,
            keyMoments: analysis.phaseAnalysis.opening.keyMoments.length
          },
          middlegame: {
            accuracy: analysis.phaseAnalysis.middlegame.avgAccuracy,
            movesAnalyzed: analysis.phaseAnalysis.middlegame.moves.length,
            keyMoments: analysis.phaseAnalysis.middlegame.keyMoments.length
          },
          endgame: {
            accuracy: analysis.phaseAnalysis.endgame.avgAccuracy,
            movesAnalyzed: analysis.phaseAnalysis.endgame.moves.length,
            keyMoments: analysis.phaseAnalysis.endgame.keyMoments.length
          }
        },
        
        // Key moments for frontend display
        keyMoments: analysis.keyMoments.map(moment => ({
          moveNumber: moment.moveNumber,
          type: moment.type,
          side: moment.side,
          move: moment.move,
          description: moment.description,
          evaluation: this.formatEvaluation(moment.evaluation),
          betterMove: moment.betterMove
        })),
        
        // Move quality distribution
        moveAccuracy: {
          excellent: { 
            count: analysis.statistics.overallStats.excellent || 0, 
            percentage: this.calculatePercentage(analysis.statistics.overallStats.excellent || 0, analysis.statistics.totalMoves)
          },
          good: { 
            count: analysis.statistics.overallStats.good || 0, 
            percentage: this.calculatePercentage(analysis.statistics.overallStats.good || 0, analysis.statistics.totalMoves)
          },
          inaccuracies: { 
            count: analysis.statistics.overallStats.inaccuracies || 0, 
            percentage: this.calculatePercentage(analysis.statistics.overallStats.inaccuracies || 0, analysis.statistics.totalMoves)
          },
          mistakes: { 
            count: analysis.statistics.overallStats.mistakes || 0, 
            percentage: this.calculatePercentage(analysis.statistics.overallStats.mistakes || 0, analysis.statistics.totalMoves)
          },
          blunders: { 
            count: analysis.statistics.overallStats.blunders || 0, 
            percentage: this.calculatePercentage(analysis.statistics.overallStats.blunders || 0, analysis.statistics.totalMoves)
          }
        },
        
        // Opening analysis
        openingName: analysis.metadata.opening,
        openingEval: this.formatEvaluation(analysis.phaseAnalysis.opening.moves[0]?.engineEvaluation),
        
        // Game result and time analysis
        result: analysis.metadata.result,
        timeControl: analysis.metadata.timeControl,
        
        // Performance rating
        performanceRating: this.calculatePerformanceRating(analysis.statistics),
        
        // Analysis metadata
        analysisInfo: {
          depth: analysis.options.depth,
          timePerMove: analysis.options.timePerMove,
          analysisTime: analysisTime,
          generatedAt: analysis.generatedAt,
          movesAnalyzed: analysis.moveAnalysis.length,
          cacheHit: enableCache && analysis.fromCache
        }
      }
    });

  } catch (error) {
    console.error('PGN analysis error:', error);
    
    // Handle specific error types
    if (error.message.includes('No valid moves')) {
      return res.status(400).json({
        error: 'Invalid PGN format',
        message: 'Unable to parse valid chess moves from the provided PGN'
      });
    }
    
    if (error.message.includes('timeout')) {
      return res.status(408).json({
        error: 'Analysis timeout',
        message: 'The analysis is taking too long. Try reducing the depth or time per move.'
      });
    }
    
    if (error.message.includes('Stockfish')) {
      return res.status(503).json({
        error: 'Engine unavailable',
        message: 'Chess engine is currently unavailable. Please try again later.'
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Analysis failed',
      message: 'An error occurred while analyzing the PGN',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/analyze/batch
 * Analyze multiple PGN games (prepared for future enhancement)
 */
router.post('/batch', async (req, res) => {
  try {
    const { pgns, depth = 12, timePerMove = 1000, username = null } = req.body;

    if (!Array.isArray(pgns) || pgns.length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Array of PGN strings is required'
      });
    }

    if (pgns.length > 10) {
      return res.status(400).json({
        error: 'Too many games',
        message: 'Maximum 10 games can be analyzed at once'
      });
    }

    const results = [];
    const startTime = Date.now();

    for (let i = 0; i < pgns.length; i++) {
      try {
        const analysis = await pgnAnalysisService.analyzePGN(pgns[i], {
          depth: Math.min(depth, 12), // Limit depth for batch processing
          timePerMove: Math.min(timePerMove, 1500), // Limit time for batch
          enableCache: true,
          username
        });

        results.push({
          index: i,
          success: true,
          analysis: analysis.statistics
        });

      } catch (error) {
        results.push({
          index: i,
          success: false,
          error: error.message
        });
      }
    }

    const totalTime = Date.now() - startTime;

    res.json({
      success: true,
      batchAnalysis: {
        totalGames: pgns.length,
        successfulAnalyses: results.filter(r => r.success).length,
        failedAnalyses: results.filter(r => !r.success).length,
        totalTime,
        results
      }
    });

  } catch (error) {
    console.error('Batch analysis error:', error);
    res.status(500).json({
      error: 'Batch analysis failed',
      message: error.message
    });
  }
});

/**
 * GET /api/analyze/cache/stats
 * Get cache statistics
 */
router.get('/cache/stats', (req, res) => {
  try {
    const stats = pgnAnalysisService.getCacheStats();
    res.json({
      success: true,
      cache: stats
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get cache stats',
      message: error.message
    });
  }
});

/**
 * DELETE /api/analyze/cache
 * Clear analysis cache
 */
router.delete('/cache', (req, res) => {
  try {
    pgnAnalysisService.clearCache();
    res.json({
      success: true,
      message: 'Analysis cache cleared'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error.message
    });
  }
});

/**
 * Helper function to format evaluation for display
 */
function formatEvaluation(evaluation) {
  if (!evaluation) return '0.00';
  
  if (evaluation.type === 'mate') {
    return `Mate in ${Math.abs(evaluation.value)}`;
  }
  
  if (evaluation.type === 'centipawn') {
    const pawns = evaluation.value / 100;
    return pawns > 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2);
  }
  
  return '0.00';
}

/**
 * Helper function to calculate percentage
 */
function calculatePercentage(count, total) {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

/**
 * Helper function to calculate performance rating
 */
function calculatePerformanceRating(statistics) {
  const accuracy = statistics.playerStats?.accuracy || statistics.overallStats.accuracy;
  const centipawnLoss = statistics.playerStats?.centipawnLoss || statistics.overallStats.centipawnLoss;
  
  // Simple performance rating calculation
  let rating = 1500; // Base rating
  
  // Adjust for accuracy
  rating += (accuracy - 75) * 10;
  
  // Adjust for centipawn loss
  rating -= Math.min(centipawnLoss * 2, 300);
  
  return Math.max(800, Math.min(2800, Math.round(rating)));
}

module.exports = router;
