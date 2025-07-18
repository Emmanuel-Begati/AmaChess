const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class StockfishService {
  constructor() {
    this.engines = new Map(); // Store multiple engine instances
    this.stockfishPath = this.getStockfishPath();
  }

  getStockfishPath() {
    // Try multiple common Stockfish locations, prioritizing Linux binaries
    const possiblePaths = [
      'stockfish', // Linux system installation (preferred)
      path.join(__dirname, '../../stockfish/stockfish'), // Unix executable
      path.join(__dirname, '../../stockfish/src/stockfish'), // Built from source Unix
      path.join(__dirname, '../../stockfish/stockfish.exe'), // Windows executable (fallback)
      path.join(__dirname, '../../stockfish/src/stockfish.exe'), // Built from source Windows
      'stockfish.exe' // If in PATH on Windows (fallback)
    ];

    for (const stockfishPath of possiblePaths) {
      try {
        if (fs.existsSync(stockfishPath)) {
          console.log(`Found Stockfish at: ${stockfishPath}`);
          // Test if the executable is actually working
          const testSpawn = spawn(stockfishPath, [], { stdio: 'pipe' });
          testSpawn.kill();
          return stockfishPath;
        }
      } catch (error) {
        console.log(`Could not access ${stockfishPath}:`, error.message);
        continue;
      }
    }

    console.log('Using Stockfish from PATH');
    return 'stockfish'; // Fallback to PATH
  }

  // Create a new Stockfish engine instance with improved error handling
  createEngine(engineId = 'default') {
    return new Promise((resolve, reject) => {
      try {
        console.log(`Creating Stockfish engine: ${engineId}`);
        const engine = spawn(this.stockfishPath);
        
        engine.stdin.setEncoding('utf8');
        engine.stdout.setEncoding('utf8');

        let initialized = false;
        let bestMove = '';
        let evaluation = null;
        let principalVariation = [];
        let depth = 0;

        const engineWrapper = {
          engine,
          send: (command) => {
            console.log(`[${engineId}] Sending: ${command}`);
            try {
              engine.stdin.write(command + '\n');
            } catch (error) {
              console.error(`[${engineId}] Error sending command:`, error);
            }
          },
          close: () => {
            try {
              console.log(`[${engineId}] Closing engine`);
              engine.stdin.write('quit\n');
              setTimeout(() => {
                if (!engine.killed) {
                  engine.kill();
                }
              }, 1000);
            } catch (error) {
              console.log(`[${engineId}] Force killing engine`);
              engine.kill();
            }
          },
          getBestMove: () => bestMove,
          getEvaluation: () => evaluation,
          getPrincipalVariation: () => principalVariation,
          getDepth: () => depth
        };

        engine.stdout.on('data', (data) => {
          const lines = data.toString().split('\n');
          
          lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            console.log(`[${engineId}] Output: ${line}`);

            if (line.includes('uciok') && !initialized) {
              initialized = true;
              console.log(`[${engineId}] Engine initialized successfully`);
              resolve(engineWrapper);
            }

            // Parse best move
            if (line.startsWith('bestmove')) {
              const parts = line.split(' ');
              bestMove = parts[1];
              console.log(`[${engineId}] Best move: ${bestMove}`);
            }

            // Parse evaluation and depth
            if (line.includes('depth') && line.includes('score')) {
              const depthMatch = line.match(/depth (\d+)/);
              if (depthMatch) {
                depth = parseInt(depthMatch[1]);
              }

              // Parse centipawn evaluation
              const cpMatch = line.match(/score cp (-?\d+)/);
              if (cpMatch) {
                evaluation = {
                  type: 'centipawn',
                  value: parseInt(cpMatch[1])
                };
              }

              // Parse mate evaluation
              const mateMatch = line.match(/score mate (-?\d+)/);
              if (mateMatch) {
                evaluation = {
                  type: 'mate',
                  value: parseInt(mateMatch[1])
                };
              }

              // Parse principal variation
              const pvIndex = line.indexOf('pv ');
              if (pvIndex !== -1) {
                principalVariation = line.substring(pvIndex + 3).trim().split(' ').filter(move => move.length > 0);
              }
            }
          });
        });

        engine.stderr.on('data', (data) => {
          console.error(`[${engineId}] stderr:`, data.toString());
        });

        engine.on('close', (code) => {
          console.log(`[${engineId}] Process exited with code ${code}`);
          this.engines.delete(engineId);
        });

        engine.on('error', (error) => {
          console.error(`[${engineId}] Process error:`, error);
          reject(new Error(`Failed to start Stockfish: ${error.message}`));
        });

        // Initialize UCI protocol
        engine.stdin.write('uci\n');

        // Timeout for initialization
        setTimeout(() => {
          if (!initialized) {
            reject(new Error('Stockfish initialization timeout'));
          }
        }, 10000);

        this.engines.set(engineId, engineWrapper);

      } catch (error) {
        reject(new Error(`Failed to start Stockfish: ${error.message}`));
      }
    });
  }

  // Get best move with configurable difficulty
  async getBestMoveWithDifficulty(fen, difficulty = 'intermediate', timeLimit = 3000) {
    const engineId = `move_${Date.now()}`;
    
    try {
      console.log(`Getting move for difficulty: ${difficulty}, position: ${fen.substring(0, 30)}...`);
      
      const engine = await this.createEngine(engineId);
      
      // Configure difficulty settings
      const difficultySettings = {
        beginner: { skillLevel: 1, depth: 8, hash: 16 },
        intermediate: { skillLevel: 10, depth: 12, hash: 64 },
        advanced: { skillLevel: 15, depth: 16, hash: 128 },
        expert: { skillLevel: 18, depth: 20, hash: 256 },
        maximum: { skillLevel: 20, depth: 25, hash: 512 }
      };

      const settings = difficultySettings[difficulty] || difficultySettings.intermediate;
      
      return new Promise((resolve, reject) => {
        let isComplete = false;
        let startTime = Date.now();

        const timeout = setTimeout(() => {
          if (!isComplete) {
            isComplete = true;
            console.log(`[${engineId}] Move calculation timeout`);
            engine.close();
            reject(new Error('Move calculation timeout'));
          }
        }, timeLimit + 5000);

        const checkForResult = () => {
          if (isComplete) return;
          
          const move = engine.getBestMove();
          if (move && move !== '(none)') {
            isComplete = true;
            clearTimeout(timeout);
            
            const result = {
              bestMove: move,
              evaluation: engine.getEvaluation(),
              principalVariation: engine.getPrincipalVariation(),
              depth: engine.getDepth(),
              timeUsed: Date.now() - startTime,
              difficulty: difficulty,
              skillLevel: settings.skillLevel
            };
            
            console.log(`[${engineId}] Move calculation complete:`, result);
            engine.close();
            resolve(result);
          }
        };

        // Check for result periodically
        const resultChecker = setInterval(() => {
          checkForResult();
          if (isComplete) {
            clearInterval(resultChecker);
          }
        }, 100);

        // Configure engine
        engine.send('ucinewgame');
        engine.send(`setoption name Hash value ${settings.hash}`);
        engine.send(`setoption name Skill Level value ${settings.skillLevel}`);
        engine.send(`setoption name UCI_LimitStrength value false`);
        engine.send(`setoption name MultiPV value 1`);
        engine.send(`position fen ${fen}`);
        engine.send(`go depth ${settings.depth} movetime ${timeLimit}`);

        // Also check immediately in case move is already available
        setTimeout(checkForResult, 500);
      });

    } catch (error) {
      console.error('Error getting best move:', error);
      throw new Error(`Move calculation failed: ${error.message}`);
    }
  }

  // Analyze a chess position
  async analyzePosition(fen, depth = 15, time = 1000) {
    const engineId = `analysis_${Date.now()}`;
    
    try {
      const engine = await this.createEngine(engineId);
      
      return new Promise((resolve, reject) => {
        let analysis = {
          bestMove: '',
          evaluation: null,
          principalVariation: [],
          depth: 0
        };

        let isAnalysisComplete = false;

        const timeout = setTimeout(() => {
          if (!isAnalysisComplete) {
            console.log('Analysis timeout, returning current results');
            isAnalysisComplete = true;
            engine.close();
            resolve(analysis);
          }
        }, time + 2000);

        // Set up response handler
        const handleData = (data) => {
          const lines = data.toString().split('\n');
          
          lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            if (line.startsWith('bestmove') && !isAnalysisComplete) {
              isAnalysisComplete = true;
              clearTimeout(timeout);
              
              analysis.bestMove = line.split(' ')[1];
              analysis.evaluation = engine.getEvaluation();
              analysis.principalVariation = engine.getPrincipalVariation();
              
              console.log('Analysis complete:', analysis);
              engine.close();
              resolve(analysis);
            }

            if (line.includes('depth') && line.includes('score')) {
              const depthMatch = line.match(/depth (\d+)/);
              if (depthMatch) {
                analysis.depth = parseInt(depthMatch[1]);
              }
            }
          });
        };

        // Listen for analysis data
        engine.engine.stdout.on('data', handleData);

        // Start analysis
        engine.send('ucinewgame');
        engine.send(`position fen ${fen}`);
        engine.send(`go depth ${depth} movetime ${time}`);

      });

    } catch (error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  // Get best move for AI coaching
  async getBestMove(fen, skillLevel = 20, depth = 15) {
    const engineId = `coach_${Date.now()}`;
    
    try {
      const engine = await this.createEngine(engineId);
      
      return new Promise((resolve, reject) => {
        let isComplete = false;

        const timeout = setTimeout(() => {
          if (!isComplete) {
            isComplete = true;
            engine.close();
            reject(new Error('Move calculation timeout'));
          }
        }, 10000);

        // Set up response handler
        const handleData = (data) => {
          const lines = data.toString().split('\n');
          
          lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            if (line.startsWith('bestmove') && !isComplete) {
              isComplete = true;
              clearTimeout(timeout);
              
              const bestMove = line.split(' ')[1];
              const result = {
                move: bestMove,
                evaluation: engine.getEvaluation(),
                pv: engine.getPrincipalVariation()
              };
              
              console.log('Best move found:', result);
              engine.close();
              resolve(result);
            }
          });
        };

        // Listen for move data
        engine.engine.stdout.on('data', handleData);

        // Start move calculation
        engine.send('ucinewgame');
        engine.send(`setoption name Skill Level value ${skillLevel}`);
        engine.send(`position fen ${fen}`);
        engine.send(`go depth ${depth}`);

      });

    } catch (error) {
      throw new Error(`Move calculation failed: ${error.message}`);
    }
  }

  // Evaluate multiple moves for coaching feedback
  async evaluateMoves(fen, moves, depth = 12) {
    const results = [];
    
    for (const move of moves) {
      try {
        const engineId = `eval_${Date.now()}_${move}`;
        const engine = await this.createEngine(engineId);
        
        const evaluation = await new Promise((resolve, reject) => {
          let isComplete = false;
          
          const timeout = setTimeout(() => {
            if (!isComplete) {
              isComplete = true;
              engine.close();
              resolve({ move, evaluation: null, error: 'timeout' });
            }
          }, 5000);

          // Set up response handler
          const handleData = (data) => {
            const lines = data.toString().split('\n');
            
            lines.forEach(line => {
              line = line.trim();
              if (!line) return;

              if (line.startsWith('bestmove') && !isComplete) {
                isComplete = true;
                clearTimeout(timeout);
                
                const result = {
                  move,
                  evaluation: engine.getEvaluation(),
                  bestResponse: line.split(' ')[1]
                };
                
                engine.close();
                resolve(result);
              }
            });
          };

          // Listen for evaluation data
          engine.engine.stdout.on('data', handleData);

          // Start evaluation
          engine.send('ucinewgame');
          engine.send(`position fen ${fen} moves ${move}`);
          engine.send(`go depth ${depth}`);
        });

        results.push(evaluation);
        
      } catch (error) {
        results.push({ 
          move, 
          evaluation: null, 
          error: error.message 
        });
      }
    }

    return results;
  }

  // Generate coaching hints
  async generateHint(fen, difficulty = 'medium') {
    try {
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

      return {
        hint: randomHint,
        bestMove: analysis.bestMove,
        evaluation: analysis.evaluation,
        principalVariation: analysis.principalVariation.slice(0, 3)
      };

    } catch (error) {
      return {
        hint: "Consider your options carefully and look for the best move",
        error: error.message
      };
    }
  }

  // Close all engines
  closeAllEngines() {
    console.log('Closing all Stockfish engines');
    this.engines.forEach((engine, id) => {
      try {
        engine.close();
      } catch (error) {
        console.error(`Error closing engine ${id}:`, error);
      }
    });
    this.engines.clear();
  }
}

module.exports = StockfishService;
