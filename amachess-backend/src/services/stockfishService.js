const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class StockfishService {
  constructor() {
    this.engines = new Map(); // Store multiple engine instances
    this.stockfishPath = this.getStockfishPath();
  }

  getStockfishPath() {
    // Try multiple common Stockfish locations
    const possiblePaths = [
      path.join(__dirname, '../../stockfish/stockfish.exe'),
      path.join(__dirname, '../../stockfish/stockfish'),
      'stockfish', // If in PATH
      'stockfish.exe' // If in PATH on Windows
    ];

    for (const stockfishPath of possiblePaths) {
      if (fs.existsSync(stockfishPath)) {
        return stockfishPath;
      }
    }

    return 'stockfish'; // Fallback to PATH
  }

  // Create a new Stockfish engine instance
  createEngine(engineId = 'default') {
    return new Promise((resolve, reject) => {
      try {
        const engine = spawn(this.stockfishPath);
        
        engine.stdin.setEncoding('utf8');
        engine.stdout.setEncoding('utf8');

        let initialized = false;
        let currentPosition = '';
        let bestMove = '';
        let evaluation = null;
        let principalVariation = [];

        const engineWrapper = {
          engine,
          send: (command) => {
            console.log(`Sending command: ${command}`);
            engine.stdin.write(command + '\n');
          },
          close: () => {
            try {
              engine.stdin.write('quit\n');
              setTimeout(() => engine.kill(), 1000);
            } catch (error) {
              engine.kill();
            }
          },
          getCurrentPosition: () => currentPosition,
          getBestMove: () => bestMove,
          getEvaluation: () => evaluation,
          getPrincipalVariation: () => principalVariation
        };

        engine.stdout.on('data', (data) => {
          const lines = data.toString().split('\n');
          console.log(`Stockfish output: ${data.toString().trim()}`);
          
          lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            if (line.includes('uciok') && !initialized) {
              initialized = true;
              console.log('Stockfish engine initialized successfully');
              resolve(engineWrapper);
            }

            // Parse best move
            if (line.startsWith('bestmove')) {
              bestMove = line.split(' ')[1];
              console.log(`Best move found: ${bestMove}`);
            }

            // Parse evaluation
            if (line.includes('score cp')) {
              const match = line.match(/score cp (-?\d+)/);
              if (match) {
                evaluation = {
                  type: 'centipawn',
                  value: parseInt(match[1])
                };
              }
            }

            // Parse mate score
            if (line.includes('score mate')) {
              const match = line.match(/score mate (-?\d+)/);
              if (match) {
                evaluation = {
                  type: 'mate',
                  value: parseInt(match[1])
                };
              }
            }

            // Parse principal variation
            if (line.includes('pv ')) {
              const pvIndex = line.indexOf('pv ');
              principalVariation = line.substring(pvIndex + 3).trim().split(' ');
            }
          });
        });

        engine.stderr.on('data', (data) => {
          console.error('Stockfish stderr:', data.toString());
        });

        engine.on('close', (code) => {
          console.log(`Stockfish process ${engineId} exited with code ${code}`);
          this.engines.delete(engineId);
        });

        // Initialize UCI protocol
        engine.stdin.write('uci\n');

        this.engines.set(engineId, {
          process: engine,
          initialized: false
        });

      } catch (error) {
        reject(new Error(`Failed to start Stockfish: ${error.message}`));
      }
    });
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
    this.engines.forEach((engine, id) => {
      try {
        engine.process.kill();
      } catch (error) {
        console.error(`Error closing engine ${id}:`, error);
      }
    });
    this.engines.clear();
  }
}

module.exports = StockfishService;
