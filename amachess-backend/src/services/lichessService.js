const axios = require('axios');

class LichessService {
  constructor() {
    this.baseURL = 'https://lichess.org/api';
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

  // Analyze multiple games
  async analyzeBulkGames(games) {
    const analysis = {
      gamesAnalyzed: games.length,
      timeRange: this.getTimeRange(games),
      overallAccuracy: this.calculateOverallAccuracy(games),
      averageRating: this.calculateAverageRating(games),
      ratingProgress: this.calculateRatingProgress(games),
      totalBlunders: this.countMoveTypes(games, 'blunder'),
      totalMistakes: this.countMoveTypes(games, 'mistake'),
      totalInaccuracies: this.countMoveTypes(games, 'inaccuracy'),
      winRate: this.calculateWinRate(games),
      drawRate: this.calculateDrawRate(games),
      lossRate: this.calculateLossRate(games),
      openingPerformance: this.analyzeOpenings(games),
      timeControlAnalysis: this.analyzeTimeControls(games),
      phaseAnalysis: this.analyzeGamePhases(games),
      tacticalThemes: this.analyzeTacticalThemes(games),
      timeManagement: this.analyzeTimeManagement(games),
      opponentAnalysis: this.analyzeOpponentStrength(games),
      improvementAreas: this.identifyImprovementAreas(games),
      trends: this.analyzeTrends(games),
      keyGamesForReview: this.identifyKeyGames(games)
    };

    return analysis;
  }

  calculateOverallAccuracy(games) {
    const accuracies = games
      .filter(game => game.accuracy)
      .map(game => {
        const userColor = this.getUserColor(game);
        return game.accuracy[userColor];
      })
      .filter(acc => acc !== undefined);

    return accuracies.length > 0 
      ? accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length 
      : 0;
  }

  calculateAverageRating(games) {
    const ratings = games.map(game => {
      const userColor = this.getUserColor(game);
      return game.players[userColor].rating;
    }).filter(rating => rating);

    return ratings.length > 0 
      ? Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length)
      : 0;
  }

  calculateRatingProgress(games) {
    if (games.length < 2) return 0;
    
    const sortedGames = games.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const firstGame = sortedGames[0];
    const lastGame = sortedGames[sortedGames.length - 1];
    
    const userColor = this.getUserColor(firstGame);
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

  calculateWinRate(games) {
    const wins = games.filter(game => {
      const userColor = this.getUserColor(game);
      return game.winner === userColor;
    }).length;
    
    return games.length > 0 ? wins / games.length : 0;
  }

  calculateDrawRate(games) {
    const draws = games.filter(game => game.status === 'draw').length;
    return games.length > 0 ? draws / games.length : 0;
  }

  calculateLossRate(games) {
    const losses = games.filter(game => {
      const userColor = this.getUserColor(game);
      return game.winner && game.winner !== userColor;
    }).length;
    
    return games.length > 0 ? losses / games.length : 0;
  }

  analyzeOpenings(games) {
    const openingStats = {};
    
    games.forEach(game => {
      if (!game.opening) return;
      
      const opening = game.opening.name;
      const userColor = this.getUserColor(game);
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

  analyzeTimeControls(games) {
    const timeControls = {
      blitz: { games: 0, wins: 0, accuracySum: 0, accuracyCount: 0 },
      rapid: { games: 0, wins: 0, accuracySum: 0, accuracyCount: 0 },
      classical: { games: 0, wins: 0, accuracySum: 0, accuracyCount: 0 }
    };

    games.forEach(game => {
      const speed = this.categorizeTimeControl(game.speed);
      const userColor = this.getUserColor(game);
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

  categorizeTimeControl(speed) {
    switch (speed) {
      case 'ultraBullet':
      case 'bullet':
      case 'blitz':
        return 'blitz';
      case 'rapid':
        return 'rapid';
      case 'classical':
      case 'correspondence':
        return 'classical';
      default:
        return 'blitz';
    }
  }

  getUserColor(game) {
    // This should be determined based on the authenticated user
    // For now, we'll assume white, but this needs to be properly implemented
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

  analyzeOpponentStrength(games) {
    const userRating = this.calculateAverageRating(games);
    
    const categories = {
      vsHigherRated: { games: 0, wins: 0, ratingDiffs: [] },
      vsSimilarRated: { games: 0, wins: 0, ratingDiffs: [] },
      vsLowerRated: { games: 0, wins: 0, ratingDiffs: [] }
    };

    games.forEach(game => {
      const userColor = this.getUserColor(game);
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
}

module.exports = new LichessService();
