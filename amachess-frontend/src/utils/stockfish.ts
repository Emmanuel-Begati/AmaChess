import type { GameDifficulty } from '../types/chess';

declare global {
  interface Window {
    Stockfish?: () => any;
  }
}

export class StockfishEngine {
  private isReady = false;
  private onMoveCallback: ((move: string) => void) | null = null;
  private difficulty: GameDifficulty = 5;
  private apiService: StockfishAPI;

  constructor() {
    this.apiService = new StockfishAPI();
    this.initializeEngine();
  }

  private async initializeEngine(): Promise<void> {
    try {
      // Test API connection
      const health = await this.apiService.checkHealth();
      if (health.status === 'healthy' || health.status === 'ok') {
        this.isReady = true;
        console.log('Stockfish API service initialized successfully');
      } else {
        console.warn('Stockfish API not available, using fallback');
        this.isReady = true;
      }
    } catch (error) {
      console.error('Failed to initialize Stockfish API:', error);
      console.log('Using fallback mode');
      this.isReady = true;
    }
  }

  private mapDifficultyToLevel(level: GameDifficulty): DifficultyLevel {
    if (level <= 2) return 'beginner';
    if (level <= 4) return 'intermediate';
    if (level <= 6) return 'advanced';
    if (level <= 8) return 'expert';
    return 'maximum';
  }

  public setDifficulty(level: GameDifficulty): void {
    this.difficulty = level;
    console.log(`Set Stockfish difficulty level: ${level} (${this.mapDifficultyToLevel(level)})`);
  }

  public async getBestMove(fen: string, onMove: (move: string) => void): Promise<void> {
    this.onMoveCallback = onMove;

    if (!this.isReady) {
      // Fallback to random legal move
      console.log('Using random move (Stockfish API not available)');
      setTimeout(() => {
        if (this.onMoveCallback) {
          this.onMoveCallback('random');
        }
      }, 500 + Math.random() * 1000);
      return;
    }

    try {
      const difficultyLevel = this.mapDifficultyToLevel(this.difficulty);
      const timeLimit = Math.min(this.difficulty * 300 + 500, 3000); // 800ms to 3s
      
      const result = await this.apiService.getBestMove(fen, difficultyLevel, timeLimit);
      
      if (this.onMoveCallback && result.move && result.move !== '(none)') {
        this.onMoveCallback(result.move);
      } else if (this.onMoveCallback) {
        this.onMoveCallback('random');
      }
      
    } catch (error) {
      console.error('Error getting best move from API:', error);
      if (this.onMoveCallback) {
        this.onMoveCallback('random');
      }
    }
  }

  public stop(): void {
    // No cleanup needed for API-based service
    console.log('Stockfish API service stopped');
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

  constructor(baseUrl: string = 'http://localhost:3001/api/stockfish') {
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

      if (response.status === 429) {
        // Handle throttling gracefully
        const errorData = await response.json();
        console.log('Analysis throttled, retrying after delay...');
        
        // Wait for the suggested retry time, then try again
        const retryAfter = errorData.retryAfter || 1000;
        await new Promise(resolve => setTimeout(resolve, retryAfter));
        
        // Retry once
        const retryResponse = await fetch(`${this.baseUrl}/play/evaluate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fen,
            depth
          }),
        });
        
        if (!retryResponse.ok) {
          throw new Error(`HTTP error after retry! status: ${retryResponse.status}`);
        }
        
        const retryData = await retryResponse.json();
        if (!retryData.success) {
          throw new Error(retryData.error || 'Failed to evaluate position after retry');
        }
        
        return retryData.evaluation;
      }

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
