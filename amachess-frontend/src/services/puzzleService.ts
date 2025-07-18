import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export interface LichessPuzzle {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
  gameUrl: string;
  difficulty: string;
  popularity: number;
  solution: string[];
  description: string;
  hint: string;
  // Enhanced fields
  sideToMove: 'white' | 'black';
  userSide?: 'white' | 'black'; // Which side the user is playing in the puzzle
  pgn?: string;
  analysis?: {
    themes: string[];
    sideToMove: 'white' | 'black';
    difficulty: string;
    hint: string;
    description: string;
    moveSequence: string[];
    continuationLength: number;
  };
}

export interface PuzzleFilters {
  minRating?: number;
  maxRating?: number;
  themes?: string[];
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

class PuzzleService {
  async getRandomPuzzle(filters?: PuzzleFilters): Promise<LichessPuzzle> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.minRating) params.append('minRating', filters.minRating.toString());
      if (filters?.maxRating) params.append('maxRating', filters.maxRating.toString());
      if (filters?.themes) params.append('themes', filters.themes.join(','));
      if (filters?.difficulty) params.append('difficulty', filters.difficulty);

      const response = await axios.get(`${API_BASE_URL}/puzzles/random?${params.toString()}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to load puzzle');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error loading random puzzle:', error);
      throw error;
    }
  }

  async getPuzzlesByTheme(theme: string, limit: number = 10): Promise<LichessPuzzle[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/puzzles/theme/${theme}?limit=${limit}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to load puzzles');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error loading puzzles by theme:', error);
      throw error;
    }
  }

  async getAvailableThemes(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/puzzles/themes`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to load themes');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error loading puzzle themes:', error);
      throw error;
    }
  }

  async getPuzzleStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/puzzles/stats`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to load puzzle stats');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error loading puzzle stats:', error);
      throw error;
    }
  }

  async initializePuzzleDatabase() {
    try {
      const response = await axios.post(`${API_BASE_URL}/puzzles/initialize`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to initialize puzzle database');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error initializing puzzle database:', error);
      throw error;
    }
  }

  // Utility function to validate user moves against puzzle solution
  validateMove(userMove: string, expectedMoves: string[], moveIndex: number = 0): boolean {
    if (!expectedMoves || expectedMoves.length === 0) return false;
    if (moveIndex >= expectedMoves.length) return false;
    
    const expectedMove = expectedMoves[moveIndex];
    if (!expectedMove) return false;
    
    // Handle UCI format (e.g., "e2e4") or SAN format (e.g., "e4")
    const normalizedUserMove = this.normalizeMove(userMove);
    const normalizedExpectedMove = this.normalizeMove(expectedMove);
    
    return normalizedUserMove === normalizedExpectedMove;
  }

  private normalizeMove(move: string): string {
    if (!move) return '';
    
    // Remove check/checkmate symbols and extra characters
    let normalized = move.toLowerCase().replace(/[+#!?]/g, '');
    
    // If it's UCI format (4 characters like "e2e4"), keep as is
    if (/^[a-h][1-8][a-h][1-8]$/.test(normalized)) {
      return normalized;
    }
    
    // If it's SAN format, try to extract the source and destination squares
    // This is a simplified approach - for full accuracy, use chess.js
    return normalized;
  }

  // Convert UCI moves to a more readable format for display
  formatMoveForDisplay(uciMove: string): string {
    if (uciMove.length >= 4) {
      const from = uciMove.substring(0, 2);
      const to = uciMove.substring(2, 4);
      const promotion = uciMove.length > 4 ? `=${uciMove.substring(4).toUpperCase()}` : '';
      return `${from}-${to}${promotion}`;
    }
    return uciMove;
  }

  // Convert UCI moves to SAN (Standard Algebraic Notation) for display
  uciToSan(uciMove: string): string {
    // This is a simplified conversion - you might want to use chess.js for proper conversion
    if (uciMove.length < 4) return uciMove;
    
    const from = uciMove.substring(0, 2);
    const to = uciMove.substring(2, 4);
    const promotion = uciMove.length > 4 ? uciMove.substring(4) : '';
    
    return `${from}-${to}${promotion}`;
  }

  // Get difficulty-based rating ranges
  getDifficultyRange(difficulty: string): { min: number; max: number } {
    const ranges = {
      'Beginner': { min: 0, max: 1400 },
      'Intermediate': { min: 1400, max: 1800 },
      'Advanced': { min: 1800, max: 2200 },
      'Expert': { min: 2200, max: 3000 }
    };
    
    return ranges[difficulty as keyof typeof ranges] || { min: 0, max: 3000 };
  }

  async getPuzzleAnalysis(puzzleId: string): Promise<LichessPuzzle> {
    try {
      const response = await axios.get(`${API_BASE_URL}/puzzles/${puzzleId}/analysis`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to load puzzle analysis');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error loading puzzle analysis:', error);
      throw error;
    }
  }
}

export const puzzleService = new PuzzleService();
export default puzzleService;
