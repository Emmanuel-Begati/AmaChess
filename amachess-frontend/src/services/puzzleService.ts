import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export interface Puzzle {
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

export interface UserPuzzleStats {
  id: string;
  userId: string;
  totalPuzzlesSolved: number;
  currentPuzzleRating: number;
  bestPuzzleRating: number;
  currentStreak: number;
  bestStreak: number;
  totalTimeSpent: number;
  averageAccuracy: number;
  averageTimePerPuzzle: number;
  favoriteThemes: string;
  weeklyGoal: number;
  weeklyProgress: number;
  monthlyGoal: number;
  monthlyProgress: number;
  lastActiveDate: string;
  createdAt: string;
  updatedAt: string;
  // Enhanced ELO rating system properties
  ratingChange?: number;
  attemptId?: string;
  wasFirstAttempt?: boolean;
  streakReset?: boolean;
}

export interface DailyChallenge extends Puzzle {
  isDailyChallenge: true;
  challengeDate: string;
}

export interface DailyChallengeStats {
  puzzle: DailyChallenge;
  stats: {
    totalAttempts: number;
    solvedAttempts: number;
    successRate: number;
    averageTime: number;
    challengeDate: string;
  };
}

export interface PuzzleGameState {
  pgn: string;
  moveHistory: string[];
  currentFEN: string;
  gamePhase: 'opening' | 'middlegame' | 'endgame';
  playerColor: 'white' | 'black';
}

export class PuzzleGameTracker {
  private gameState: PuzzleGameState;
  
  constructor(initialFEN: string, playerColor: 'white' | 'black') {
    this.gameState = {
      pgn: this.initializePGN(playerColor),
      moveHistory: [],
      currentFEN: initialFEN,
      gamePhase: 'opening',
      playerColor
    };
  }
  
  private initializePGN(playerColor: 'white' | 'black'): string {
    const date = new Date().toISOString().split('T')[0];
    return `[Event "AmaChess Training"]
[Site "AmaChess"]
[Date "${date}"]
[Round "1"]
[White "${playerColor === 'white' ? 'Player' : 'Coach'}"]
[Black "${playerColor === 'black' ? 'Player' : 'Coach'}"]
[Result "*"]

`;
  }
  
  addMove(move: string, moveNumber: number, isWhiteMove: boolean): void {
    this.gameState.moveHistory.push(move);
    
    // Update PGN with proper formatting
    if (isWhiteMove) {
      this.gameState.pgn += `${moveNumber}. ${move} `;
    } else {
      this.gameState.pgn += `${move} `;
    }
    
    // Update game phase based on move count
    this.updateGamePhase();
  }
  
  private updateGamePhase(): void {
    const moveCount = this.gameState.moveHistory.length;
    if (moveCount < 20) {
      this.gameState.gamePhase = 'opening';
    } else if (moveCount < 40) {
      this.gameState.gamePhase = 'middlegame';
    } else {
      this.gameState.gamePhase = 'endgame';
    }
  }
  
  getGameContext(): GameContext {
    return {
      pgn: this.gameState.pgn.trim(),
      moveHistory: [...this.gameState.moveHistory],
      currentFEN: this.gameState.currentFEN,
      gamePhase: this.gameState.gamePhase,
      playerColor: this.gameState.playerColor
    };
  }
  
  updatePosition(fen: string): void {
    this.gameState.currentFEN = fen;
  }
}

class PuzzleService {
  async getPuzzleById(puzzleId: string): Promise<Puzzle> {
    try {
      const response = await axios.get(`${API_BASE_URL}/puzzles/${puzzleId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch puzzle');
      }
    } catch (error) {
      console.error('Error fetching puzzle by ID:', error);
      // Return fallback puzzle if API fails
      if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 500)) {
        console.warn('Puzzle not found or database error, using fallback puzzle');
        return this.getFallbackPuzzle();
      }
      throw error;
    }
  }

  async getRandomPuzzle(filters?: PuzzleFilters, userId?: string): Promise<Puzzle> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.minRating) {
        params.append('minRating', filters.minRating.toString());
      }
      if (filters?.maxRating) {
        params.append('maxRating', filters.maxRating.toString());
      }
      if (filters?.themes && filters.themes.length > 0) {
        params.append('themes', filters.themes.join(','));
      }
      if (filters?.difficulty) {
        params.append('difficulty', filters.difficulty);
      }
      if (userId) {
        params.append('userId', userId);
      }
      
      const response = await axios.get(`${API_BASE_URL}/puzzles/random?${params.toString()}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch puzzle');
      }
    } catch (error) {
      console.error('Error fetching random puzzle:', error);
      // Return fallback puzzle if API fails
      if (axios.isAxiosError(error) && error.response?.status === 500) {
        console.warn('Database error detected, using fallback puzzle');
        return this.getFallbackPuzzle();
      }
      throw error;
    }
  }

  async getPuzzlesByTheme(theme: string, limit: number = 10): Promise<Puzzle[]> {
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

  // User Statistics Methods
  async getUserStats(userId: string): Promise<UserPuzzleStats> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/puzzles/user/${userId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to load user statistics');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error loading user statistics:', error);
      throw error;
    }
  }

  async updateUserStats(userId: string, puzzleData: Puzzle, isCorrect: boolean, timeSpent: number, hintsUsed: number = 0, solutionShown: boolean = false): Promise<UserPuzzleStats> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`${API_BASE_URL}/puzzles/user/${userId}/stats/update`, {
        puzzleData,
        isCorrect,
        timeSpent,
        hintsUsed,
        solutionShown
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to update user statistics');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error updating user statistics:', error);
      throw error;
    }
  }

  // Daily Challenge Methods
  async getDailyChallenge(puzzleId?: string): Promise<DailyChallenge> {
    try {
      const params = new URLSearchParams();
      if (puzzleId) {
        params.append('puzzleId', puzzleId);
      }
      
      const url = `${API_BASE_URL}/puzzles/daily-challenge${params.toString() ? '?' + params.toString() : ''}`;
      const response = await axios.get(url);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to load daily challenge');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error loading daily challenge:', error);
      throw error;
    }
  }

  async getDailyChallengeStats(date?: string): Promise<DailyChallengeStats> {
    try {
      const params = new URLSearchParams();
      if (date) params.append('date', date);
      
      const response = await axios.get(`${API_BASE_URL}/puzzles/daily-challenge/stats?${params.toString()}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to load daily challenge stats');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error loading daily challenge stats:', error);
      throw error;
    }
  }

  async getLeaderboard(limit: number = 10): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/puzzles/leaderboard?limit=${limit}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to load leaderboard');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      throw error;
    }
  }

  async getUserAnalytics(userId: string, days: number = 30): Promise<any> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_BASE_URL}/puzzles/user/${userId}/analytics?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to load user analytics');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error loading user analytics:', error);
      throw error;
    }
  }

  // Utility methods
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

  // Fallback puzzle for when database is empty or unavailable
  getFallbackPuzzle(): Puzzle {
    return {
      id: 'fallback-001',
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4',
      moves: ['Bxf7+', 'Kxf7', 'Ng5+'],
      rating: 1200,
      themes: ['fork', 'tactics'],
      gameUrl: '',
      difficulty: 'Beginner',
      popularity: 85,
      solution: ['Bxf7+', 'Kxf7', 'Ng5+'],
      description: 'Find the best move to win material',
      hint: 'Look for a forcing move that attacks the king',
      sideToMove: 'white',
      userSide: 'white',
      pgn: '',
      analysis: {
        themes: ['fork', 'tactics'],
        sideToMove: 'white',
        difficulty: 'Beginner',
        hint: 'Look for a forcing move that attacks the king',
        description: 'Find the best move to win material',
        moveSequence: ['Bxf7+', 'Kxf7', 'Ng5+'],
        continuationLength: 3
      }
    };
  }
}

export const puzzleService = new PuzzleService();
export default puzzleService;
