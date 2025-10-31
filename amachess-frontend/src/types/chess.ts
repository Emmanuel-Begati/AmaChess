// Chess game types
export type GameDifficulty = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface GameState {
  position: string;
  isGameOver: boolean;
  isPlayerTurn: boolean;
  gameResult?: 'checkmate' | 'stalemate' | 'draw';
  winner?: 'white' | 'black' | 'draw';
  moveHistory: string[];
}

export interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
  piece?: string;
  captured?: string;
  san?: string;
  flags?: string;
}

export interface StockfishEvaluation {
  value: number;
  type: 'centipawn' | 'mate'; // Changed from 'centipawns' to 'centipawn' to match backend
}

export interface StockfishAnalysis {
  bestMove: string;
  evaluation: StockfishEvaluation | null;
  depth: number;
  principalVariation: string[];
  timeUsed?: number;
}

export interface EngineConfiguration {
  skillLevel: number;
  depth: number;
  timeLimit: number;
  hash: number;
  threads: number;
}
