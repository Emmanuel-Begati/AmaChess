const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('../config/logger');

class StockfishService {
  constructor() {
    // Initialize cache with 5 minute TTL for position analysis
    this.cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
    
    // API configuration
    this.apiConfig = {
      baseURL: process.env.STOCKFISH_API_URL || 'https://stockfish.online/api/s/v2.php',
      timeout: 30000, // 30 second timeout
      retries: 3,
      retryDelay: 1000
    };
    
    // Rate limiting
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.maxConcurrentRequests = 3;
    this.activeRequests = 0;
    
    logger.info('StockfishService initialized with API integration');
  }

  /**
   * Generate cache key for position analysis
   */
  generateCacheKey(fen, depth, time, difficulty) {
    return `analysis_${Buffer.from(fen).toString('base64')}_${depth}_${time}_${difficulty}`;
  }

  /**
   * Add request to queue for rate limiting
   */
  async queueRequest(requestFn) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ requestFn, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Process request queue with rate limiting
   */
  async processQueue() {
    if (this.isProcessingQueue || this.activeRequests >= this.maxConcurrentRequests) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
      const { requestFn, resolve, reject } = this.requestQueue.shift();
      
      this.activeRequests++;
      
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        this.activeRequests--;
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Make API request with retry logic
   */
  async makeApiRequest(params, retryCount = 0) {
    try {
      const response = await axios.get(this.apiConfig.baseURL, {
        params,
        timeout: this.apiConfig.timeout,
        headers: {
          'User-Agent': 'AmaChess/1.0',
          'Accept': 'application/json'
        }
      });



      if (response.data && response.data.success !== false) {
        return response.data;
      } else {
        throw new Error(response.data?.error || 'API returned unsuccessful response');
      }
    } catch (error) {
      if (retryCount < this.apiConfig.retries) {
        logger.warn(`Stockfish API request failed, retrying (${retryCount + 1}/${this.apiConfig.retries}):`, error.message);
        await new Promise(resolve => setTimeout(resolve, this.apiConfig.retryDelay * (retryCount + 1)));
        return this.makeApiRequest(params, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Parse evaluation from API response
   */
  parseEvaluation(evalString) {
    if (!evalString || typeof evalString !== 'string') return null;

    try {
      // Handle mate evaluations
      if (evalString.includes('#')) {
        const mateMatch = evalString.match(/#([+-]?\d+)/);
        if (mateMatch) {
          return {
            type: 'mate',
            value: parseInt(mateMatch[1])
          };
        }
      }

      // Handle centipawn evaluations
      const cpMatch = evalString.match(/([+-]?\d+\.?\d*)/);
      if (cpMatch) {
        const value = Math.round(parseFloat(cpMatch[1]) * 100); // Convert to centipawns
        return {
          type: 'centipawn',
          value: value
        };
      }
    } catch (error) {
      logger.warn('Error parsing evaluation:', evalString, error.message);
    }

    return null;
  }

  /**
   * Parse API response into standardized format
   */
  parseApiResponse(response) {
    let bestMove = '';
    let evaluation = null;
    let pv = [];

    if (typeof response === 'string') {
      // Handle string response format - the API returns the full UCI output

      
      const lines = response.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('bestmove')) {
          const parts = trimmedLine.split(' ');
          if (parts.length > 1 && parts[1] !== 'ponder') {
            bestMove = parts[1]; // Extract just the move part
          }
        } else if (trimmedLine.includes('score')) {
          const scoreMatch = trimmedLine.match(/score (cp|mate) ([+-]?\d+)/);
          if (scoreMatch) {
            evaluation = {
              type: scoreMatch[1] === 'mate' ? 'mate' : 'centipawn',
              value: parseInt(scoreMatch[2])
            };
          }
        } else if (trimmedLine.includes('pv')) {
          const pvIndex = trimmedLine.indexOf('pv ');
          if (pvIndex !== -1) {
            pv = trimmedLine.substring(pvIndex + 3).trim().split(' ').filter(move => move.length > 0);
          }
        }
      }
    } else if (response && typeof response === 'object') {
      // Handle object response format
      const bestmoveString = response.bestmove || response.move || '';
      if (bestmoveString.startsWith('bestmove ')) {
        const parts = bestmoveString.split(' ');
        bestMove = parts[1]; // Extract the actual move
      } else {
        bestMove = bestmoveString;
      }
      
      // Handle evaluation
      if (response.mate !== null && response.mate !== undefined) {
        evaluation = {
          type: 'mate',
          value: response.mate
        };
      } else if (response.evaluation !== null && response.evaluation !== undefined) {
        evaluation = {
          type: 'centipawn',
          value: Math.round(response.evaluation * 100) // Convert to centipawns
        };
      }
      
      // Handle principal variation
      if (response.continuation) {
        pv = response.continuation.split(' ').filter(move => move.length > 0);
      } else if (response.pv) {
        pv = Array.isArray(response.pv) ? response.pv : response.pv.split(' ');
      }
    }

    // Clean up bestMove if it contains extra text
    if (bestMove && bestMove.includes(' ')) {
      bestMove = bestMove.split(' ')[0];
    }

    // Validate the move format (should be like e2e4, g1f3, etc.)
    if (bestMove && !/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(bestMove)) {
      logger.warn('Invalid move format detected:', bestMove);
      bestMove = '';
    }

    return { bestMove, evaluation, pv };
  }

  /**
   * Map difficulty to API parameters
   */
  mapDifficultyToParams(difficulty) {
    const difficultyMap = {
      beginner: { depth: 5, skill: 1, time: 1000 },
      intermediate: { depth: 8, skill: 10, time: 3000 },
      advanced: { depth: 12, skill: 15, time: 8000 },
      expert: { depth: 15, skill: 18, time: 12000 },
      maximum: { depth: 15, skill: 20, time: 20000 }
    };

    return difficultyMap[difficulty] || difficultyMap.intermediate;
  }

  /**
   * Get best move with configurable difficulty using API
   */
  async getBestMoveWithDifficulty(fen, difficulty = 'intermediate', timeLimit = 3000) {
    const startTime = Date.now();
    
    try {
      logger.info(`Getting move for difficulty: ${difficulty}, position: ${fen.substring(0, 30)}...`);
      
      // Check cache first
      const cacheKey = this.generateCacheKey(fen, 0, timeLimit, difficulty);
      const cachedResult = this.cache.get(cacheKey);
      if (cachedResult) {
        logger.info('Returning cached move result');
        return cachedResult;
      }

      const params = this.mapDifficultyToParams(difficulty);
      
      const requestFn = async () => {
        const apiParams = {
          fen: fen,
          depth: params.depth,
          mode: 'bestmove'
        };

        const response = await this.makeApiRequest(apiParams);
        const parsed = this.parseApiResponse(response);

        if (!parsed.bestMove || parsed.bestMove === '(none)') {
          throw new Error('No valid move returned from API');
        }

        const result = {
          bestMove: parsed.bestMove,
          evaluation: parsed.evaluation,
          principalVariation: parsed.pv,
          depth: params.depth,
          timeUsed: Date.now() - startTime,
          difficulty: difficulty,
          skillLevel: params.skill
        };

        // Cache the result
        this.cache.set(cacheKey, result);
        
        return result;
      };

      const result = await this.queueRequest(requestFn);
      
      logger.info(`Move calculation complete: ${result.bestMove} (${result.timeUsed}ms)`);
      return result;

    } catch (error) {
      logger.error('Error getting best move:', error);
      throw new Error(`Move calculation failed: ${error.message}`);
    }
  }

  /**
   * Analyze a chess position using API
   */
  async analyzePosition(fen, depth = 15, time = 1000) {
    const startTime = Date.now();
    
    try {
      logger.info(`Analyzing position: ${fen.substring(0, 30)}... (depth: ${depth})`);
      
      // Check cache first
      const cacheKey = this.generateCacheKey(fen, depth, time, 'analysis');
      const cachedResult = this.cache.get(cacheKey);
      if (cachedResult) {
        logger.info('Returning cached analysis result');
        return cachedResult;
      }

      const requestFn = async () => {
        const apiParams = {
          fen: fen,
          depth: depth,
          mode: 'eval'
        };

        const response = await this.makeApiRequest(apiParams);
        const parsed = this.parseApiResponse(response);

        const analysis = {
          bestMove: parsed.bestMove,
          evaluation: parsed.evaluation,
          principalVariation: parsed.pv,
          depth: depth,
          timeUsed: Date.now() - startTime
        };

        // Cache the result
        this.cache.set(cacheKey, analysis);
        
        return analysis;
      };

      const result = await this.queueRequest(requestFn);
      
      logger.info(`Analysis complete: ${result.bestMove} (${result.timeUsed}ms)`);
      return result;

    } catch (error) {
      logger.error('Error analyzing position:', error);
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  /**
   * Get best move for AI coaching using API
   */
  async getBestMove(fen, skillLevel = 20, depth = 15) {
    const startTime = Date.now();
    
    try {
      logger.info(`Getting coaching move: skill ${skillLevel}, depth ${depth}`);
      
      // Map skill level to difficulty for caching
      const difficulty = skillLevel <= 5 ? 'beginner' : 
                        skillLevel <= 12 ? 'intermediate' : 
                        skillLevel <= 17 ? 'advanced' : 
                        skillLevel <= 19 ? 'expert' : 'maximum';

      const cacheKey = this.generateCacheKey(fen, depth, 0, `coach_${skillLevel}`);
      const cachedResult = this.cache.get(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      const requestFn = async () => {
        const apiParams = {
          fen: fen,
          depth: depth,
          mode: 'bestmove'
        };

        const response = await this.makeApiRequest(apiParams);
        const parsed = this.parseApiResponse(response);

        const result = {
          move: parsed.bestMove,
          evaluation: parsed.evaluation,
          pv: parsed.pv,
          timeUsed: Date.now() - startTime
        };

        this.cache.set(cacheKey, result);
        return result;
      };

      const result = await this.queueRequest(requestFn);
      
      logger.info(`Coaching move found: ${result.move} (${result.timeUsed}ms)`);
      return result;

    } catch (error) {
      logger.error('Error getting coaching move:', error);
      throw new Error(`Move calculation failed: ${error.message}`);
    }
  }

  /**
   * Evaluate multiple moves for coaching feedback using API
   */
  async evaluateMoves(fen, moves, depth = 12) {
    const results = [];
    
    try {
      logger.info(`Evaluating ${moves.length} moves at depth ${depth}`);
      
      // Process moves in parallel with rate limiting
      const evaluationPromises = moves.map(async (move) => {
        try {
          const Chess = require('chess.js').Chess;
          const game = new Chess(fen);
          
          // Validate and make the move
          const moveResult = game.move(move);
          if (!moveResult) {
            return { move, evaluation: null, error: 'Invalid move' };
          }
          
          const newFen = game.fen();
          const cacheKey = this.generateCacheKey(newFen, depth, 0, `eval_${move}`);
          const cachedResult = this.cache.get(cacheKey);
          
          if (cachedResult) {
            return { move, ...cachedResult };
          }

          const requestFn = async () => {
            const apiParams = {
              fen: newFen,
              depth: depth,
              mode: 'eval'
            };

            const response = await this.makeApiRequest(apiParams);
            
            const result = {
              move,
              evaluation: this.parseEvaluation(response.evaluation),
              bestResponse: response.bestmove || ''
            };

            this.cache.set(cacheKey, result);
            return result;
          };

          return await this.queueRequest(requestFn);
          
        } catch (error) {
          logger.warn(`Error evaluating move ${move}:`, error.message);
          return { 
            move, 
            evaluation: null, 
            error: error.message 
          };
        }
      });

      const evaluationResults = await Promise.allSettled(evaluationPromises);
      
      evaluationResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            move: moves[index],
            evaluation: null,
            error: result.reason?.message || 'Evaluation failed'
          });
        }
      });

      logger.info(`Move evaluation complete: ${results.length} results`);
      return results;

    } catch (error) {
      logger.error('Error in evaluateMoves:', error);
      throw new Error(`Move evaluation failed: ${error.message}`);
    }
  }

  /**
   * Generate coaching hints with API analysis
   */
  async generateHint(fen, difficulty = 'medium') {
    try {
      logger.info(`Generating hint for difficulty: ${difficulty}`);
      
      const analysis = await this.analyzePosition(fen, 15, 2000);
      
      const hints = {
        easy: [
          "Look for checks, captures, and threats",
          "Can you attack an undefended piece?",
          "Is there a piece that can be forked?",
          "Check if any of your pieces are under attack"
        ],
        medium: [
          "Consider the most forcing moves first",
          "Look for tactical patterns like pins and skewers",
          "Can you improve your worst-placed piece?",
          "Think about pawn structure and weaknesses"
        ],
        hard: [
          "Calculate deeper variations",
          "Consider long-term positional factors",
          "Look for subtle improvements in piece coordination",
          "Evaluate the resulting endgame"
        ]
      };

      const difficultyHints = hints[difficulty] || hints.medium;
      const randomHint = difficultyHints[Math.floor(Math.random() * difficultyHints.length)];

      const result = {
        hint: randomHint,
        bestMove: analysis.bestMove,
        evaluation: analysis.evaluation,
        principalVariation: analysis.principalVariation.slice(0, 3)
      };

      logger.info(`Hint generated: ${randomHint}`);
      return result;

    } catch (error) {
      logger.error('Error generating hint:', error);
      return {
        hint: "Consider your options carefully and look for the best move",
        error: error.message
      };
    }
  }

  /**
   * Health check for API service
   */
  async healthCheck() {
    try {
      const testFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      const startTime = Date.now();
      
      const response = await this.makeApiRequest({
        fen: testFen,
        depth: 5,
        mode: 'bestmove'
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime: responseTime,
        apiUrl: this.apiConfig.baseURL,
        cacheStats: this.cache.getStats(),
        activeRequests: this.activeRequests,
        queueLength: this.requestQueue.length
      };
    } catch (error) {
      logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        apiUrl: this.apiConfig.baseURL
      };
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    const keys = this.cache.keys();
    this.cache.flushAll();
    logger.info(`Cleared ${keys.length} cached entries`);
    return keys.length;
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      cacheStats: this.cache.getStats(),
      activeRequests: this.activeRequests,
      queueLength: this.requestQueue.length,
      apiConfig: {
        baseURL: this.apiConfig.baseURL,
        timeout: this.apiConfig.timeout,
        retries: this.apiConfig.retries
      }
    };
  }

  /**
   * Cleanup method for graceful shutdown
   */
  async cleanup() {
    logger.info('Cleaning up StockfishService...');
    
    // Wait for active requests to complete
    let waitCount = 0;
    while (this.activeRequests > 0 && waitCount < 30) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      waitCount++;
    }
    
    // Clear cache and queue
    this.cache.flushAll();
    this.requestQueue.length = 0;
    
    logger.info('StockfishService cleanup complete');
  }
}

module.exports = StockfishService;
