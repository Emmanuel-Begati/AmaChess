const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

class PuzzleService {
  constructor() {
    this.puzzles = [];
    this.isLoaded = false;
    this.csvPath = path.join(__dirname, '../../utils/lichess_db_puzzle.csv');
  }

  async loadPuzzles() {
    if (this.isLoaded && this.puzzles.length > 0) {
      return this.puzzles;
    }

    try {
      console.log('Loading Lichess puzzle database (sample)...');
      
      return new Promise((resolve, reject) => {
        const puzzles = [];
        let rowCount = 0;
        const maxRows = 10000; // Load only first 10K puzzles for performance
        
        const stream = fs.createReadStream(this.csvPath, { encoding: 'utf8' });
        
        stream
          .pipe(csv())
          .on('data', (row) => {
            // Stop after loading enough puzzles
            if (rowCount >= maxRows) {
              return;
            }
            
            // Parse the CSV row into our puzzle format
            try {
              const puzzle = {
                id: row.PuzzleId,
                fen: row.FEN,
                moves: row.Moves ? row.Moves.split(' ') : [],
                rating: parseInt(row.Rating) || 1500,
                ratingDeviation: parseInt(row.RatingDeviation) || 0,
                popularity: parseInt(row.Popularity) || 0,
                nbPlays: parseInt(row.NbPlays) || 0,
                themes: row.Themes ? row.Themes.split(' ') : [],
                gameUrl: row.GameUrl || '',
                openingTags: row.OpeningTags || '',
                // Enhanced puzzle data
                pgn: null, // Will be extracted from game URL if available
                gamePosition: null, // Position before the puzzle starts
                sideToMove: null, // 'white' or 'black' - who needs to find the best move
                difficulty: this.getDifficultyFromRating(parseInt(row.Rating) || 1500),
                hint: this.generateHint(row.Themes, row.Moves),
                description: this.generateDescription(row.Themes, parseInt(row.Rating) || 1500)
              };
              
              // Determine side to move from FEN
              puzzle.sideToMove = this.getSideToMoveFromFEN(puzzle.fen);
              
              // Only include puzzles with valid data
              if (puzzle.id && puzzle.fen && puzzle.moves.length > 0) {
                puzzles.push(puzzle);
                rowCount++;
              }
            } catch (error) {
              console.warn('Skipping invalid puzzle row:', error.message);
            }
          })
          .on('end', () => {
            this.puzzles = puzzles;
            this.isLoaded = true;
            console.log(`Loaded ${puzzles.length} puzzles from Lichess database (sample of ${maxRows})`);
            resolve(puzzles);
          })
          .on('error', (error) => {
            console.error('Error parsing CSV:', error);
            reject(error);
          });
      });
    } catch (error) {
      console.error('Error loading puzzle database:', error);
      throw error;
    }
  }

  async getRandomPuzzle(filters = {}) {
    if (!this.isLoaded) {
      await this.loadPuzzles();
    }

    if (this.puzzles.length === 0) {
      throw new Error('No puzzles available');
    }

    // Apply filters
    let filteredPuzzles = this.puzzles;

    if (filters.minRating && filters.maxRating) {
      filteredPuzzles = filteredPuzzles.filter(puzzle => 
        puzzle.rating >= filters.minRating && puzzle.rating <= filters.maxRating
      );
    }

    if (filters.themes && filters.themes.length > 0) {
      filteredPuzzles = filteredPuzzles.filter(puzzle =>
        filters.themes.some(filterTheme => 
          puzzle.themes.some(puzzleTheme => 
            puzzleTheme.toLowerCase() === filterTheme.toLowerCase()
          )
        )
      );
    }

    if (filters.difficulty) {
      // Map difficulty to rating ranges
      const difficultyRanges = {
        'beginner': { min: 0, max: 1400 },
        'intermediate': { min: 1400, max: 1800 },
        'advanced': { min: 1800, max: 2200 },
        'expert': { min: 2200, max: 3000 }
      };

      const range = difficultyRanges[filters.difficulty.toLowerCase()];
      if (range) {
        filteredPuzzles = filteredPuzzles.filter(puzzle =>
          puzzle.rating >= range.min && puzzle.rating <= range.max
        );
      }
    }

    if (filteredPuzzles.length === 0) {
      // Fallback to any puzzle if filters are too restrictive
      filteredPuzzles = this.puzzles;
    }

    // Get random puzzle
    const randomIndex = Math.floor(Math.random() * filteredPuzzles.length);
    const selectedPuzzle = filteredPuzzles[randomIndex];

    // Extract game information from gameUrl
    const gameInfo = this.extractGameInfo(selectedPuzzle.gameUrl);

    // Format for frontend consumption with all available data
    return {
      id: selectedPuzzle.id,
      fen: selectedPuzzle.fen,
      moves: selectedPuzzle.moves,
      rating: selectedPuzzle.rating,
      ratingDeviation: selectedPuzzle.ratingDeviation,
      themes: selectedPuzzle.themes,
      gameUrl: selectedPuzzle.gameUrl,
      gameInfo: gameInfo, // Game ID, move number, etc.
      openingTags: selectedPuzzle.openingTags,
      difficulty: this.getRatingDifficulty(selectedPuzzle.rating),
      popularity: selectedPuzzle.popularity,
      nbPlays: selectedPuzzle.nbPlays,
      sideToMove: selectedPuzzle.sideToMove,
      solution: selectedPuzzle.moves, 
      description: this.generateDescription(selectedPuzzle.themes, selectedPuzzle.rating),
      hint: this.generateHint(selectedPuzzle.themes, selectedPuzzle.moves),
      // Additional puzzle metadata
      moveCount: selectedPuzzle.moves.length,
      isEndgame: selectedPuzzle.themes.includes('endgame'),
      isTactical: selectedPuzzle.themes.some(theme => 
        ['pin', 'fork', 'skewer', 'deflection', 'discoveredAttack'].includes(theme)
      ),
      hasCheckmate: selectedPuzzle.themes.some(theme => 
        theme.includes('mate') || theme.includes('mateIn')
      )
    };
  }

  // Extract game information from Lichess game URL
  extractGameInfo(gameUrl) {
    if (!gameUrl) return null;
    
    try {
      // Parse Lichess URL format: https://lichess.org/gameId/color#moveNumber
      const urlMatch = gameUrl.match(/lichess\.org\/([^\/]+)(?:\/([^#]+))?(?:#(\d+))?/);
      if (urlMatch) {
        return {
          gameId: urlMatch[1],
          color: urlMatch[2] || 'white',
          moveNumber: urlMatch[3] ? parseInt(urlMatch[3]) : null,
          lichessUrl: gameUrl
        };
      }
    } catch (error) {
      console.warn('Error parsing game URL:', error);
    }
    return null;
  }

  getRatingDifficulty(rating) {
    if (rating < 1400) return 'Beginner';
    if (rating < 1800) return 'Intermediate';
    if (rating < 2200) return 'Advanced';
    return 'Expert';
  }

  generateDescription(themes) {
    const themeDescriptions = {
      'pin': 'Find the winning pin that immobilizes the opponent\'s piece',
      'fork': 'Execute a double attack to win material',
      'skewer': 'Force the opponent to move a valuable piece',
      'backRank': 'Exploit the weakness on the back rank',
      'deflection': 'Remove the defender and win material',
      'discoveredAttack': 'Unleash a discovered attack',
      'sacrifice': 'Find the brilliant sacrifice',
      'mate': 'Deliver checkmate',
      'smotheredMate': 'Execute a smothered mate pattern',
      'attraction': 'Lure the enemy piece to a vulnerable square'
    };

    const primaryTheme = themes[0];
    return themeDescriptions[primaryTheme] || 'Find the best tactical move';
  }

  generateHint(themes) {
    const themeHints = {
      'pin': 'Look for a move that pins an important piece',
      'fork': 'Find a move that attacks two pieces at once',
      'skewer': 'Attack through to a more valuable piece behind',
      'backRank': 'Check the safety of the enemy king\'s back rank',
      'deflection': 'Remove the piece that\'s defending something important',
      'discoveredAttack': 'Move a piece to reveal an attack behind it',
      'sacrifice': 'Consider giving up material for a bigger advantage',
      'mate': 'Look for forcing moves that threaten checkmate',
      'smotheredMate': 'Use the knight to deliver mate',
      'attraction': 'Force the enemy piece to a worse square'
    };

    const primaryTheme = themes[0];
    return themeHints[primaryTheme] || 'Look for the most forcing move';
  }

  async getPuzzlesByTheme(theme, limit = 10) {
    if (!this.isLoaded) {
      await this.loadPuzzles();
    }

    const themePuzzles = this.puzzles.filter(puzzle =>
      puzzle.themes.some(puzzleTheme => 
        puzzleTheme.toLowerCase() === theme.toLowerCase()
      )
    );

    // Shuffle and return limited number
    const shuffled = themePuzzles.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit).map(puzzle => ({
      id: puzzle.id,
      fen: puzzle.fen,
      moves: puzzle.moves,
      rating: puzzle.rating,
      themes: puzzle.themes,
      difficulty: this.getRatingDifficulty(puzzle.rating)
    }));
  }

  getAvailableThemes() {
    if (!this.isLoaded) {
      return [];
    }

    const themes = new Set();
    this.puzzles.forEach(puzzle => {
      puzzle.themes.forEach(theme => themes.add(theme));
    });

    return Array.from(themes).sort();
  }

  getPuzzleStats() {
    if (!this.isLoaded) {
      return {
        total: 0,
        byDifficulty: {},
        byTheme: {},
        averageRating: 0
      };
    }

    const stats = {
      total: this.puzzles.length,
      byDifficulty: {},
      byTheme: {},
      averageRating: 0
    };

    // Calculate stats
    let totalRating = 0;
    this.puzzles.forEach(puzzle => {
      totalRating += puzzle.rating;
      
      const difficulty = this.getRatingDifficulty(puzzle.rating);
      stats.byDifficulty[difficulty] = (stats.byDifficulty[difficulty] || 0) + 1;
      
      puzzle.themes.forEach(theme => {
        stats.byTheme[theme] = (stats.byTheme[theme] || 0) + 1;
      });
    });

    stats.averageRating = Math.round(totalRating / this.puzzles.length);
    
    return stats;
  }

  // Helper method to determine side to move from FEN
  getSideToMoveFromFEN(fen) {
    try {
      const fenParts = fen.split(' ');
      return fenParts[1] === 'w' ? 'white' : 'black';
    } catch (error) {
      console.warn('Error parsing FEN for side to move:', error);
      return 'white'; // Default fallback
    }
  }

  // Helper method to get difficulty from rating
  getDifficultyFromRating(rating) {
    if (rating < 1000) return 'Beginner';
    if (rating < 1400) return 'Easy';
    if (rating < 1800) return 'Intermediate';
    if (rating < 2200) return 'Hard';
    return 'Expert';
  }

  // Helper method to generate hints based on themes
  generateHint(themes, moves) {
    if (!themes || themes.length === 0) return "Look for the best move in this position.";
    
    const themeHints = {
      'mate': "Look for checkmate!",
      'mateIn1': "Checkmate in one move!",
      'mateIn2': "Find the checkmate in two moves.",
      'mateIn3': "Look for checkmate in three moves.",
      'pin': "Look for a pin tactic.",
      'fork': "Find the fork!",
      'skewer': "Look for a skewer.",
      'discoveredAttack': "Find the discovered attack.",
      'deflection': "Use deflection to win material.",
      'sacrifice': "A sacrifice might be the key.",
      'quietMove': "Sometimes the quiet move is best.",
      'zugzwang': "Put your opponent in zugzwang.",
      'endgame': "Apply endgame principles.",
      'opening': "Follow opening principles.",
      'middlegame': "Look for tactical opportunities.",
      'attacking': "Launch an attack!",
      'defending': "Find the best defense.",
      'crushing': "Find the crushing move!",
      'advantage': "Convert your advantage.",
      'equality': "Achieve equality."
    };

    // Find the most specific hint
    for (const theme of themes) {
      if (themeHints[theme]) {
        return themeHints[theme];
      }
    }

    return "Find the best move for your side.";
  }

  // Helper method to generate puzzle description
  generateDescription(themes, rating) {
    const difficulty = this.getDifficultyFromRating(rating);
    const mainTheme = themes && themes.length > 0 ? themes[0] : 'tactical';
    
    return `${difficulty} ${mainTheme} puzzle. Find the best continuation.`;
  }

  // Enhanced method to get puzzle with PGN analysis
  async getPuzzleWithAnalysis(puzzleId) {
    const puzzle = this.puzzles.find(p => p.id === puzzleId);
    if (!puzzle) return null;

    // If we have a game URL, we could potentially fetch the PGN
    // For now, we'll return the enhanced puzzle data
    return {
      ...puzzle,
      analysis: {
        themes: puzzle.themes,
        sideToMove: puzzle.sideToMove,
        difficulty: puzzle.difficulty,
        hint: puzzle.hint,
        description: puzzle.description,
        moveSequence: puzzle.moves,
        continuationLength: puzzle.moves.length
      }
    };
  }

  // Fetch PGN from Lichess game URL
  async fetchGamePGN(gameInfo) {
    if (!gameInfo || !gameInfo.gameId) return null;
    
    try {
      const fetch = require('node-fetch'); // You might need to install node-fetch
      const pgnUrl = `https://lichess.org/game/export/${gameInfo.gameId}?format=pgn`;
      const response = await fetch(pgnUrl);
      
      if (response.ok) {
        const pgn = await response.text();
        return {
          pgn: pgn,
          gameId: gameInfo.gameId,
          moveNumber: gameInfo.moveNumber,
          lichessUrl: gameInfo.lichessUrl
        };
      }
    } catch (error) {
      console.warn('Error fetching PGN:', error);
    }
    return null;
  }

  // Get puzzle with complete game context
  async getPuzzleWithGameContext(puzzleId) {
    const puzzle = this.puzzles.find(p => p.id === puzzleId);
    if (!puzzle) return null;

    const gameInfo = this.extractGameInfo(puzzle.gameUrl);
    let gameContext = null;

    if (gameInfo) {
      gameContext = await this.fetchGamePGN(gameInfo);
    }

    return {
      ...puzzle,
      gameContext: gameContext,
      gameInfo: gameInfo,
      analysis: {
        themes: puzzle.themes,
        sideToMove: puzzle.sideToMove,
        difficulty: puzzle.difficulty,
        hint: puzzle.hint,
        description: puzzle.description,
        moveSequence: puzzle.moves,
        continuationLength: puzzle.moves.length,
        opening: puzzle.openingTags
      }
    };
  }
}

module.exports = new PuzzleService();
