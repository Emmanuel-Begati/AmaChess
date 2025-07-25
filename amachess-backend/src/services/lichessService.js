const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class LichessService {
  constructor() {
    this.baseURL = 'https://lichess.org/api';
    this.token = process.env.LICHESS_API_TOKEN;
    this.gameCache = new Map(); // In-memory cache for PGN data
    this.cacheDir = path.join(__dirname, '../../cache');
    this.initializeCache();
  }

  // Validate the API token
  isValidToken() {
    return this.token && 
           this.token !== 'YOUR_ACTUAL_LICHESS_TOKEN_HERE' && 
           this.token.startsWith('lip_') && 
           this.token.length > 10;
  }

  async initializeCache() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('Error creating cache directory:', error);
    }
  }

  /**
   * Fetch games for a specific user from Lichess API in PGN format
   * @param {string} username - Lichess username
   * @param {object} options - Query parameters for the API
   * @returns {Promise<string>} PGN data as string
   */
  async getLichessGamesPGN(username, options = {}) {
    if (!this.token) {
      throw new Error('Lichess API token is required. Please set LICHESS_API_TOKEN in your .env file');
    }

    if (!username) {
      throw new Error('Username is required');
    }

    // Check cache first
    const cacheKey = `${username}_pgn_${JSON.stringify(options)}`;
    const cachedData = this.gameCache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < 300000) { // 5 minutes cache
      console.log(`Cache hit for PGN data for user: ${username}`);
      return cachedData.pgn;
    }

    try {
      const config = {
        method: 'GET',
        url: `${this.baseURL}/games/user/${username}`,
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/x-chess-pgn',
          'User-Agent': 'AmaChess-Backend/1.0.0'
        },
        params: {
          max: options.max || 10,
          rated: options.rated || 'true',
          format: 'pgn',
          sort: 'dateDesc',
          ...options
        },
        timeout: 30000 // 30 seconds timeout
      };

      console.log(`Fetching PGN games for user: ${username}`);
      const response = await axios(config);

      if (response.status === 200) {
        const pgnData = response.data;
        
        // Cache the result
        this.gameCache.set(cacheKey, {
          pgn: pgnData,
          timestamp: Date.now()
        });

        // Also save to file cache
        await this.savePGNToFile(username, pgnData, options);

        console.log(`Successfully fetched ${this.countGames(pgnData)} PGN games for user: ${username}`);
        return pgnData;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response.data || error.message;
        
        switch (statusCode) {
          case 404:
            throw new Error(`User '${username}' not found`);
          case 429:
            throw new Error('Rate limit exceeded. Please try again later');
          case 401:
            throw new Error('Invalid API token');
          case 403:
            throw new Error('Access forbidden. Check your API token permissions');
          default:
            throw new Error(`Lichess API error (${statusCode}): ${errorMessage}`);
        }
      } else if (error.request) {
        throw new Error('No response from Lichess API. Please check your internet connection');
      } else {
        throw new Error(`Request setup error: ${error.message}`);
      }
    }
  }

  /**
   * Save PGN data to file for persistent storage
   * @param {string} username - Lichess username
   * @param {string} pgnData - PGN data to save
   * @param {object} options - Options used for the request
   */
  async savePGNToFile(username, pgnData, options) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${username}_${timestamp}.pgn`;
      const filePath = path.join(this.cacheDir, filename);
      
      const metadata = `; Generated by AmaChess Backend
; Username: ${username}
; Generated: ${new Date().toISOString()}
; Options: ${JSON.stringify(options)}
; Games count: ${this.countGames(pgnData)}

`;
      
      await fs.writeFile(filePath, metadata + pgnData);
      console.log(`PGN data saved to: ${filePath}`);
    } catch (error) {
      console.error('Error saving PGN to file:', error);
      // Don't throw here - file saving is optional
    }
  }

  /**
   * Count the number of games in PGN data
   * @param {string} pgnData - PGN data
   * @returns {number} Number of games
   */
  countGames(pgnData) {
    if (!pgnData) return 0;
    return (pgnData.match(/\[Event "/g) || []).length;
  }

  /**
   * Get cached PGN files for a user
   * @param {string} username - Lichess username
   * @returns {Promise<Array>} Array of cached file info
   */
  async getCachedFiles(username) {
    try {
      const files = await fs.readdir(this.cacheDir);
      const userFiles = files.filter(file => file.startsWith(username) && file.endsWith('.pgn'));
      
      const fileInfo = await Promise.all(
        userFiles.map(async (file) => {
          const filePath = path.join(this.cacheDir, file);
          const stats = await fs.stat(filePath);
          return {
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
      );

      return fileInfo.sort((a, b) => b.modified - a.modified);
    } catch (error) {
      console.error('Error reading cached files:', error);
      return [];
    }
  }

  /**
   * Clear cache for a specific user or all cache
   * @param {string} username - Optional username to clear specific cache
   */
  clearCache(username = null) {
    if (username) {
      // Clear memory cache for specific user
      const keysToDelete = [];
      for (const key of this.gameCache.keys()) {
        if (key.startsWith(username)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.gameCache.delete(key));
      console.log(`Cache cleared for user: ${username}`);
    } else {
      // Clear all memory cache
      this.gameCache.clear();
      console.log('All cache cleared');
    }
  }

  /**
   * Get API status and rate limit information
   * @returns {Promise<object>} API status information
   */
  async getAPIStatus() {
    try {
      const response = await axios.get(`${this.baseURL}/account`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'User-Agent': 'AmaChess-Backend/1.0.0'
        },
        timeout: 10000
      });

      return {
        status: 'connected',
        rateLimitRemaining: response.headers['x-ratelimit-remaining'],
        rateLimitReset: response.headers['x-ratelimit-reset'],
        user: response.data
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  // Get user's games from Lichess
  async getUserGames(username, maxGames = 50) {
    try {
      const response = await axios.get(`${this.baseURL}/games/user/${username}`, {
        params: {
          max: maxGames,
          rated: true,
          moves: true,
          evals: true,
          accuracy: true,
          opening: true,
          clocks: true,
          sort: 'dateDesc'
        },
        headers: {
          'Accept': 'application/x-ndjson'
        },
        responseType: 'text'
      });

      // Parse NDJSON response
      const games = response.data
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));

      return games;
    } catch (error) {
      console.error('Error fetching Lichess games:', error);
      throw new Error('Failed to fetch games from Lichess');
    }
  }

  // Get user statistics from Lichess API
  async getUserStats(username) {
    try {
      // Always use public endpoint for user stats (no authentication required)
      console.log(`Fetching stats for user: ${username}`);

      // Get user profile data (public endpoint, no auth required)
      const profileResponse = await axios.get(`${this.baseURL}/user/${username}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'AmaChess-Backend/1.0.0'
        }
      });

      const profile = profileResponse.data;
      
      // Get recent games to calculate additional stats
      let recentGames = [];
      try {
        recentGames = await this.getUserGames(username, 20);
      } catch (gamesError) {
        console.warn('Could not fetch recent games:', gamesError.message);
        // Continue without recent games data
      }
      
      // Calculate win rate from profile data (more accurate than from recent games)
      const totalWins = profile.count?.win || 0;
      const totalLosses = profile.count?.loss || 0;
      const totalDraws = profile.count?.draw || 0;
      const totalGames = totalWins + totalLosses + totalDraws;
      const winRate = totalGames > 0 ? totalWins / totalGames : 0;

      // Calculate statistics
      const stats = {
        username: profile.username,
        rating: {
          rapid: profile.perfs?.rapid?.rating || null,
          blitz: profile.perfs?.blitz?.rating || null,
          bullet: profile.perfs?.bullet?.rating || null,
          classical: profile.perfs?.classical?.rating || null,
          puzzle: profile.perfs?.puzzle?.rating || null
        },
        gameCount: {
          rapid: profile.count?.rated || 0,
          blitz: profile.perfs?.blitz?.games || 0,
          bullet: profile.perfs?.bullet?.games || 0,
          classical: profile.perfs?.classical?.games || 0,
          total: profile.count?.all || 0
        },
        winRate: winRate,
        online: profile.online || false,
        title: profile.title || null,
        patron: profile.patron || false,
        verified: profile.verified || false,
        playTime: profile.playTime?.total || 0,
        createdAt: profile.createdAt,
        language: profile.language || 'en',
        country: profile.profile?.country || null
      };

      return stats;
    } catch (error) {
      console.error('Error fetching user stats from Lichess:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Lichess user not found');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid Lichess API token. Please update your token in the .env file.');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded');
      } else {
        throw new Error('Failed to fetch user statistics from Lichess');
      }
    }
  }

  // Analyze multiple games
  async analyzeBulkGames(games, username) {
    const analysis = {
      gamesAnalyzed: games.length,
      timeRange: this.getTimeRange(games),
      overallAccuracy: this.calculateOverallAccuracy(games, username),
      averageRating: this.calculateAverageRating(games, username),
      ratingProgress: this.calculateRatingProgress(games, username),
      totalBlunders: this.countMoveTypes(games, 'blunder'),
      totalMistakes: this.countMoveTypes(games, 'mistake'),
      totalInaccuracies: this.countMoveTypes(games, 'inaccuracy'),
      winRate: this.calculateWinRate(games, username),
      drawRate: this.calculateDrawRate(games),
      lossRate: this.calculateLossRate(games, username),
      openingPerformance: this.analyzeOpenings(games, username),
      timeControlAnalysis: this.analyzeTimeControls(games, username),
      phaseAnalysis: this.analyzeGamePhases(games),
      tacticalThemes: this.analyzeTacticalThemes(games),
      timeManagement: this.analyzeTimeManagement(games),
      opponentAnalysis: this.analyzeOpponentStrength(games, username),
      improvementAreas: this.identifyImprovementAreas(games),
      trends: this.analyzeTrends(games),
      keyGamesForReview: this.identifyKeyGames(games)
    };

    return analysis;
  }

  calculateOverallAccuracy(games, username) {
    const accuracies = games
      .filter(game => game.accuracy)
      .map(game => {
        const userColor = this.getUserColor(game, username);
        return game.accuracy[userColor];
      })
      .filter(acc => acc !== undefined);

    return accuracies.length > 0 
      ? accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length 
      : 0;
  }

  calculateAverageRating(games, username) {
    const ratings = games.map(game => {
      const userColor = this.getUserColor(game, username);
      return game.players[userColor].rating;
    }).filter(rating => rating);

    return ratings.length > 0 
      ? Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length)
      : 0;
  }

  calculateRatingProgress(games, username) {
    if (games.length < 2) return 0;
    
    const sortedGames = games.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const firstGame = sortedGames[0];
    const lastGame = sortedGames[sortedGames.length - 1];
    
    const userColor = this.getUserColor(firstGame, username);
    const startRating = firstGame.players[userColor].rating;
    const endRating = lastGame.players[userColor].rating;
    
    return endRating - startRating;
  }

  countMoveTypes(games, moveType) {
    return games.reduce((count, game) => {
      if (!game.analysis) return count;
      
      return count + game.analysis.filter(move => 
        move.judgment && move.judgment.name === moveType
      ).length;
    }, 0);
  }

  calculateWinRate(games, username) {
    const wins = games.filter(game => {
      const userColor = this.getUserColor(game, username);
      return game.winner === userColor;
    }).length;
    
    return games.length > 0 ? wins / games.length : 0;
  }

  calculateDrawRate(games) {
    const draws = games.filter(game => game.status === 'draw').length;
    return games.length > 0 ? draws / games.length : 0;
  }

  calculateLossRate(games, username) {
    const losses = games.filter(game => {
      const userColor = this.getUserColor(game, username);
      return game.winner && game.winner !== userColor;
    }).length;
    
    return games.length > 0 ? losses / games.length : 0;
  }

  analyzeOpenings(games, username) {
    const openingStats = {};
    
    games.forEach(game => {
      if (!game.opening) return;
      
      const opening = game.opening.name;
      const userColor = this.getUserColor(game, username);
      const isWin = game.winner === userColor;
      const accuracy = game.accuracy ? game.accuracy[userColor] : null;
      
      if (!openingStats[opening]) {
        openingStats[opening] = {
          name: opening,
          games: 0,
          wins: 0,
          accuracySum: 0,
          accuracyCount: 0
        };
      }
      
      openingStats[opening].games++;
      if (isWin) openingStats[opening].wins++;
      if (accuracy) {
        openingStats[opening].accuracySum += accuracy;
        openingStats[opening].accuracyCount++;
      }
    });

    // Convert to final format
    const openings = Object.values(openingStats).map(opening => ({
      name: opening.name,
      games: opening.games,
      winRate: opening.wins / opening.games,
      avgAccuracy: opening.accuracyCount > 0 
        ? opening.accuracySum / opening.accuracyCount 
        : 0
    }));

    return {
      mostPlayed: openings.sort((a, b) => b.games - a.games).slice(0, 3),
      bestPerforming: openings.filter(o => o.games >= 3).sort((a, b) => b.winRate - a.winRate).slice(0, 2),
      worstPerforming: openings.filter(o => o.games >= 3).sort((a, b) => a.winRate - b.winRate).slice(0, 1)
    };
  }

  analyzeTimeControls(games, username) {
    const timeControls = {
      blitz: { games: 0, wins: 0, accuracySum: 0, accuracyCount: 0 },
      rapid: { games: 0, wins: 0, accuracySum: 0, accuracyCount: 0 },
      classical: { games: 0, wins: 0, accuracySum: 0, accuracyCount: 0 }
    };

    games.forEach(game => {
      const speed = this.categorizeTimeControl(game.speed);
      const userColor = this.getUserColor(game, username);
      const isWin = game.winner === userColor;
      const accuracy = game.accuracy ? game.accuracy[userColor] : null;

      if (timeControls[speed]) {
        timeControls[speed].games++;
        if (isWin) timeControls[speed].wins++;
        if (accuracy) {
          timeControls[speed].accuracySum += accuracy;
          timeControls[speed].accuracyCount++;
        }
      }
    });

    // Convert to final format
    Object.keys(timeControls).forEach(speed => {
      const tc = timeControls[speed];
      tc.winRate = tc.games > 0 ? tc.wins / tc.games : 0;
      tc.avgAccuracy = tc.accuracyCount > 0 ? tc.accuracySum / tc.accuracyCount : 0;
    });

    return timeControls;
  }

  /**
   * Categorize a time control into standard categories
   * @param {string} speed - The game speed from Lichess
   * @returns {string} Categorized time control
   */
  categorizeTimeControl(speed) {
    switch (speed) {
      case 'ultraBullet':
      case 'bullet':
        return 'bullet';
      case 'blitz':
        return 'blitz';
      case 'rapid':
        return 'rapid';
      case 'classical':
      case 'correspondence':
        return 'classical';
      default:
        return 'rapid'; // default fallback
    }
  }

  getUserColor(game, username) {
    // Determine user color based on the username
    if (game.players.white.user?.name === username) {
      return 'white';
    } else if (game.players.black.user?.name === username) {
      return 'black';
    }
    // Fallback to white if username not found
    return 'white';
  }

  analyzeGamePhases(games) {
    // Simplified phase analysis - in a real implementation,
    // you'd analyze move-by-move data
    return {
      opening: {
        avgAccuracy: 88.7,
        commonMistakes: ["Premature piece development", "Ignoring center control"],
        improvement: "Focus on controlling the center before developing minor pieces"
      },
      middlegame: {
        avgAccuracy: 81.4,
        commonMistakes: ["Missing tactical opportunities", "Poor piece coordination"],
        improvement: "Practice tactical puzzles and study piece coordination patterns"
      },
      endgame: {
        avgAccuracy: 85.9,
        commonMistakes: ["King activity", "Pawn promotion timing"],
        improvement: "Study basic endgame principles and king-pawn endgames"
      }
    };
  }

  analyzeTacticalThemes(games) {
    // This would require deep analysis of game positions
    // For now, return mock data
    return [
      { theme: "Pin", frequency: 23, successRate: 0.65 },
      { theme: "Fork", frequency: 18, successRate: 0.72 },
      { theme: "Discovered Attack", frequency: 12, successRate: 0.58 },
      { theme: "Back Rank Mate", frequency: 8, successRate: 0.75 },
      { theme: "Deflection", frequency: 15, successRate: 0.60 }
    ];
  }

  analyzeTimeManagement(games) {
    // Analyze clock usage patterns
    return {
      averageTimePerMove: 24.5,
      timePressureGames: games.filter(game => {
        // Check if user had less than 30 seconds at any point
        return false; // Simplified
      }).length,
      timePressureWinRate: 0.44,
      recommendation: "Practice faster decision-making in familiar positions"
    };
  }

  analyzeOpponentStrength(games, username) {
    const userRating = this.calculateAverageRating(games, username);
    
    const categories = {
      vsHigherRated: { games: 0, wins: 0, ratingDiffs: [] },
      vsSimilarRated: { games: 0, wins: 0, ratingDiffs: [] },
      vsLowerRated: { games: 0, wins: 0, ratingDiffs: [] }
    };

    games.forEach(game => {
      const userColor = this.getUserColor(game, username);
      const opponentColor = userColor === 'white' ? 'black' : 'white';
      const opponentRating = game.players[opponentColor].rating;
      const userGameRating = game.players[userColor].rating;
      const ratingDiff = opponentRating - userGameRating;
      const isWin = game.winner === userColor;

      let category;
      if (ratingDiff > 50) {
        category = 'vsHigherRated';
      } else if (ratingDiff < -50) {
        category = 'vsLowerRated';
      } else {
        category = 'vsSimilarRated';
      }

      categories[category].games++;
      if (isWin) categories[category].wins++;
      categories[category].ratingDiffs.push(ratingDiff);
    });

    // Calculate final stats
    Object.keys(categories).forEach(category => {
      const cat = categories[category];
      cat.winRate = cat.games > 0 ? cat.wins / cat.games : 0;
      cat.avgRatingDiff = cat.ratingDiffs.length > 0 
        ? Math.round(cat.ratingDiffs.reduce((sum, diff) => sum + diff, 0) / cat.ratingDiffs.length)
        : 0;
    });

    return categories;
  }

  identifyImprovementAreas(games) {
    // AI-based improvement identification would go here
    return [
      {
        area: "Middlegame Tactics",
        priority: "High",
        description: "Missing 2-3 move tactical sequences",
        recommendation: "Practice 15-20 tactical puzzles daily, focus on pins and forks",
        estimatedGain: "+50 rating points"
      },
      {
        area: "Time Management",
        priority: "Medium",
        description: "Getting into time pressure in 36% of games",
        recommendation: "Practice blitz games and use increment time controls",
        estimatedGain: "+30 rating points"
      }
    ];
  }

  analyzeTrends(games) {
    // Analyze performance trends over time
    return {
      last10Games: { winRate: 0.70, avgAccuracy: 86.2 },
      monthlyProgress: [
        { month: "Nov", rating: 1464, accuracy: 82.1 },
        { month: "Dec", rating: 1475, accuracy: 83.8 },
        { month: "Jan", rating: 1487, accuracy: 84.2 }
      ]
    };
  }

  identifyKeyGames(games) {
    // Identify games with important learning opportunities
    return [
      {
        gameId: games[0]?.id || "game_001",
        opponent: "StrongPlayer1",
        result: "Loss",
        date: "2024-01-15",
        reason: "Missed winning combination on move 23",
        lessonType: "Tactical awareness"
      }
    ];
  }

  getTimeRange(games) {
    if (games.length === 0) return "No games";
    
    const dates = games.map(game => new Date(game.createdAt)).sort();
    const oldest = dates[0];
    const newest = dates[dates.length - 1];
    
    const diffTime = Math.abs(newest - oldest);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 30) return "Last 30 days";
    if (diffDays <= 90) return "Last 3 months";
    return "Last 6 months";
  }

  /**
   * Get rating analytics for a user including rating history, peak rating, and percentile data
   * @param {string} username - Lichess username
   * @returns {Promise<object>} Rating analytics object
   */
  async getUserRatingAnalytics(username) {
    try {
      console.log(`Fetching rating analytics for user: ${username}`);

      // Get rating history
      const historyResponse = await axios.get(`${this.baseURL}/user/${username}/rating-history`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'AmaChess-Backend/1.0.0'
        }
      });

      const ratingHistory = historyResponse.data;

      // Get performance statistics for main game types
      const perfTypes = ['rapid', 'blitz', 'bullet', 'classical'];
      const perfStats = {};

      for (const perfType of perfTypes) {
        try {
          const perfResponse = await axios.get(`${this.baseURL}/user/${username}/perf/${perfType}`, {
            timeout: 10000,
            headers: {
              'User-Agent': 'AmaChess-Backend/1.0.0'
            }
          });
          perfStats[perfType] = perfResponse.data;
        } catch (perfError) {
          console.warn(`Could not fetch ${perfType} performance for ${username}:`, perfError.message);
          perfStats[perfType] = null;
        }
      }

      // Process rating history to find peak ratings and calculate 30-day changes
      const analytics = this.processRatingAnalytics(ratingHistory, perfStats);

      console.log(`✅ Successfully fetched rating analytics for: ${username}`);
      return analytics;

    } catch (error) {
      console.error('Error fetching Lichess rating analytics:', error);
      
      if (error.response?.status === 404) {
        throw new Error('Lichess user not found');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded');
      } else {
        throw new Error('Failed to fetch rating analytics from Lichess');
      }
    }
  }

  /**
   * Process rating history data to extract analytics
   * @param {Array} ratingHistory - Rating history from Lichess API
   * @param {Object} perfStats - Performance statistics for each game type
   * @returns {Object} Processed analytics
   */
  processRatingAnalytics(ratingHistory, perfStats) {
    const analytics = {
      peakRatings: {},
      thirtyDayChanges: {},
      percentiles: {},
      ratingTrends: {}
    };

    // Process each game type's rating history
    ratingHistory.forEach(perfHistory => {
      const perfName = perfHistory.name.toLowerCase().replace(/[^a-z]/g, '');
      const points = perfHistory.points || [];

      if (points.length === 0) return;

      // Find peak rating
      let peakRating = 0;
      points.forEach(point => {
        if (point[3] > peakRating) {
          peakRating = point[3];
        }
      });

      analytics.peakRatings[perfName] = peakRating;

      // Calculate 30-day change (approximate)
      if (points.length > 1) {
        const currentRating = points[points.length - 1][3];
        
        // Find a point approximately 30 days ago
        const currentDate = new Date();
        const thirtyDaysAgo = new Date(currentDate.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        let closestPoint = points[0];
        points.forEach(point => {
          const pointDate = new Date(point[0], point[1], point[2]);
          const thirtyDaysAgoDistance = Math.abs(pointDate.getTime() - thirtyDaysAgo.getTime());
          const currentClosestDistance = Math.abs(new Date(closestPoint[0], closestPoint[1], closestPoint[2]).getTime() - thirtyDaysAgo.getTime());
          
          if (thirtyDaysAgoDistance < currentClosestDistance) {
            closestPoint = point;
          }
        });

        const thirtyDayChange = currentRating - closestPoint[3];
        analytics.thirtyDayChanges[perfName] = thirtyDayChange;
      } else {
        analytics.thirtyDayChanges[perfName] = 0;
      }

      // Get percentile from performance stats
      const perfKey = this.mapPerfNameToKey(perfName);
      if (perfStats[perfKey] && perfStats[perfKey].percentile) {
        analytics.percentiles[perfName] = Math.round(perfStats[perfKey].percentile);
      }
    });

    return analytics;
  }

  /**
   * Map performance name to API key
   * @param {string} perfName - Performance name from rating history
   * @returns {string} Performance key for API calls
   */
  mapPerfNameToKey(perfName) {
    const mapping = {
      'bullet': 'bullet',
      'blitz': 'blitz',
      'rapid': 'rapid',
      'classical': 'classical',
      'correspondence': 'correspondence',
      'ultrabullet': 'ultraBullet',
      'kingofthehill': 'kingOfTheHill',
      'threecheck': 'threeCheck',
      'antichess': 'antichess',
      'atomic': 'atomic',
      'horde': 'horde',
      'racingkings': 'racingKings',
      'crazyhouse': 'crazyhouse',
      'chess960': 'chess960',
      'puzzles': 'puzzle'
    };
    
    return mapping[perfName] || perfName;
  }

  // Get user's recent rapid games from Lichess
  async getRecentRapidGames(username, maxGames = 5) {
    try {
      const response = await axios.get(`${this.baseURL}/games/user/${username}`, {
        params: {
          max: 20, // Get more to filter for rapid games
          rated: true,
          moves: false,
          opening: true,
          clocks: true,
          sort: 'dateDesc',
          perfType: 'rapid' // Filter for rapid games only
        },
        headers: {
          'Accept': 'application/x-ndjson'
        },
        responseType: 'text'
      });

      // Parse NDJSON response
      const games = response.data
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line))
        .filter(game => game.perf === 'rapid') // Ensure only rapid games
        .slice(0, maxGames); // Take only the requested number

      // Format games for the dashboard
      return games.map(game => {
        const isWhite = game.players.white.user?.name?.toLowerCase() === username.toLowerCase();
        const opponent = isWhite 
          ? (game.players.black.user?.name || 'Anonymous')
          : (game.players.white.user?.name || 'Anonymous');
        
        let result = 'draw';
        if (game.winner) {
          result = (game.winner === 'white' && isWhite) || (game.winner === 'black' && !isWhite) ? 'win' : 'loss';
        }

        const playerData = isWhite ? game.players.white : game.players.black;
        const ratingChange = playerData.ratingDiff || 0;

        return {
          id: game.id,
          platform: 'lichess',
          opponent,
          result,
          ratingChange: ratingChange > 0 ? `+${ratingChange}` : ratingChange.toString(),
          timeControl: `${Math.floor(game.clock?.initial / 60)}+${game.clock?.increment || 0}`,
          opening: game.opening?.name || 'Unknown',
          date: new Date(game.createdAt).toISOString().split('T')[0],
          url: `https://lichess.org/${game.id}`
        };
      });

    } catch (error) {
      console.error('Error fetching Lichess rapid games:', error);
      return [];
    }
  }

  /**
   * Get user's basic progress statistics
   * @param {string} username - Lichess username
   * @returns {Promise<object>} Progress statistics object
   */
  async getUserProgressStats(username) {
    try {
      console.log(`Fetching Lichess progress stats for user: ${username}`);

      // Get user stats first
      const stats = await this.getUserStats(username);

      // Get recent games for analysis
      const games = await this.getUserGames(username, 100);

      // Analyze the games to get progress statistics
      const bulkAnalysis = await this.analyzeBulkGames(games, username);

      const progressStats = {
        totalGames: stats.gameCount.total,
        overallWinRate: stats.winRate,
        timeControlBreakdown: {},
        strengthAreas: [],
        improvementAreas: []
      };

      // Calculate win/loss/draw breakdown by time control
      const gameTypes = ['rapid', 'blitz', 'bullet', 'classical'];
      
      gameTypes.forEach(gameType => {
        if (stats.gameCount[gameType] > 0) {
          const timeControlGames = games.filter(game => 
            this.categorizeTimeControl(game.speed) === gameType || game.perf === gameType
          );

          const wins = timeControlGames.filter(game => {
            const userColor = this.getUserColor(game, username);
            return game.winner === userColor;
          }).length;

          const losses = timeControlGames.filter(game => {
            const userColor = this.getUserColor(game, username);
            return game.winner && game.winner !== userColor;
          }).length;

          const draws = timeControlGames.filter(game => !game.winner).length;
          const total = wins + losses + draws;

          if (total > 0) {
            progressStats.timeControlBreakdown[gameType] = {
              wins,
              losses,
              draws,
              total,
              winRate: total > 0 ? wins / total : 0,
              drawRate: total > 0 ? draws / total : 0,
              currentRating: stats.rating[gameType] || null
            };
          }
        }
      });

      // Analyze strengths and improvement areas
      Object.keys(progressStats.timeControlBreakdown).forEach(timeControl => {
        const breakdown = progressStats.timeControlBreakdown[timeControl];
        
        if (breakdown.winRate >= 0.6) {
          progressStats.strengthAreas.push(`Strong ${timeControl} performance (${Math.round(breakdown.winRate * 100)}% win rate)`);
        } else if (breakdown.winRate < 0.4 && breakdown.total >= 10) {
          progressStats.improvementAreas.push(`${timeControl.charAt(0).toUpperCase() + timeControl.slice(1)} needs improvement (${Math.round(breakdown.winRate * 100)}% win rate)`);
        }
      });

      // Add puzzle rating analysis if available
      if (stats.rating.puzzle) {
        if (stats.rating.puzzle >= 2000) {
          progressStats.strengthAreas.push(`Excellent tactical skills (${stats.rating.puzzle} puzzle rating)`);
        } else if (stats.rating.puzzle < 1500) {
          progressStats.improvementAreas.push('Tactical training recommended (puzzle rating below 1500)');
        }
      }

      // Add analysis-based insights if we have analyzed games
      if (bulkAnalysis && games.length > 0) {
        // Overall accuracy insight
        if (bulkAnalysis.overallAccuracy >= 85) {
          progressStats.strengthAreas.push(`High accuracy play (${Math.round(bulkAnalysis.overallAccuracy)}% average)`);
        } else if (bulkAnalysis.overallAccuracy < 75) {
          progressStats.improvementAreas.push(`Focus on accuracy improvement (${Math.round(bulkAnalysis.overallAccuracy)}% average)`);
        }

        // Time management
        if (bulkAnalysis.timeManagement && bulkAnalysis.timeManagement.timePressureGames > games.length * 0.3) {
          progressStats.improvementAreas.push('Time management needs attention (frequent time pressure)');
        }

        // Opening performance
        if (bulkAnalysis.openingPerformance && bulkAnalysis.openingPerformance.bestPerforming.length > 0) {
          const bestOpening = bulkAnalysis.openingPerformance.bestPerforming[0];
          if (bestOpening.winRate >= 0.7) {
            progressStats.strengthAreas.push(`Excellent with ${bestOpening.name} (${Math.round(bestOpening.winRate * 100)}% win rate)`);
          }
        }
      }

      // Add general insights based on game volume and ratings
      if (progressStats.totalGames >= 1000) {
        progressStats.strengthAreas.push('Experienced player (1000+ games)');
      } else if (progressStats.totalGames >= 100) {
        progressStats.strengthAreas.push('Active player (100+ games)');
      }

      console.log(`✅ Successfully calculated Lichess progress stats for: ${username}`);
      return progressStats;

    } catch (error) {
      console.error('Error fetching Lichess progress stats:', error);
      throw error;
    }
  }
}

module.exports = LichessService;
