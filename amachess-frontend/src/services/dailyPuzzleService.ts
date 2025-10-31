import { puzzleService, DailyChallenge } from './puzzleService';

class DailyPuzzleService {
  private dailyPuzzle: DailyChallenge | null = null;
  private loading: boolean = false;
  private error: string | null = null;
  private lastFetchedPuzzleId: string | null = null;

  // Check if we need to fetch new daily puzzle
  private shouldFetch(puzzleId?: string): boolean {
    if (!this.dailyPuzzle || !!this.error) {
      return true;
    }
    
    // If puzzle ID is provided, check if it's different from cached one
    if (puzzleId) {
      return this.lastFetchedPuzzleId !== puzzleId;
    }
    
    // If no puzzle ID provided, always fetch (fallback behavior)
    return true;
  }

  // Fetch daily puzzle from backend
  async getDailyPuzzle(puzzleId?: string): Promise<DailyChallenge> {
    // Return cached puzzle if it's still valid for the requested puzzle ID
    if (!this.shouldFetch(puzzleId) && this.dailyPuzzle) {
      return this.dailyPuzzle;
    }

    // Prevent multiple simultaneous fetches
    if (this.loading) {
      // Wait for current fetch to complete
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (this.dailyPuzzle && this.lastFetchedPuzzleId === puzzleId) {
        return this.dailyPuzzle;
      }
    }

    this.loading = true;
    this.error = null;

    try {
      console.log('Fetching daily puzzle from backend...', puzzleId ? `with ID: ${puzzleId}` : 'without specific ID');
      const puzzle = await puzzleService.getDailyChallenge(puzzleId);
      
      // Ensure the puzzle has all required fields
      if (!puzzle.fen) {
        throw new Error('Daily puzzle missing FEN position');
      }

      this.dailyPuzzle = {
        ...puzzle,
        isDailyChallenge: true,
        challengeDate: new Date().toISOString().split('T')[0]
      };
      
      this.lastFetchedPuzzleId = puzzleId || puzzle.id || null;
      console.log('Daily puzzle fetched successfully:', this.dailyPuzzle);
      
      return this.dailyPuzzle;
    } catch (error) {
      console.error('Failed to fetch daily puzzle:', error);
      this.error = error instanceof Error ? error.message : 'Failed to load daily puzzle';
      
      // Return fallback puzzle if backend fails
      const today = new Date().toISOString().split('T')[0];
      const fallbackPuzzle: DailyChallenge = {
        id: puzzleId || `daily-${today}`,
        fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4',
        moves: ['Nxe5'],
        solution: ['Nxe5'],
        themes: ['Fork'],
        rating: 1500,
        gameUrl: '',
        difficulty: 'Medium',
        popularity: 85,
        description: 'Find the best move for White in this tactical position.',
        hint: 'Look for a knight fork that attacks multiple pieces.',
        sideToMove: 'white',
        isDailyChallenge: true,
        challengeDate: today
      };
      
      this.dailyPuzzle = fallbackPuzzle;
      this.lastFetchedPuzzleId = puzzleId || fallbackPuzzle.id || '';
      
      console.log('Using fallback daily puzzle:', this.dailyPuzzle);
      return this.dailyPuzzle;
    } finally {
      this.loading = false;
    }
  }

  // Get current daily puzzle without fetching (returns null if not loaded)
  getCurrentDailyPuzzle(): DailyChallenge | null {
    return this.dailyPuzzle;
  }

  // Check if daily puzzle is currently loading
  isLoading(): boolean {
    return this.loading;
  }

  // Get current error state
  getError(): string | null {
    return this.error;
  }

  // Force refresh daily puzzle
  async refresh(puzzleId?: string): Promise<DailyChallenge> {
    this.dailyPuzzle = null;
    this.lastFetchedPuzzleId = null;
    this.error = null;
    return this.getDailyPuzzle(puzzleId);
  }

  // Generate navigation URL for puzzle solver
  getPuzzleSolverUrl(puzzle?: DailyChallenge): string {
    const dailyPuzzle = puzzle || this.dailyPuzzle;
    if (!dailyPuzzle) {
      const today = new Date().toISOString().split('T')[0];
      return `/puzzle-solver?id=daily-${today}`;
    }

    return `/puzzle-solver?id=${dailyPuzzle.id}`;
  }
}

// Export singleton instance
export const dailyPuzzleService = new DailyPuzzleService();
export default dailyPuzzleService;
