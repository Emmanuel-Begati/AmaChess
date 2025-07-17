import type { GameDifficulty } from '../types/chess';

declare global {
  interface Window {
    Stockfish?: () => any;
  }
}

export class StockfishEngine {
  private engine: any = null;
  private isReady = false;
  private onMoveCallback: ((move: string) => void) | null = null;
  private difficulty: GameDifficulty = 5;

  constructor() {
    this.initializeEngine();
  }

  private async initializeEngine(): Promise<void> {
    try {
      // Try to load Stockfish from CDN if not already loaded
      if (!window.Stockfish) {
        await this.loadStockfish();
      }

      if (window.Stockfish) {
        this.engine = window.Stockfish();
        this.setupEngine();
      } else {
        console.warn('Stockfish not available, using random moves');
        this.isReady = true;
      }
    } catch (error) {
      console.error('Failed to initialize Stockfish engine:', error);
      console.log('Falling back to random move generation');
      this.isReady = true;
    }
  }

  private loadStockfish(): Promise<void> {
    const stockfishUrls = [
      'https://unpkg.com/stockfish@16.0.0/src/stockfish.js',
      'https://cdn.jsdelivr.net/npm/stockfish@16.0.0/src/stockfish.js',
      'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js'
    ];

    return new Promise((resolve, reject) => {
      let currentUrlIndex = 0;

      const tryLoadScript = () => {
        if (currentUrlIndex >= stockfishUrls.length) {
          reject(new Error('All Stockfish CDN sources failed to load'));
          return;
        }

        const script = document.createElement('script');
        script.src = stockfishUrls[currentUrlIndex];
        
        script.onload = () => {
          console.log(`Stockfish loaded from: ${stockfishUrls[currentUrlIndex]}`);
          resolve();
        };
        
        script.onerror = () => {
          console.warn(`Failed to load Stockfish from: ${stockfishUrls[currentUrlIndex]}`);
          document.head.removeChild(script);
          currentUrlIndex++;
          
          // Try next URL after a short delay
          setTimeout(tryLoadScript, 100);
        };

        document.head.appendChild(script);
      };

      tryLoadScript();
    });
  }

  private setupEngine(): void {
    if (!this.engine) return;

    this.engine.addMessageListener((message: string) => {
      console.log('Stockfish:', message);
      
      if (message === 'uciok') {
        this.engine.postMessage('isready');
      } else if (message === 'readyok') {
        this.isReady = true;
        this.setDifficulty(this.difficulty);
      } else if (message.startsWith('bestmove')) {
        const move = message.split(' ')[1];
        if (this.onMoveCallback && move !== '(none)') {
          this.onMoveCallback(move);
        }
      }
    });

    this.engine.postMessage('uci');
  }

  public setDifficulty(level: GameDifficulty): void {
    this.difficulty = level;
    
    if (!this.engine || !this.isReady) return;

    // Configure engine strength based on difficulty level
    const skillLevel = Math.min(level * 2, 20); // Scale 1-10 to 2-20
    const depth = Math.min(level + 5, 15); // Scale 1-10 to 6-15
    
    this.engine.postMessage(`setoption name Skill Level value ${skillLevel}`);
    this.engine.postMessage(`setoption name Depth value ${depth}`);
    
    console.log(`Set Stockfish difficulty: Skill Level ${skillLevel}, Depth ${depth}`);
  }

  public async getBestMove(fen: string, onMove: (move: string) => void): Promise<void> {
    this.onMoveCallback = onMove;

    if (!this.engine || !this.isReady) {
      // Fallback to random legal move
      console.log('Using random move (Stockfish not available)');
      setTimeout(() => {
        if (this.onMoveCallback) {
          this.onMoveCallback('random');
        }
      }, 500 + Math.random() * 1000);
      return;
    }

    try {
      // Set position and request best move
      this.engine.postMessage(`position fen ${fen}`);
      
      // Calculate search time based on difficulty
      const thinkTime = Math.min(this.difficulty * 100 + 200, 2000); // 300ms to 2s
      this.engine.postMessage(`go movetime ${thinkTime}`);
      
    } catch (error) {
      console.error('Error getting best move:', error);
      if (this.onMoveCallback) {
        this.onMoveCallback('random');
      }
    }
  }

  public stop(): void {
    if (this.engine) {
      this.engine.postMessage('quit');
    }
  }
}

export interface StockfishEvaluation {
  type: 'centipawn' | 'mate';
  value: number;
}

export interface StockfishMove {
  move: string;
  evaluation: StockfishEvaluation | null;
  principalVariation: string[];
  depth: number;
  calculationTime: number;
  difficulty?: string;
  skillLevel?: number;
}

export interface StockfishAnalysis {
  bestMove: string;
  evaluation: StockfishEvaluation | null;
  principalVariation: string[];
  depth: number;
  fen: string;
}

export interface CoachingResponse {
  suggestedMove: string;
  evaluation: StockfishEvaluation | null;
  principalVariation: string[];
  skillLevel: number;
  explanation: string;
}

export interface MoveEvaluation {
  playerMove: string;
  playerEvaluation: StockfishEvaluation | null;
  bestMove: string;
  bestEvaluation: StockfishEvaluation | null;
  quality: {
    rating: number;
    description: string;
  };
  feedback: string;
  improvement: string | null;
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'maximum';

class StockfishAPI {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3002/api/stockfish') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get the best move from Stockfish with configurable difficulty
   */
  async getBestMove(fen: string, difficulty: DifficultyLevel = 'intermediate', timeLimit: number = 3000): Promise<StockfishMove> {
    try {
      const response = await fetch(`${this.baseUrl}/play/move-difficulty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen,
          difficulty,
          timeLimit
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get move from Stockfish');
      }

      return {
        move: data.bestMove,
        evaluation: data.evaluation,
        principalVariation: data.game.principalVariation || [],
        depth: data.game.depth || 0,
        calculationTime: data.game.calculationTime || 0,
        difficulty: data.game.difficulty,
        skillLevel: data.game.skillLevel
      };
    } catch (error) {
      console.error('Error getting best move:', error);
      throw new Error(`Failed to get move: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze a chess position
   */
  async analyzePosition(fen: string, depth: number = 15, time: number = 2000): Promise<StockfishAnalysis> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen,
          depth,
          time
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze position');
      }

      return data.analysis;
    } catch (error) {
      console.error('Error analyzing position:', error);
      throw new Error(`Failed to analyze: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get coaching suggestion for a position
   */
  async getCoachingSuggestion(fen: string, skillLevel: number = 15, depth: number = 12): Promise<CoachingResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/coach/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen,
          skillLevel,
          depth
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get coaching suggestion');
      }

      return data.coaching;
    } catch (error) {
      console.error('Error getting coaching suggestion:', error);
      throw new Error(`Failed to get suggestion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Evaluate a player's move compared to the best move
   */
  async evaluateMove(fen: string, playerMove: string, depth: number = 12): Promise<MoveEvaluation> {
    try {
      const response = await fetch(`${this.baseUrl}/coach/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen,
          playerMove,
          depth
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to evaluate move');
      }

      return data.evaluation;
    } catch (error) {
      console.error('Error evaluating move:', error);
      throw new Error(`Failed to evaluate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a hint for the current position
   */
  async getHint(fen: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): Promise<{ message: string; level: string; hasMove: boolean; evaluation: StockfishEvaluation | null }> {
    try {
      const response = await fetch(`${this.baseUrl}/coach/hint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen,
          difficulty
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get hint');
      }

      return data.hint;
    } catch (error) {
      console.error('Error getting hint:', error);
      throw new Error(`Failed to get hint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if Stockfish service is available
   */
  async checkHealth(): Promise<{ status: string; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'error',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Test Stockfish installation
   */
  async testStockfish(): Promise<{ status: string; message: string; testResult?: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/test`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Stockfish test failed:', error);
      return {
        status: 'error',
        message: `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Start a new game against Stockfish
   */
  async startNewGame(playerColor: 'white' | 'black' = 'white', difficulty: DifficultyLevel = 'maximum'): Promise<{
    id: string;
    startingFen: string;
    playerColor: string;
    difficulty: string;
    stockfishMove: string | null;
    created: string;
    status: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/play/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerColor,
          difficulty
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to start new game');
      }

      return data.game;
    } catch (error) {
      console.error('Error starting new game:', error);
      throw new Error(`Failed to start game: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Evaluate the current position for advantage assessment
   */
  async evaluatePosition(fen: string, depth: number = 15): Promise<{
    position: string;
    bestMove: string;
    evaluation: StockfishEvaluation | null;
    principalVariation: string[];
    depth: number;
    mate: boolean;
    advantage: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/play/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fen,
          depth
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to evaluate position');
      }

      return data.evaluation;
    } catch (error) {
      console.error('Error evaluating position:', error);
      throw new Error(`Failed to evaluate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Create and export a singleton instance
export const stockfishAPI = new StockfishAPI();

// Export utility functions
export const formatEvaluation = (evaluation: StockfishEvaluation | null): string => {
  if (!evaluation) return '0.00';
  
  if (evaluation.type === 'mate') {
    return evaluation.value > 0 ? `+M${evaluation.value}` : `-M${Math.abs(evaluation.value)}`;
  }
  
  const pawns = evaluation.value / 100;
  return pawns >= 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2);
};

export const getEvaluationColor = (evaluation: StockfishEvaluation | null): 'white' | 'black' | 'neutral' => {
  if (!evaluation) return 'neutral';
  
  if (evaluation.type === 'mate') {
    return evaluation.value > 0 ? 'white' : 'black';
  }
  
  if (evaluation.value > 50) return 'white';
  if (evaluation.value < -50) return 'black';
  return 'neutral';
};

export const getDifficultyDescription = (difficulty: DifficultyLevel): string => {
  const descriptions = {
    beginner: 'Beginner (800 Elo)',
    intermediate: 'Intermediate (1500 Elo)',
    advanced: 'Advanced (2000 Elo)',
    expert: 'Expert (2500 Elo)',
    maximum: 'Maximum Level (3200+ Elo)'
  };
  
  return descriptions[difficulty] || descriptions.intermediate;
};

export default stockfishAPI;
