import { puzzleService, DailyChallenge } from './puzzleService';

class DailyPuzzleService {
  private dailyPuzzle: DailyChallenge | null = null;
  private loading: boolean = false;
  private error: string | null = null;
  private lastFetchDate: string | null = null;

  // Get today's date string for caching
  private getTodayString(): string {
    return new Date().toISOString().split('T')[0] || '';
  }

  // Check if we need to fetch new daily puzzle
  private shouldFetch(): boolean {
    const today = this.getTodayString();
    return !this.dailyPuzzle || this.lastFetchDate !== today || !!this.error;
  }

  // Fetch daily puzzle from backend
  async getDailyPuzzle(): Promise<DailyChallenge> {
    const today = this.getTodayString();

    // Return cached puzzle if it's still valid for today
    if (!this.shouldFetch() && this.dailyPuzzle) {
      return this.dailyPuzzle;
    }

    // Prevent multiple simultaneous fetches
    if (this.loading) {
      // Wait for current fetch to complete
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (this.dailyPuzzle && this.lastFetchDate === today) {
        return this.dailyPuzzle;
      }
    }

    this.loading = true;
    this.error = null;

    try {
      console.log('Fetching daily puzzle from backend...');
      const puzzle = await puzzleService.getDailyChallenge();
      
      // Ensure the puzzle has all required fields
      if (!puzzle.fen) {
        throw new Error('Daily puzzle missing FEN position');
      }

      this.dailyPuzzle = {
        ...puzzle,
        id: puzzle.id || `daily-${today}`,
        // Ensure we have a proper daily puzzle ID format
        isDailyChallenge: true,
        challengeDate: today
      };
      
      this.lastFetchDate = today;
      console.log('Daily puzzle fetched successfully:', this.dailyPuzzle);
      
      return this.dailyPuzzle;
    } catch (error) {
      console.error('Failed to fetch daily puzzle:', error);
      this.error = error instanceof Error ? error.message : 'Failed to load daily puzzle';
      
      // Return fallback puzzle if backend fails
      const fallbackPuzzle: DailyChallenge = {
        id: `daily-${today}`,
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
      this.lastFetchDate = today;
      
      console.log('Using fallback daily puzzle:', this.dailyPuzzle);
      return this.dailyPuzzle;
    } finally {
      this.loading = false;
    }
  }

  // Get current daily puzzle without fetching (returns null if not loaded)
  getCurrentDailyPuzzle(): DailyChallenge | null {
    const today = this.getTodayString();
    if (this.dailyPuzzle && this.lastFetchDate === today) {
      return this.dailyPuzzle;
    }
    return null;
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
  async refresh(): Promise<DailyChallenge> {
    this.dailyPuzzle = null;
    this.lastFetchDate = null;
    this.error = null;
    return this.getDailyPuzzle();
  }

  // Generate navigation URL for puzzle solver
  getPuzzleSolverUrl(puzzle?: DailyChallenge): string {
    const dailyPuzzle = puzzle || this.dailyPuzzle;
    if (!dailyPuzzle) {
      const today = this.getTodayString();
      return `/puzzle-solver?id=daily-${today}`;
    }

    return `/puzzle-solver?id=${dailyPuzzle.id}`;
  }
}

// Export singleton instance
export const dailyPuzzleService = new DailyPuzzleService();
export default dailyPuzzleService;
