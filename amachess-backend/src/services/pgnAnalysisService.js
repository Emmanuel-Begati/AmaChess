const { Chess } = require('chess.js');
const StockfishService = require('./stockfishService');

class PGNAnalysisService {
  constructor() {
    this.stockfishService = new StockfishService();
    this.analysisCache = new Map(); // Cache for identical PGN inputs
  }

  /**
   * Analyze a PGN string and return comprehensive statistics
   * @param {string} pgnString - PGN data to analyze
   * @param {object} options - Analysis options
   * @returns {Promise<object>} Analysis results
   */
  async analyzePGN(pgnString, options = {}) {
    const {
      depth = 15,
      timePerMove = 2000,
      enableCache = true,
      username = null
    } = options;

    // Check cache first
    const cacheKey = this.generateCacheKey(pgnString, { depth, timePerMove });
    if (enableCache && this.analysisCache.has(cacheKey)) {
      console.log('Cache hit for PGN analysis');
      return this.analysisCache.get(cacheKey);
    }

    try {
      // Parse PGN and extract game
      const game = new Chess();
      const moves = this.parsePGNMoves(pgnString);
      
      if (moves.length === 0) {
        throw new Error('No valid moves found in PGN');
      }

      // Extract game metadata
      const metadata = this.extractPGNMetadata(pgnString);
      
      // Analyze each move
      const moveAnalysis = await this.analyzeMoves(game, moves, { depth, timePerMove });
      
      // Calculate statistics
      const statistics = this.calculateGameStatistics(moveAnalysis, metadata, username);
      
      // Detect game phases
      const phaseAnalysis = this.analyzeGamePhases(moveAnalysis, moves);
      
      // Find key moments
      const keyMoments = this.findKeyMoments(moveAnalysis);
      
      // Build final analysis result
      const analysis = {
        metadata,
        statistics,
        phaseAnalysis,
        keyMoments,
        moveAnalysis: moveAnalysis.slice(0, 50), // Limit for performance
        generatedAt: new Date().toISOString(),
        options: { depth, timePerMove }
      };

      // Cache the result
      if (enableCache) {
        this.analysisCache.set(cacheKey, analysis);
        // Clean cache if it gets too large
        if (this.analysisCache.size > 100) {
          const firstKey = this.analysisCache.keys().next().value;
          this.analysisCache.delete(firstKey);
        }
      }

      return analysis;

    } catch (error) {
      console.error('PGN Analysis error:', error);
      throw new Error(`Failed to analyze PGN: ${error.message}`);
    }
  }

  /**
   * Parse PGN string and extract moves
   * @param {string} pgnString - PGN data
   * @returns {Array} Array of move objects
   */
  parsePGNMoves(pgnString) {
    try {
      const game = new Chess();
      
      // Clean PGN by removing comments and annotations
      let cleanPgn = pgnString
        .replace(/\{[^}]*\}/g, '') // Remove comments
        .replace(/\([^)]*\)/g, '') // Remove variations
        .replace(/\$\d+/g, '') // Remove NAGs (Numeric Annotation Glyphs)
        .replace(/[!?]+/g, '') // Remove move annotations
        .trim();

      // Extract just the moves (after the headers)
      const moveSection = cleanPgn.split('\n\n')[1] || cleanPgn;
      const moveText = moveSection
        .replace(/\d+\./g, '') // Remove move numbers
        .replace(/\s+/g, ' ')
        .trim();

      const moves = [];
      const moveList = moveText.split(' ').filter(move => move && move !== '1-0' && move !== '0-1' && move !== '1/2-1/2' && move !== '*');

      for (const moveStr of moveList) {
        try {
          const move = game.move(moveStr);
          if (move) {
            moves.push({
              ...move,
              fen: game.fen(),
              moveNumber: Math.ceil(moves.length / 2) + 1,
              isWhiteMove: moves.length % 2 === 0
            });
          }
        } catch (error) {
          console.log(`Skipping invalid move: ${moveStr}`);
          break; // Stop on first invalid move
        }
      }

      return moves;
    } catch (error) {
      console.error('Error parsing PGN moves:', error);
      return [];
    }
  }

  /**
   * Extract metadata from PGN headers
   * @param {string} pgnString - PGN data
   * @returns {object} Game metadata
   */
  extractPGNMetadata(pgnString) {
    const metadata = {
      event: 'Unknown Event',
      site: 'Unknown Site',
      date: 'Unknown Date',
      round: 'Unknown Round',
      white: 'Unknown',
      black: 'Unknown',
      result: '*',
      whiteElo: null,
      blackElo: null,
      timeControl: 'Unknown',
      opening: 'Unknown Opening'
    };

    const lines = pgnString.split('\n');
    
    for (const line of lines) {
      const match = line.match(/\[(\w+)\s+"([^"]+)"\]/);
      if (match) {
        const [, key, value] = match;
        switch (key.toLowerCase()) {
          case 'event':
            metadata.event = value;
            break;
          case 'site':
            metadata.site = value;
            break;
          case 'date':
            metadata.date = value;
            break;
          case 'round':
            metadata.round = value;
            break;
          case 'white':
            metadata.white = value;
            break;
          case 'black':
            metadata.black = value;
            break;
          case 'result':
            metadata.result = value;
            break;
          case 'whiteelo':
            metadata.whiteElo = parseInt(value) || null;
            break;
          case 'blackelo':
            metadata.blackElo = parseInt(value) || null;
            break;
          case 'timecontrol':
            metadata.timeControl = value;
            break;
          case 'opening':
            metadata.opening = value;
            break;
        }
      }
    }

    return metadata;
  }

  /**
   * Analyze each move using Stockfish
   * @param {Chess} game - Chess.js game instance
   * @param {Array} moves - Array of moves to analyze
   * @param {object} options - Analysis options
   * @returns {Promise<Array>} Array of move analyses
   */
  async analyzeMoves(game, moves, options) {
    const { depth, timePerMove } = options;
    const analysisResults = [];
    const gameInstance = new Chess();

    console.log(`Starting analysis of ${moves.length} moves...`);

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      
      try {
        // Analyze position before the move
        const positionBeforeMove = gameInstance.fen();
        
        // Get best move and evaluation for this position
        const analysis = await this.stockfishService.analyzePosition(
          positionBeforeMove, 
          depth, 
          timePerMove
        );

        // Make the actual move that was played
        gameInstance.move(move.san);
        const positionAfterMove = gameInstance.fen();

        // Evaluate the position after the move
        const postMoveAnalysis = await this.stockfishService.analyzePosition(
          positionAfterMove,
          Math.min(depth, 12), // Lighter analysis for post-move
          Math.min(timePerMove, 1000)
        );

        // Calculate move quality
        const moveQuality = this.calculateMoveQuality(
          move.san,
          analysis.bestMove,
          analysis.evaluation,
          postMoveAnalysis.evaluation
        );

        analysisResults.push({
          moveNumber: move.moveNumber,
          isWhiteMove: move.isWhiteMove,
          move: move.san,
          from: move.from,
          to: move.to,
          positionBefore: positionBeforeMove,
          positionAfter: positionAfterMove,
          engineBestMove: analysis.bestMove,
          engineEvaluation: analysis.evaluation,
          postMoveEvaluation: postMoveAnalysis.evaluation,
          moveQuality,
          principalVariation: analysis.principalVariation || [],
          depth: analysis.depth || depth,
          analysisTime: Date.now()
        });

        // Progress logging
        if ((i + 1) % 10 === 0) {
          console.log(`Analyzed ${i + 1}/${moves.length} moves`);
        }

      } catch (error) {
        console.error(`Error analyzing move ${i + 1} (${move.san}):`, error);
        
        // Add basic move info even if analysis fails
        gameInstance.move(move.san);
        analysisResults.push({
          moveNumber: move.moveNumber,
          isWhiteMove: move.isWhiteMove,
          move: move.san,
          from: move.from,
          to: move.to,
          positionBefore: gameInstance.fen(),
          positionAfter: gameInstance.fen(),
          engineBestMove: null,
          engineEvaluation: null,
          postMoveEvaluation: null,
          moveQuality: { type: 'unknown', score: 50, description: 'Analysis failed' },
          error: error.message
        });
      }
    }

    console.log(`Move analysis complete: ${analysisResults.length} moves analyzed`);
    return analysisResults;
  }

  /**
   * Calculate move quality based on engine analysis
   * @param {string} playedMove - The move that was played
   * @param {string} bestMove - Engine's best move
   * @param {object} preMoveEval - Evaluation before the move
   * @param {object} postMoveEval - Evaluation after the move
   * @returns {object} Move quality assessment
   */
  calculateMoveQuality(playedMove, bestMove, preMoveEval, postMoveEval) {
    // Default quality
    let quality = { type: 'good', score: 75, description: 'Good move' };

    if (!preMoveEval || !postMoveEval) {
      return { type: 'unknown', score: 50, description: 'Unable to evaluate' };
    }

    // If played move is the same as best move
    if (playedMove === bestMove) {
      return { type: 'excellent', score: 95, description: 'Best move' };
    }

    // Calculate centipawn difference
    const preValue = this.evaluationToNumber(preMoveEval);
    const postValue = this.evaluationToNumber(postMoveEval);
    
    // For the opponent's perspective, flip the evaluation
    const centipawnLoss = Math.abs(preValue - (-postValue));

    // Classify move quality based on centipawn loss
    if (centipawnLoss <= 10) {
      quality = { type: 'excellent', score: 90, description: 'Excellent move' };
    } else if (centipawnLoss <= 25) {
      quality = { type: 'good', score: 80, description: 'Good move' };
    } else if (centipawnLoss <= 50) {
      quality = { type: 'inaccuracy', score: 65, description: 'Inaccuracy' };
    } else if (centipawnLoss <= 100) {
      quality = { type: 'mistake', score: 40, description: 'Mistake' };
    } else {
      quality = { type: 'blunder', score: 20, description: 'Blunder' };
    }

    quality.centipawnLoss = Math.round(centipawnLoss);
    return quality;
  }

  /**
   * Convert evaluation object to numerical value
   * @param {object} evaluation - Stockfish evaluation
   * @returns {number} Numerical evaluation in centipawns
   */
  evaluationToNumber(evaluation) {
    if (!evaluation) return 0;
    
    if (evaluation.type === 'mate') {
      // Convert mate scores to very high/low centipawn values
      return evaluation.value > 0 ? 10000 : -10000;
    }
    
    if (evaluation.type === 'centipawn') {
      return evaluation.value || 0;
    }
    
    return 0;
  }

  /**
   * Calculate comprehensive game statistics
   * @param {Array} moveAnalysis - Array of analyzed moves
   * @param {object} metadata - Game metadata
   * @param {string} username - Optional username to identify player side
   * @returns {object} Game statistics
   */
  calculateGameStatistics(moveAnalysis, metadata, username) {
    const stats = {
      totalMoves: moveAnalysis.length,
      whiteMoves: moveAnalysis.filter(m => m.isWhiteMove).length,
      blackMoves: moveAnalysis.filter(m => !m.isWhiteMove).length,
      whiteStats: { accuracy: 0, centipawnLoss: 0, blunders: 0, mistakes: 0, inaccuracies: 0, excellent: 0, good: 0 },
      blackStats: { accuracy: 0, centipawnLoss: 0, blunders: 0, mistakes: 0, inaccuracies: 0, excellent: 0, good: 0 },
      overallStats: { accuracy: 0, centipawnLoss: 0, blunders: 0, mistakes: 0, inaccuracies: 0, excellent: 0, good: 0 }
    };

    // Calculate stats for each side
    ['white', 'black'].forEach(side => {
      const isWhite = side === 'white';
      const moves = moveAnalysis.filter(m => m.isWhiteMove === isWhite && m.moveQuality);
      
      if (moves.length === 0) return;

      const sideStats = side === 'white' ? stats.whiteStats : stats.blackStats;
      
      // Count move types
      moves.forEach(move => {
        const quality = move.moveQuality.type;
        sideStats[quality] = (sideStats[quality] || 0) + 1;
        
        if (move.moveQuality.centipawnLoss) {
          sideStats.centipawnLoss += move.moveQuality.centipawnLoss;
        }
      });

      // Calculate accuracy (percentage of good/excellent moves)
      const goodMoves = (sideStats.excellent || 0) + (sideStats.good || 0);
      sideStats.accuracy = Math.round((goodMoves / moves.length) * 100);
      
      // Average centipawn loss
      sideStats.centipawnLoss = Math.round(sideStats.centipawnLoss / moves.length);
    });

    // Calculate overall stats
    const allMoves = moveAnalysis.filter(m => m.moveQuality);
    if (allMoves.length > 0) {
      allMoves.forEach(move => {
        const quality = move.moveQuality.type;
        stats.overallStats[quality] = (stats.overallStats[quality] || 0) + 1;
        
        if (move.moveQuality.centipawnLoss) {
          stats.overallStats.centipawnLoss += move.moveQuality.centipawnLoss;
        }
      });

      const goodMoves = (stats.overallStats.excellent || 0) + (stats.overallStats.good || 0);
      stats.overallStats.accuracy = Math.round((goodMoves / allMoves.length) * 100);
      stats.overallStats.centipawnLoss = Math.round(stats.overallStats.centipawnLoss / allMoves.length);
    }

    // Determine player side if username provided
    if (username) {
      if (metadata.white?.toLowerCase().includes(username.toLowerCase())) {
        stats.playerSide = 'white';
        stats.playerStats = stats.whiteStats;
      } else if (metadata.black?.toLowerCase().includes(username.toLowerCase())) {
        stats.playerSide = 'black';
        stats.playerStats = stats.blackStats;
      }
    }

    return stats;
  }

  /**
   * Analyze game phases (opening, middlegame, endgame)
   * @param {Array} moveAnalysis - Array of analyzed moves
   * @param {Array} moves - Original moves
   * @returns {object} Phase analysis
   */
  analyzeGamePhases(moveAnalysis, moves) {
    const totalMoves = moves.length;
    const openingEnd = Math.min(20, Math.floor(totalMoves * 0.3));
    const middlegameEnd = Math.min(40, Math.floor(totalMoves * 0.7));

    const phases = {
      opening: { moves: [], avgAccuracy: 0, keyMoments: [] },
      middlegame: { moves: [], avgAccuracy: 0, keyMoments: [] },
      endgame: { moves: [], avgAccuracy: 0, keyMoments: [] }
    };

    moveAnalysis.forEach((move, index) => {
      if (index < openingEnd) {
        phases.opening.moves.push(move);
      } else if (index < middlegameEnd) {
        phases.middlegame.moves.push(move);
      } else {
        phases.endgame.moves.push(move);
      }
    });

    // Calculate phase statistics
    Object.keys(phases).forEach(phase => {
      const phaseMoves = phases[phase].moves.filter(m => m.moveQuality);
      if (phaseMoves.length > 0) {
        const accuracySum = phaseMoves.reduce((sum, move) => sum + (move.moveQuality.score || 0), 0);
        phases[phase].avgAccuracy = Math.round(accuracySum / phaseMoves.length);
        
        // Find significant moments in this phase
        phases[phase].keyMoments = phaseMoves
          .filter(move => move.moveQuality.type === 'blunder' || move.moveQuality.type === 'excellent')
          .slice(0, 3);
      }
    });

    return phases;
  }

  /**
   * Find key moments in the game (best moves, blunders, turning points)
   * @param {Array} moveAnalysis - Array of analyzed moves
   * @returns {Array} Key moments
   */
  findKeyMoments(moveAnalysis) {
    const keyMoments = [];
    
    moveAnalysis.forEach(move => {
      if (move.moveQuality) {
        // Mark blunders
        if (move.moveQuality.type === 'blunder') {
          keyMoments.push({
            type: 'blunder',
            moveNumber: move.moveNumber,
            side: move.isWhiteMove ? 'white' : 'black',
            move: move.move,
            description: `Blunder: Lost ${move.moveQuality.centipawnLoss} centipawns`,
            evaluation: move.postMoveEvaluation,
            betterMove: move.engineBestMove
          });
        }
        
        // Mark excellent moves
        if (move.moveQuality.type === 'excellent' && move.moveQuality.score >= 95) {
          keyMoments.push({
            type: 'excellent',
            moveNumber: move.moveNumber,
            side: move.isWhiteMove ? 'white' : 'black',
            move: move.move,
            description: 'Excellent move - found the best continuation',
            evaluation: move.postMoveEvaluation
          });
        }
      }
    });

    // Sort by move number and limit to most significant moments
    return keyMoments
      .sort((a, b) => a.moveNumber - b.moveNumber)
      .slice(0, 10);
  }

  /**
   * Generate cache key for analysis results
   * @param {string} pgnString - PGN data
   * @param {object} options - Analysis options
   * @returns {string} Cache key
   */
  generateCacheKey(pgnString, options) {
    const hash = require('crypto').createHash('md5').update(pgnString + JSON.stringify(options)).digest('hex');
    return `pgn_analysis_${hash}`;
  }

  /**
   * Clear analysis cache
   */
  clearCache() {
    this.analysisCache.clear();
    console.log('PGN analysis cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.analysisCache.size,
      maxSize: 100
    };
  }
}

module.exports = PGNAnalysisService;
