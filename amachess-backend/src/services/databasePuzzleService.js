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

  async getRandomPuzzle(filters = {}, userId = null) {
    await this.initialize();
    
    try {
      console.log('🎲 Getting random puzzle with filters:', filters, 'for user:', userId);
      
      // If userId provided, get user's rating for adaptive difficulty
      if (userId && !filters.minRating && !filters.maxRating) {
        try {
          const userStats = await this.getUserStats(userId);
          const userRating = userStats.currentPuzzleRating;
          const ratingRange = 200; // ±200 rating points
          
          filters.minRating = Math.max(600, userRating - ratingRange);
          filters.maxRating = Math.min(3000, userRating + ratingRange);
          
          console.log(`🎯 Adaptive difficulty: User rating ${userRating}, puzzle range ${filters.minRating}-${filters.maxRating}`);
        } catch (error) {
          console.warn('⚠️ Could not get user stats for adaptive difficulty:', error.message);
          // Continue without rating-based filtering
        }
      }
      
      // Build where clause based on filters
      const where = this.buildWhereClause(filters);
      
      // Get total count of puzzles matching criteria
      const totalCount = await prisma.puzzle.count({ where });
      
      if (totalCount === 0) {
        const totalPuzzles = await prisma.puzzle.count();
        if (totalPuzzles === 0) {
          throw new Error('No puzzles found in database. Please seed the database with puzzles first.');
        } else {
          // If no puzzles in user's rating range, expand the range
          if (userId && filters.minRating && filters.maxRating) {
            console.log('🔄 No puzzles in rating range, expanding search...');
            delete filters.minRating;
            delete filters.maxRating;
            return this.getRandomPuzzle(filters, null); // Retry without rating filter
          }
          throw new Error(`No puzzles found matching criteria. Total puzzles in database: ${totalPuzzles}`);
        }
      }
      
      console.log(`📊 Found ${totalCount} puzzles matching criteria`);
      
      // Generate random offset
      const randomOffset = Math.floor(Math.random() * totalCount);
      
      // Get random puzzle
      const puzzle = await prisma.puzzle.findFirst({
        where,
        skip: randomOffset,
        include: {
          _count: {
            select: {
              attempts: true,
            }
          }
        }
      });
      
      if (!puzzle) {
        throw new Error('Failed to retrieve random puzzle');
      }
      
      console.log(`🧩 Selected puzzle: ${puzzle.lichessId} (rating: ${puzzle.rating}, difficulty: ${puzzle.difficulty})`);
      
      return this.formatPuzzleForFrontend(puzzle);
    } catch (error) {
      console.error('❌ Error getting random puzzle:', error);
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
        if (puzzle.themes) {
          try {
            // Parse JSON string to get array of themes
            const themesArray = typeof puzzle.themes === 'string' 
              ? JSON.parse(puzzle.themes) 
              : puzzle.themes;
            
            if (Array.isArray(themesArray)) {
              themesArray.forEach(theme => {
                if (theme && typeof theme === 'string') {
                  allThemes.add(theme);
                }
              });
            }
          } catch (error) {
            if (index < 5) { // Log first few parsing issues
              console.log(`⚠️ Puzzle ${index} has invalid themes JSON:`, puzzle.themes);
            }
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
      
      // Since themes are stored as JSON strings, we need to use contains with OR logic
      where.OR = normalizedThemes.map(theme => ({
        themes: {
          contains: `"${theme}"`
        }
      }));
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
    // Helper function to safely parse JSON strings
    const safeJsonParse = (jsonString, fallback = []) => {
      try {
        return typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString || fallback;
      } catch (error) {
        console.warn('Failed to parse JSON:', jsonString, error);
        return fallback;
      }
    };

    const moves = safeJsonParse(puzzle.moves, []);
    const themes = safeJsonParse(puzzle.themes, []);
    const openingTags = safeJsonParse(puzzle.openingTags, []);

    return {
      id: puzzle.id,
      lichessId: puzzle.lichessId,
      fen: puzzle.fen,
      moves: moves,
      rating: puzzle.rating,
      themes: themes,
      gameUrl: puzzle.gameUrl,
      difficulty: puzzle.difficulty,
      popularity: puzzle.popularity,
      solution: moves, // For compatibility with frontend
      description: puzzle.description,
      hint: puzzle.hint,
      sideToMove: puzzle.sideToMove,
      userSide: puzzle.sideToMove === 'white' ? 'black' : 'white', // User plays opposite
      // Additional metadata
      totalAttempts: puzzle._count?.attempts || 0,
      openingTags: openingTags,
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

  // Get or create user statistics
  async getUserStats(userId) {
    await this.initialize();
    
    try {
      let userStats = await prisma.userStats.findUnique({
        where: { userId }
      });
      
      if (!userStats) {
        userStats = await prisma.userStats.create({
          data: {
            userId,
            favoriteThemes: JSON.stringify([]),
            totalPuzzlesSolved: 0,
            currentPuzzleRating: 1200,
            bestPuzzleRating: 1200,
            currentStreak: 0,
            bestStreak: 0,
            totalTimeSpent: 0,
            averageAccuracy: 0.0,
            averageTimePerPuzzle: 0.0,
            weeklyGoal: 50,
            weeklyProgress: 0,
            monthlyGoal: 200,
            monthlyProgress: 0
          }
        });
      }
      
      return userStats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  // Calculate ELO rating change based on puzzle difficulty and result
  calculateEloRatingChange(userRating, puzzleRating, solved, timeSpent = 0) {
    const K = 32; // ELO K-factor (higher = more volatile rating changes)
    
    // Calculate expected score (probability of solving)
    const expected = 1 / (1 + Math.pow(10, (puzzleRating - userRating) / 400));
    
    // Actual score (1 for solved, 0 for failed)
    const actual = solved ? 1 : 0;
    
    // Basic ELO calculation
    let ratingChange = K * (actual - expected);
    
    // Time bonus/penalty (optional enhancement)
    if (solved && timeSpent > 0) {
      // Bonus for solving quickly (under 30 seconds)
      if (timeSpent < 30) {
        ratingChange *= 1.1; // 10% bonus
      }
      // Penalty for taking too long (over 5 minutes)
      else if (timeSpent > 300) {
        ratingChange *= 0.9; // 10% penalty
      }
    }
    
    return Math.round(ratingChange);
  }

  // Update user statistics after puzzle completion with ELO rating
  async updateUserStatsAfterPuzzle(userId, puzzleData, isCorrect, timeSpent = 0, hintsUsed = 0, solutionShown = false) {
    await this.initialize();
    
    try {
      console.log(`📊 Updating stats for user ${userId}: puzzle ${puzzleData.id}, correct: ${isCorrect}, time: ${timeSpent}s`);
      
      // Get current user stats
      const userStats = await this.getUserStats(userId);
      const puzzleRating = puzzleData.rating || 1500;
      
      // Calculate ELO rating change
      const ratingChange = this.calculateEloRatingChange(
        userStats.currentPuzzleRating,
        puzzleRating,
        isCorrect,
        timeSpent
      );
      
      const newRating = Math.max(600, userStats.currentPuzzleRating + ratingChange); // Minimum rating of 600
      
      console.log(`🎯 Rating change: ${userStats.currentPuzzleRating} + ${ratingChange} = ${newRating}`);
      
      // Save puzzle attempt to database
      const puzzleAttempt = await prisma.puzzleAttempt.create({
        data: {
          userId,
          puzzleId: puzzleData.id,
          isCompleted: true,
          isSolved: isCorrect,
          movesPlayed: JSON.stringify([]), // Could be enhanced to track actual moves
          timeSpent: Math.round(timeSpent),
          hintsUsed: hintsUsed,
          solutionShown: solutionShown,
          accuracy: isCorrect ? 100 : 0, // Could be more nuanced
          completedAt: new Date()
        }
      });
      
      console.log(`💾 Saved puzzle attempt: ${puzzleAttempt.id}`);
      
      // Calculate updated statistics
      const newTotalSolved = userStats.totalPuzzlesSolved + (isCorrect ? 1 : 0);
      const newCurrentStreak = isCorrect ? userStats.currentStreak + 1 : 0;
      const newBestStreak = Math.max(userStats.bestStreak, newCurrentStreak);
      const newTotalTime = userStats.totalTimeSpent + Math.round(timeSpent);
      
      // Get updated accuracy from all attempts
      const totalAttempts = await prisma.puzzleAttempt.count({ where: { userId } });
      const correctAttempts = await prisma.puzzleAttempt.count({ 
        where: { userId, isSolved: true } 
      });
      const newAccuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
      
      // Update user statistics
      const updatedStats = await prisma.userStats.update({
        where: { userId },
        data: {
          totalPuzzlesSolved: newTotalSolved,
          currentPuzzleRating: newRating,
          bestPuzzleRating: Math.max(userStats.bestPuzzleRating, newRating),
          currentStreak: newCurrentStreak,
          bestStreak: newBestStreak,
          totalTimeSpent: newTotalTime,
          averageAccuracy: Math.round(newAccuracy * 100) / 100, // Round to 2 decimal places
          averageTimePerPuzzle: Math.round((newTotalTime / Math.max(totalAttempts, 1)) * 100) / 100,
          lastActiveDate: new Date()
        }
      });
      
      console.log(`✅ Updated user stats: solved ${newTotalSolved}, rating ${newRating}, accuracy ${newAccuracy.toFixed(1)}%`);
      
      return {
        ...updatedStats,
        ratingChange: ratingChange,
        attemptId: puzzleAttempt.id
      };
    } catch (error) {
      console.error('❌ Error updating user stats:', error);
      throw error;
    }
  }

  // Get puzzle rating leaderboard
  async getLeaderboard(limit = 10) {
    await this.initialize();
    
    try {
      const leaderboard = await prisma.userStats.findMany({
        where: {
          totalPuzzlesSolved: {
            gt: 0 // Only users who have solved at least one puzzle
          }
        },
        orderBy: [
          { currentPuzzleRating: 'desc' },
          { totalPuzzlesSolved: 'desc' },
          { bestStreak: 'desc' }
        ],
        take: limit,
        select: {
          userId: true,
          totalPuzzlesSolved: true,
          currentPuzzleRating: true,
          bestPuzzleRating: true,
          currentStreak: true,
          bestStreak: true,
          averageAccuracy: true,
          lastActiveDate: true
        }
      });
      
      // Format leaderboard data with rankings
      const formattedLeaderboard = leaderboard.map((user, index) => ({
        rank: index + 1,
        userId: user.userId,
        username: user.userId, // In a real app, you'd join with User table for actual username
        rating: user.currentPuzzleRating,
        puzzlesSolved: user.totalPuzzlesSolved,
        bestStreak: user.bestStreak,
        accuracy: Math.round(user.averageAccuracy * 100) / 100, // Round to 2 decimal places
        lastActive: user.lastActiveDate
      }));
      
      return formattedLeaderboard;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  // Get user performance analytics
  async getUserAnalytics(userId, days = 7) {
    await this.initialize();
    
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Get puzzle attempts for the specified period
      const attempts = await prisma.puzzleAttempt.findMany({
        where: {
          userId,
          completedAt: {
            gte: startDate
          }
        },
        include: {
          puzzle: {
            select: {
              themes: true,
              rating: true,
              difficulty: true
            }
          }
        },
        orderBy: {
          completedAt: 'asc'
        }
      });
      
      // Generate daily progress data
      const dailyProgress = [];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        
        const dayAttempts = attempts.filter(attempt => {
          const attemptDate = new Date(attempt.completedAt);
          return attemptDate >= dayStart && attemptDate <= dayEnd;
        });
        
        const solved = dayAttempts.filter(a => a.isSolved).length;
        const total = dayAttempts.length;
        const accuracy = total > 0 ? Math.round((solved / total) * 100) : 0;
        
        dailyProgress.push({
          day: dayNames[date.getDay()],
          solved,
          accuracy
        });
      }
      
      // Analyze themes performance
      const themeStats = {};
      attempts.forEach(attempt => {
        if (attempt.puzzle && attempt.puzzle.themes) {
          const themes = typeof attempt.puzzle.themes === 'string' 
            ? JSON.parse(attempt.puzzle.themes) 
            : attempt.puzzle.themes;
          
          themes.forEach(theme => {
            if (!themeStats[theme]) {
              themeStats[theme] = { total: 0, solved: 0 };
            }
            themeStats[theme].total++;
            if (attempt.isSolved) {
              themeStats[theme].solved++;
            }
          });
        }
      });
      
      const themePerformance = Object.entries(themeStats)
        .map(([theme, stats]) => ({
          theme,
          accuracy: Math.round((stats.solved / stats.total) * 100),
          attempts: stats.total
        }))
        .sort((a, b) => b.attempts - a.attempts)
        .slice(0, 10); // Top 10 most practiced themes
      
      // Calculate difficulty distribution
      const difficultyStats = {
        Beginner: { total: 0, solved: 0 },
        Intermediate: { total: 0, solved: 0 },
        Advanced: { total: 0, solved: 0 },
        Expert: { total: 0, solved: 0 }
      };
      
      attempts.forEach(attempt => {
        if (attempt.puzzle && attempt.puzzle.difficulty) {
          const difficulty = attempt.puzzle.difficulty;
          if (difficultyStats[difficulty]) {
            difficultyStats[difficulty].total++;
            if (attempt.isSolved) {
              difficultyStats[difficulty].solved++;
            }
          }
        }
      });
      
      const difficultyPerformance = Object.entries(difficultyStats)
        .map(([difficulty, stats]) => ({
          difficulty,
          accuracy: stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0,
          attempts: stats.total
        }));
      
      // Generate rating history (placeholder - could be enhanced with actual historical data)
      const currentRating = await this.getUserStats(userId).then(stats => stats.currentPuzzleRating).catch(() => 1200);
      const ratingHistory = [
        { month: 'Jan', rating: Math.max(1200, currentRating - 100) },
        { month: 'Feb', rating: Math.max(1200, currentRating - 80) },
        { month: 'Mar', rating: Math.max(1200, currentRating - 60) },
        { month: 'Apr', rating: Math.max(1200, currentRating - 40) },
        { month: 'May', rating: Math.max(1200, currentRating - 20) },
        { month: 'Jun', rating: currentRating }
      ];
      
      return {
        weeklyProgress: dailyProgress,
        themePerformance,
        difficultyPerformance,
        ratingHistory,
        totalAttempts: attempts.length,
        totalSolved: attempts.filter(a => a.isSolved).length,
        overallAccuracy: attempts.length > 0 
          ? Math.round((attempts.filter(a => a.isSolved).length / attempts.length) * 100) 
          : 0
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw error;
    }
  }

  // Get daily challenge puzzle (same for all users)
  async getDailyChallenge() {
    await this.initialize();
    
    try {
      // Generate a consistent seed based on current date
      const today = new Date();
      const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
      const seed = dateString.split('-').reduce((acc, val) => acc + parseInt(val), 0);
      
      // Get total puzzle count
      const totalCount = await prisma.puzzle.count();
      
      if (totalCount === 0) {
        throw new Error('No puzzles available for daily challenge');
      }
      
      // Use seed to get consistent puzzle index for the day
      const puzzleIndex = seed % totalCount;
      
      const puzzle = await prisma.puzzle.findFirst({
        skip: puzzleIndex,
        include: {
          _count: {
            select: {
              attempts: true,
            }
          }
        }
      });
      
      if (!puzzle) {
        throw new Error('Failed to retrieve daily challenge puzzle');
      }
      
      return {
        ...this.formatPuzzleForFrontend(puzzle),
        isDailyChallenge: true,
        challengeDate: dateString
      };
    } catch (error) {
      console.error('Error getting daily challenge:', error);
      throw error;
    }
  }

  // Get daily challenge statistics
  async getDailyChallengeStats(challengeDate = null) {
    await this.initialize();
    
    try {
      const today = challengeDate || new Date().toISOString().split('T')[0];
      const startOfDay = new Date(today + 'T00:00:00.000Z');
      const endOfDay = new Date(today + 'T23:59:59.999Z');
      
      // Get daily challenge puzzle
      const dailyPuzzle = await this.getDailyChallenge();
      
      // Get statistics for this puzzle today
      const totalAttempts = await prisma.puzzleAttempt.count({
        where: {
          puzzleId: dailyPuzzle.id,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });
      
      const solvedAttempts = await prisma.puzzleAttempt.count({
        where: {
          puzzleId: dailyPuzzle.id,
          isSolved: true,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        }
      });
      
      const averageTime = await prisma.puzzleAttempt.aggregate({
        where: {
          puzzleId: dailyPuzzle.id,
          isSolved: true,
          createdAt: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        _avg: {
          timeSpent: true
        }
      });
      
      return {
        puzzle: dailyPuzzle,
        stats: {
          totalAttempts,
          solvedAttempts,
          successRate: totalAttempts > 0 ? (solvedAttempts / totalAttempts) * 100 : 0,
          averageTime: Math.round(averageTime._avg.timeSpent || 0),
          challengeDate: today
        }
      };
    } catch (error) {
      console.error('Error getting daily challenge stats:', error);
      throw error;
    }
  }
}

module.exports = new DatabasePuzzleService();
