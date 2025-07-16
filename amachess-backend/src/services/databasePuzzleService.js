const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class DatabasePuzzleService {
  constructor() {
    this.isInitialized = false;
    this.availableThemes = null; // Cache for themes
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
    console.log('🎲 getRandomPuzzle called with filters:', JSON.stringify(filters, null, 2));

    try {
      // Build where clause based on filters
      const where = this.buildWhereClause(filters);
      
      // Get total count for random selection
      const totalCount = await prisma.puzzle.count({ where });
      console.log(`📊 Total matching puzzles: ${totalCount}`);
      
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
    console.log('🎨 getAvailableThemes method called');
    await this.initialize();

    try {
      console.log('📝 Fetching themes from database...');
      
      // Get a sample of puzzles to extract themes
      const puzzles = await prisma.puzzle.findMany({
        select: { themes: true },
        take: 5000, // Sample for performance
      });

      console.log(`📋 Retrieved ${puzzles.length} puzzles for theme extraction`);

      const allThemes = new Set();
      puzzles.forEach((puzzle, index) => {
        if (puzzle.themes && Array.isArray(puzzle.themes)) {
          puzzle.themes.forEach(theme => {
            if (theme && typeof theme === 'string') {
              allThemes.add(theme);
            }
          });
        } else {
          if (index < 5) { // Log first few issues
            console.log(`⚠️ Puzzle ${index} has invalid themes:`, puzzle.themes);
          }
        }
      });

      const themesList = Array.from(allThemes).sort();
      console.log('✅ Available themes count:', themesList.length);
      console.log('🎯 Sample themes:', themesList.slice(0, 10));
      
      return themesList;
    } catch (error) {
      console.error('❌ Error getting available themes:', error);
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
    console.log('🔍 buildWhereClause called with filters:', JSON.stringify(filters, null, 2));
    
    const where = {};

    if (filters.minRating || filters.maxRating) {
      where.rating = {};
      if (filters.minRating) where.rating.gte = filters.minRating;
      if (filters.maxRating) where.rating.lte = filters.maxRating;
    }

    if (filters.themes && filters.themes.length > 0) {
      console.log('🎯 Adding theme filter:', filters.themes);
      
      // Available themes from database
      const availableThemes = ["advancedPawn","advantage","anastasiaMate","arabianMate","attackingF2F7","attraction","backRankMate","bishopEndgame","bodenMate","capturingDefender","castling","clearance","crushing","defensiveMove","deflection","discoveredAttack","doubleBishopMate","doubleCheck","dovetailMate","enPassant","endgame","equality","exposedKing","fork","hangingPiece","hookMate","interference","intermezzo","killBoxMate","kingsideAttack","knightEndgame","long","master","masterVsMaster","mate","mateIn1","mateIn2","mateIn3","mateIn4","mateIn5","middlegame","oneMove","opening","pawnEndgame","pin","promotion","queenEndgame","queenRookEndgame","queensideAttack","quietMove","rookEndgame","sacrifice","short","skewer","smotheredMate","superGM","trappedPiece","underPromotion","veryLong","vukovicMate","xRayAttack","zugzwang"];
      
      // Theme mapping from frontend terms to database terms
      const themeMapping = {
        'Double Attack': 'discoveredAttack',
        'Discovery': 'discoveredAttack',
        'Back Rank': 'backRankMate',
        'Mate in one': 'mateIn1',
        'Mate in 1': 'mateIn1',
        'Mate in two': 'mateIn2',
        'Mate in 2': 'mateIn2',
        'Mate in three': 'mateIn3',
        'Mate in 3': 'mateIn3',
        'Endgame': 'endgame',
        'Opening': 'opening',
        'Middlegame': 'middlegame'
      };
      
      const normalizedThemes = filters.themes.map(theme => {
        let normalized = theme.trim();
        
        // Check for direct mapping first
        if (themeMapping[normalized]) {
          normalized = themeMapping[normalized];
          console.log(`🗺️ Theme mapping: "${theme}" -> "${normalized}"`);
          return normalized;
        }
        
        // Handle space-separated themes like "Double Attack" -> "doubleAttack"
        if (normalized.includes(' ')) {
          const words = normalized.split(/\s+/);
          normalized = words[0].toLowerCase() + words.slice(1).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join('');
        } else {
          // For single words, try to find exact match in available themes (case-insensitive)
          const exactMatch = availableThemes.find(dbTheme => 
            dbTheme.toLowerCase() === normalized.toLowerCase()
          );
          if (exactMatch) {
            normalized = exactMatch;
          } else {
            // If no exact match, convert to lowercase for themes like "Fork" -> "fork"
            normalized = normalized.toLowerCase();
          }
        }
        
        console.log(`🔄 Normalizing theme: "${theme}" -> "${normalized}"`);
        return normalized;
      });
      
      console.log('🔧 Normalized themes for database query:', normalizedThemes);
      
      where.themes = {
        hasSome: normalizedThemes
      };
    }

    if (filters.difficulty) {
      // Handle case-insensitive difficulty matching
      const capitalizedDifficulty = filters.difficulty.charAt(0).toUpperCase() + filters.difficulty.slice(1).toLowerCase();
      where.difficulty = capitalizedDifficulty;
    }

    console.log('📝 Final where clause:', JSON.stringify(where, null, 2));
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
