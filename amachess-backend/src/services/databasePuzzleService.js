const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class DatabasePuzzleService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Test database connection
      await prisma.$connect();
      console.log('✅ Database puzzle service initialized');
      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize database puzzle service:', error);
      throw error;
    }
  }

  async getRandomPuzzle(filters = {}) {
    await this.initialize();

    try {
      // Build where clause based on filters
      const where = this.buildWhereClause(filters);
      
      // Get total count for random selection
      const totalCount = await prisma.puzzle.count({ where });
      
      if (totalCount === 0) {
        throw new Error('No puzzles found matching the criteria');
      }

      // Get a random puzzle
      const skip = Math.floor(Math.random() * totalCount);
      
      const puzzle = await prisma.puzzle.findFirst({
        where,
        skip,
        include: {
          _count: {
            select: {
              attempts: true,
            }
          }
        }
      });

      if (!puzzle) {
        throw new Error('Failed to retrieve puzzle');
      }

      // Format for frontend consumption
      return this.formatPuzzleForFrontend(puzzle);

    } catch (error) {
      console.error('Error getting random puzzle:', error);
      throw error;
    }
  }

  async getPuzzleById(puzzleId) {
    await this.initialize();

    try {
      const puzzle = await prisma.puzzle.findUnique({
        where: { id: puzzleId },
        include: {
          attempts: {
            select: {
              isCompleted: true,
              isSolved: true,
              timeSpent: true,
              userId: true,
            }
          }
        }
      });

      if (!puzzle) {
        throw new Error('Puzzle not found');
      }

      return this.formatPuzzleForFrontend(puzzle);
    } catch (error) {
      console.error('Error getting puzzle by ID:', error);
      throw error;
    }
  }

  async getPuzzlesByTheme(theme, limit = 10) {
    await this.initialize();

    try {
      const puzzles = await prisma.puzzle.findMany({
        where: {
          themes: {
            has: theme
          }
        },
        take: limit,
        orderBy: {
          rating: 'asc'
        }
      });

      return puzzles.map(puzzle => this.formatPuzzleForFrontend(puzzle));
    } catch (error) {
      console.error('Error getting puzzles by theme:', error);
      throw error;
    }
  }

  async getAvailableThemes() {
    await this.initialize();

    try {
      // Get all unique themes from the database
      const puzzles = await prisma.puzzle.findMany({
        select: { themes: true },
        take: 10000, // Limit for performance
      });

      const allThemes = new Set();
      puzzles.forEach(puzzle => {
        puzzle.themes.forEach(theme => allThemes.add(theme));
      });

      return Array.from(allThemes).sort();
    } catch (error) {
      console.error('Error getting available themes:', error);
      throw error;
    }
  }

  async getPuzzleStats() {
    await this.initialize();

    try {
      const [total, difficultyStats, ratingStats] = await Promise.all([
        prisma.puzzle.count(),
        prisma.puzzle.groupBy({
          by: ['difficulty'],
          _count: true,
        }),
        prisma.puzzle.aggregate({
          _avg: { rating: true },
          _min: { rating: true },
          _max: { rating: true },
        })
      ]);

      return {
        total,
        byDifficulty: Object.fromEntries(
          difficultyStats.map(stat => [stat.difficulty, stat._count])
        ),
        averageRating: Math.round(ratingStats._avg.rating || 0),
        minRating: ratingStats._min.rating || 0,
        maxRating: ratingStats._max.rating || 0,
      };
    } catch (error) {
      console.error('Error getting puzzle stats:', error);
      throw error;
    }
  }

  // User progress tracking methods
  async recordPuzzleAttempt(userId, puzzleId, attemptData) {
    await this.initialize();

    try {
      const attempt = await prisma.puzzleAttempt.create({
        data: {
          userId,
          puzzleId,
          isCompleted: attemptData.isCompleted || false,
          isSolved: attemptData.isSolved || false,
          movesPlayed: attemptData.movesPlayed || [],
          timeSpent: attemptData.timeSpent || 0,
          hintsUsed: attemptData.hintsUsed || 0,
          solutionShown: attemptData.solutionShown || false,
          accuracy: attemptData.accuracy || null,
          completedAt: attemptData.isCompleted ? new Date() : null,
        }
      });

      // Update user stats if puzzle was completed
      if (attemptData.isCompleted) {
        await this.updateUserStats(userId, attemptData);
      }

      return attempt;
    } catch (error) {
      console.error('Error recording puzzle attempt:', error);
      throw error;
    }
  }

  async updateUserStats(userId, attemptData) {
    try {
      const currentStats = await prisma.userStats.findUnique({
        where: { userId }
      });

      if (!currentStats) {
        // Create initial stats
        await prisma.userStats.create({
          data: {
            userId,
            totalPuzzlesSolved: attemptData.isSolved ? 1 : 0,
            currentStreak: attemptData.isSolved ? 1 : 0,
            bestStreak: attemptData.isSolved ? 1 : 0,
            totalTimeSpent: attemptData.timeSpent || 0,
            averageAccuracy: attemptData.accuracy || 0,
            lastActiveDate: new Date(),
          }
        });
      } else {
        // Update existing stats
        const newSolvedCount = currentStats.totalPuzzlesSolved + (attemptData.isSolved ? 1 : 0);
        const newStreak = attemptData.isSolved ? currentStats.currentStreak + 1 : 0;
        const newBestStreak = Math.max(currentStats.bestStreak, newStreak);
        const newTotalTime = currentStats.totalTimeSpent + (attemptData.timeSpent || 0);
        
        await prisma.userStats.update({
          where: { userId },
          data: {
            totalPuzzlesSolved: newSolvedCount,
            currentStreak: newStreak,
            bestStreak: newBestStreak,
            totalTimeSpent: newTotalTime,
            lastActiveDate: new Date(),
          }
        });
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
      // Don't throw error here as it's not critical for puzzle solving
    }
  }

  async getUserStats(userId) {
    await this.initialize();

    try {
      let stats = await prisma.userStats.findUnique({
        where: { userId }
      });

      if (!stats) {
        // Create default stats if they don't exist
        stats = await prisma.userStats.create({
          data: { userId }
        });
      }

      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Helper methods
  buildWhereClause(filters) {
    const where = {};

    if (filters.minRating || filters.maxRating) {
      where.rating = {};
      if (filters.minRating) where.rating.gte = filters.minRating;
      if (filters.maxRating) where.rating.lte = filters.maxRating;
    }

    if (filters.themes && filters.themes.length > 0) {
      where.themes = {
        hasSome: filters.themes
      };
    }

    if (filters.difficulty) {
      // Handle case-insensitive difficulty matching
      const capitalizedDifficulty = filters.difficulty.charAt(0).toUpperCase() + filters.difficulty.slice(1).toLowerCase();
      where.difficulty = capitalizedDifficulty;
    }

    return where;
  }

  formatPuzzleForFrontend(puzzle) {
    return {
      id: puzzle.id,
      lichessId: puzzle.lichessId,
      fen: puzzle.fen,
      moves: puzzle.moves,
      rating: puzzle.rating,
      themes: puzzle.themes,
      gameUrl: puzzle.gameUrl,
      difficulty: puzzle.difficulty,
      popularity: puzzle.popularity,
      solution: puzzle.moves, // For compatibility with frontend
      description: puzzle.description,
      hint: puzzle.hint,
      sideToMove: puzzle.sideToMove,
      userSide: puzzle.sideToMove === 'white' ? 'black' : 'white', // User plays opposite
      // Additional metadata
      totalAttempts: puzzle._count?.attempts || 0,
      openingTags: puzzle.openingTags,
    };
  }

  // Validation method for moves
  validatePuzzleSolution(puzzleId, userMoves) {
    // This would implement move validation logic
    // For now, return a placeholder
    return {
      isCorrect: false,
      feedback: 'Move validation implementation needed',
      nextMove: null
    };
  }
}

module.exports = new DatabasePuzzleService();
