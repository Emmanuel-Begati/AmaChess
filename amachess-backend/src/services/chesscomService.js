const axios = require('axios');

class ChesscomService {
  constructor() {
    this.baseURL = 'https://api.chess.com/pub';
    // Chess.com API is public, no authentication required
  }

  /**
   * Get user statistics from Chess.com API
   * @param {string} username - Chess.com username
   * @returns {Promise<object>} User statistics object
   */
  async getUserStats(username) {
    try {
      // Chess.com usernames are case-sensitive and typically lowercase
      const normalizedUsername = username.toLowerCase();
      console.log(`Fetching Chess.com stats for user: ${normalizedUsername}`);

      // Get user profile data
      const profileResponse = await axios.get(`${this.baseURL}/player/${normalizedUsername}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'AmaChess-Backend/1.0.0'
        }
      });

      const profile = profileResponse.data;

      // Get user stats data
      const statsResponse = await axios.get(`${this.baseURL}/player/${normalizedUsername}/stats`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'AmaChess-Backend/1.0.0'
        }
      });

      const playerStats = statsResponse.data;

      // Get online status
      let isOnline = false;
      try {
        const onlineResponse = await axios.get(`${this.baseURL}/player/${normalizedUsername}/is-online`, {
          timeout: 5000,
          headers: {
            'User-Agent': 'AmaChess-Backend/1.0.0'
          }
        });
        isOnline = onlineResponse.data.online || false;
      } catch (onlineError) {
        console.warn('Could not fetch online status:', onlineError.message);
      }

      // Extract ratings from different game types
      const ratings = {
        rapid: playerStats.chess_rapid?.last?.rating || null,
        blitz: playerStats.chess_blitz?.last?.rating || null,
        bullet: playerStats.chess_bullet?.last?.rating || null,
        daily: playerStats.chess_daily?.last?.rating || null,
        puzzle: playerStats.tactics?.highest?.rating || null
      };

      // Extract game counts and calculate totals
      const gameCount = {
        rapid: (playerStats.chess_rapid?.record?.win || 0) + 
               (playerStats.chess_rapid?.record?.loss || 0) + 
               (playerStats.chess_rapid?.record?.draw || 0),
        blitz: (playerStats.chess_blitz?.record?.win || 0) + 
               (playerStats.chess_blitz?.record?.loss || 0) + 
               (playerStats.chess_blitz?.record?.draw || 0),
        bullet: (playerStats.chess_bullet?.record?.win || 0) + 
                (playerStats.chess_bullet?.record?.loss || 0) + 
                (playerStats.chess_bullet?.record?.draw || 0),
        daily: (playerStats.chess_daily?.record?.win || 0) + 
               (playerStats.chess_daily?.record?.loss || 0) + 
               (playerStats.chess_daily?.record?.draw || 0),
        total: 0
      };

      // Calculate total games
      gameCount.total = gameCount.rapid + gameCount.blitz + gameCount.bullet + gameCount.daily;

      // Calculate overall win rate
      const totalWins = (playerStats.chess_rapid?.record?.win || 0) +
                       (playerStats.chess_blitz?.record?.win || 0) +
                       (playerStats.chess_bullet?.record?.win || 0) +
                       (playerStats.chess_daily?.record?.win || 0);

      const winRate = gameCount.total > 0 ? totalWins / gameCount.total : 0;

      // Prepare the stats object similar to Lichess format
      const stats = {
        username: profile.username,
        rating: ratings,
        gameCount: gameCount,
        winRate: winRate,
        online: isOnline,
        title: profile.title || null,
        name: profile.name || null,
        country: profile.country || null,
        location: profile.location || null,
        joined: profile.joined || null,
        lastOnline: profile.last_online || null,
        followers: profile.followers || 0,
        isStreamer: profile.is_streamer || false,
        twitchUrl: profile.twitch_url || null,
        fideRating: profile.fide || null,
        avatar: profile.avatar || null,
        // Additional Chess.com specific stats
        puzzleRush: {
          best: playerStats.puzzle_rush?.best?.score || null,
          daily: playerStats.puzzle_rush?.daily?.score || null
        },
        lessons: {
          highest: playerStats.lessons?.highest?.rating || null,
          lowest: playerStats.lessons?.lowest?.rating || null
        }
      };

      console.log(`✅ Successfully fetched Chess.com stats for: ${username}`);
      return stats;

    } catch (error) {
      console.error('Error fetching Chess.com user stats:', error);

      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response.data || error.message;
        
        switch (statusCode) {
          case 404:
            throw new Error(`Chess.com user '${username}' not found`);
          case 429:
            throw new Error('Rate limit exceeded for Chess.com API. Please try again later');
          case 403:
            throw new Error('Access forbidden to Chess.com API');
          default:
            throw new Error(`Chess.com API error (${statusCode}): ${errorMessage}`);
        }
      } else if (error.request) {
        throw new Error('No response from Chess.com API. Please check your internet connection');
      } else {
        throw new Error(`Chess.com API request setup error: ${error.message}`);
      }
    }
  }

  /**
   * Get user games from Chess.com (placeholder for future implementation)
   * @param {string} username - Chess.com username
   * @param {number} maxGames - Maximum number of games to fetch
   * @returns {Promise<Array>} Array of games
   */
  async getUserGames(username, maxGames = 50) {
    try {
      console.log(`Fetching Chess.com games for user: ${username}`);
      
      // Get list of available monthly archives
      const archivesResponse = await axios.get(`${this.baseURL}/player/${username}/games/archives`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'AmaChess-Backend/1.0.0'
        }
      });

      const archives = archivesResponse.data.archives;
      
      if (!archives || archives.length === 0) {
        return [];
      }

      // Get the most recent archive
      const latestArchive = archives[archives.length - 1];
      const gamesResponse = await axios.get(latestArchive, {
        timeout: 10000,
        headers: {
          'User-Agent': 'AmaChess-Backend/1.0.0'
        }
      });

      const games = gamesResponse.data.games || [];
      
      // Return up to maxGames
      return games.slice(0, maxGames);

    } catch (error) {
      console.error('Error fetching Chess.com games:', error);
      throw error;
    }
  }

  /**
   * Analyze multiple games (placeholder for future implementation)
   * @param {Array} games - Array of games
   * @param {string} username - Username
   * @returns {object} Analysis object
   */
  async analyzeBulkGames(games, username) {
    // Basic analysis for now
    return {
      gamesAnalyzed: games.length,
      timeRange: this.getTimeRange(games),
      totalGames: games.length,
      analyzedBy: 'Chess.com API'
    };
  }

  /**
   * Get time range of games
   * @param {Array} games - Array of games
   * @returns {object} Time range object
   */
  getTimeRange(games) {
    if (!games || games.length === 0) {
      return { from: null, to: null };
    }

    const dates = games
      .map(game => game.end_time)
      .filter(date => date)
      .sort((a, b) => a - b);

    return {
      from: dates[0] ? new Date(dates[0] * 1000).toISOString() : null,
      to: dates[dates.length - 1] ? new Date(dates[dates.length - 1] * 1000).toISOString() : null
    };
  }

  /**
   * Get rating analytics for a user including peak ratings and performance data
   * @param {string} username - Chess.com username
   * @returns {Promise<object>} Rating analytics object
   */
  async getUserRatingAnalytics(username) {
    try {
      console.log(`Fetching Chess.com rating analytics for user: ${username}`);

      // Get user stats (which includes current ratings)
      const stats = await this.getUserStats(username);

      // Get player profile for additional data
      const profileResponse = await axios.get(`${this.baseURL}/player/${username}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'AmaChess-Backend/1.0.0'
        }
      });
      const profile = profileResponse.data;

      // Get player stats for peak ratings (Chess.com stores best ratings in stats)
      const statsResponse = await axios.get(`${this.baseURL}/player/${username}/stats`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'AmaChess-Backend/1.0.0'
        }
      });
      const playerStats = statsResponse.data;

      const analytics = {
        peakRatings: {},
        thirtyDayChanges: {},
        percentiles: {},
        ratingTrends: {}
      };

      // Extract peak ratings from Chess.com stats
      const gameTypes = ['rapid', 'blitz', 'bullet', 'daily'];
      
      gameTypes.forEach(gameType => {
        const chesscomKey = `chess_${gameType}`;
        
        if (playerStats[chesscomKey]) {
          // Get peak rating (best rating)
          if (playerStats[chesscomKey].best && playerStats[chesscomKey].best.rating) {
            analytics.peakRatings[gameType] = playerStats[chesscomKey].best.rating;
          } else if (playerStats[chesscomKey].last && playerStats[chesscomKey].last.rating) {
            // If no best rating, use current rating as approximation
            analytics.peakRatings[gameType] = playerStats[chesscomKey].last.rating;
          }

          // Calculate 30-day change (rough approximation using available data)
          if (playerStats[chesscomKey].last && playerStats[chesscomKey].best) {
            const currentRating = playerStats[chesscomKey].last.rating;
            const bestRating = playerStats[chesscomKey].best.rating;
            
            // This is a rough approximation - ideally we'd need historical data
            // For now, we'll estimate based on the difference between current and best
            if (currentRating === bestRating) {
              analytics.thirtyDayChanges[gameType] = 0; // At peak
            } else {
              // Estimate a small change (this is very approximate)
              analytics.thirtyDayChanges[gameType] = Math.round((currentRating - bestRating) * 0.1);
            }
          } else {
            analytics.thirtyDayChanges[gameType] = 0;
          }

          // Get percentile estimate
          const rating = analytics.peakRatings[gameType] || stats.rating?.[gameType];
          if (rating) {
            analytics.percentiles[gameType] = this.estimatePercentile(rating);
          }
        }
      });

      // Handle puzzle rating separately if available
      if (playerStats.tactics && playerStats.tactics.highest) {
        analytics.peakRatings['puzzle'] = playerStats.tactics.highest.rating;
        analytics.thirtyDayChanges['puzzle'] = 0; // No historical data available
        analytics.percentiles['puzzle'] = this.estimatePercentile(playerStats.tactics.highest.rating);
      }

      console.log(`✅ Successfully fetched Chess.com rating analytics for: ${username}`);
      return analytics;

    } catch (error) {
      console.error('Error fetching Chess.com rating analytics:', error);
      throw error;
    }
  }

  /**
   * Get user's basic progress statistics
   * @param {string} username - Chess.com username
   * @returns {Promise<object>} Progress statistics object
   */
  async getUserProgressStats(username) {
    try {
      console.log(`Fetching Chess.com progress stats for user: ${username}`);

      // Get user stats first
      const stats = await this.getUserStats(username);

      // Get player stats for detailed records
      const statsResponse = await axios.get(`${this.baseURL}/player/${username}/stats`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'AmaChess-Backend/1.0.0'
        }
      });
      const playerStats = statsResponse.data;

      const progressStats = {
        totalGames: stats.gameCount.total,
        overallWinRate: stats.winRate,
        timeControlBreakdown: {},
        strengthAreas: [],
        improvementAreas: []
      };

      // Calculate win/loss/draw breakdown by time control
      const gameTypes = ['rapid', 'blitz', 'bullet', 'daily'];
      
      gameTypes.forEach(gameType => {
        const chesscomKey = `chess_${gameType}`;
        
        if (playerStats[chesscomKey] && playerStats[chesscomKey].record) {
          const record = playerStats[chesscomKey].record;
          const wins = record.win || 0;
          const losses = record.loss || 0;
          const draws = record.draw || 0;
          const total = wins + losses + draws;
          
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

      // Add puzzle rush analysis if available
      if (stats.puzzleRush && stats.puzzleRush.best) {
        if (stats.puzzleRush.best >= 25) {
          progressStats.strengthAreas.push(`Excellent puzzle rush performance (${stats.puzzleRush.best} best score)`);
        } else if (stats.puzzleRush.best < 15) {
          progressStats.improvementAreas.push('Tactical training recommended (low puzzle rush score)');
        }
      }

      console.log(`✅ Successfully calculated Chess.com progress stats for: ${username}`);
      return progressStats;

    } catch (error) {
      console.error('Error fetching Chess.com progress stats:', error);
      throw error;
    }
  }

  /**
   * Estimate percentile based on rating (rough approximation)
   * @param {number} rating - Player's rating
   * @returns {number} Estimated percentile
   */
  estimatePercentile(rating) {
    // This is a rough approximation based on general chess rating distributions
    // Chess.com doesn't provide official percentile data via their public API
    if (rating >= 2400) return 99;
    if (rating >= 2200) return 95;
    if (rating >= 2000) return 90;
    if (rating >= 1800) return 80;
    if (rating >= 1600) return 70;
    if (rating >= 1400) return 60;
    if (rating >= 1200) return 50;
    if (rating >= 1000) return 40;
    if (rating >= 800) return 30;
    return 20;
  }

  /**
   * Get user's recent rapid games from Chess.com
   * @param {string} username - Chess.com username
   * @param {number} maxGames - Maximum number of games to fetch
   * @returns {Promise<Array>} Array of formatted rapid games
   */
  async getRecentRapidGames(username, maxGames = 5) {
    try {
      console.log(`Fetching Chess.com rapid games for user: ${username}`);
      
      // Get list of available monthly archives
      const archivesResponse = await axios.get(`${this.baseURL}/player/${username}/games/archives`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'AmaChess-Backend/1.0.0'
        }
      });

      const archives = archivesResponse.data.archives;
      
      if (!archives || archives.length === 0) {
        return [];
      }

      // Get games from the most recent archives until we have enough rapid games
      const rapidGames = [];
      for (let i = archives.length - 1; i >= 0 && rapidGames.length < maxGames; i--) {
        try {
          const gamesResponse = await axios.get(archives[i], {
            timeout: 10000,
            headers: {
              'User-Agent': 'AmaChess-Backend/1.0.0'
            }
          });

          const games = gamesResponse.data.games || [];
          
          // Filter for rapid games and format them
          const monthRapidGames = games
            .filter(game => game.time_class === 'rapid')
            .sort((a, b) => b.end_time - a.end_time) // Sort by most recent first
            .map(game => {
              const isWhite = game.white.username.toLowerCase() === username.toLowerCase();
              const opponent = isWhite ? game.black.username : game.white.username;
              
              let result = 'draw';
              if (game.white.result === 'win') {
                result = isWhite ? 'win' : 'loss';
              } else if (game.black.result === 'win') {
                result = isWhite ? 'loss' : 'win';
              }

              const playerData = isWhite ? game.white : game.black;
              const ratingChange = playerData.rating_change || 0;

              return {
                id: game.url.split('/').pop(),
                platform: 'chess.com',
                opponent,
                result,
                ratingChange: ratingChange > 0 ? `+${ratingChange}` : ratingChange.toString(),
                timeControl: `${Math.floor(game.time_control / 60)}+${game.increment || 0}`,
                opening: this.extractOpening(game.pgn),
                date: new Date(game.end_time * 1000).toISOString().split('T')[0],
                url: game.url
              };
            });

          rapidGames.push(...monthRapidGames);
        } catch (archiveError) {
          console.error(`Error fetching archive ${archives[i]}:`, archiveError);
          continue;
        }
      }

      return rapidGames.slice(0, maxGames);

    } catch (error) {
      console.error('Error fetching Chess.com rapid games:', error);
      return [];
    }
  }

  /**
   * Extract opening name from PGN
   * @param {string} pgn - PGN string
   * @returns {string} Opening name
   */
  extractOpening(pgn) {
    if (!pgn) return 'Unknown';
    
    const openingMatch = pgn.match(/\[ECOUrl "https:\/\/www\.chess\.com\/openings\/([^"]+)"/);
    if (openingMatch) {
      return openingMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    
    // Fallback to basic opening detection
    const moves = pgn.split('\n').slice(-1)[0];
    if (moves.includes('e4 e5')) return 'King\'s Pawn Game';
    if (moves.includes('d4 d5')) return 'Queen\'s Pawn Game';
    if (moves.includes('Nf3')) return 'Reti Opening';
    
    return 'Unknown';
  }
}

module.exports = ChesscomService;
