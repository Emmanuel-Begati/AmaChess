const Groq = require('groq-sdk');
const { Chess } = require('chess.js');

class GroqService {
  constructor() {
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-api-key-here') {
      this.client = new Groq({
        apiKey: process.env.GROQ_API_KEY
      });
      // Use LLaMA 3.3 70B for enhanced chess understanding and coaching
      this.model = 'llama-3.3-70b-versatile';
    } else {
      this.client = null;
      this.model = null;
      console.warn('⚠️  Groq API key not configured. AI coaching features will be disabled.');
    }
  }

  isConfigured() {
    return this.client && 
           this.client.apiKey && 
           this.client.apiKey !== 'your-groq-api-key-here' &&
           this.client.apiKey.length > 20;
  }

  /**
   * Generate chess coaching hints with full PGN context for deep analysis
   */
  async generateHint(position, gameContext = {}) {
    if (!this.isConfigured()) {
      console.warn('Groq API key not configured, using fallback hint');
      return this.getFallbackHint();
    }

    try {
      const chess = new Chess(position);
      const positionInfo = this.analyzePosition(chess);
      const difficulty = gameContext.difficulty || 'intermediate';
      const pgn = gameContext.pgn || '';
      const moveHistory = gameContext.moveHistory || [];
      const gamePhase = gameContext.gamePhase || this.determineGamePhase(moveHistory.length);
      const playerColor = gameContext.playerColor || 'white';

      // Enhanced context analysis from PGN
      const pgnAnalysis = this.analyzePGNContext(pgn, gamePhase, playerColor);

      const systemPrompt = `You are Coach B, an expert chess coach analyzing a live game. Provide strategic hints based on the complete game context.

GAME CONTEXT:
- Player Color: ${playerColor}
- Game Phase: ${gamePhase}
- Move Count: ${moveHistory.length}
- Difficulty: ${difficulty}

CURRENT POSITION ANALYSIS:
- Phase: ${positionInfo.phase}
- Key Features: ${positionInfo.keyFeatures.join(', ') || 'Balanced position'}
- Material Balance: ${positionInfo.materialBalance === 0 ? 'Equal' : positionInfo.materialBalance > 0 ? 'White ahead' : 'Black ahead'}
- Tactical Opportunities: ${positionInfo.tactics.length > 0 ? positionInfo.tactics.join(', ') : 'Look for patterns'}

GAME HISTORY INSIGHTS:
${pgnAnalysis.insights}

COMPLETE GAME PGN:
${pgn.slice(-500)} // Last 500 characters for context

Your coaching style:
- Provide hints that consider the entire game flow, not just the current position
- Reference specific patterns or themes from the game history
- Guide toward moves that fit the overall strategic plan
- Consider the opening played and typical middlegame/endgame plans
- Keep hints educational and appropriate for ${difficulty} level
- Limit to 2-3 sentences maximum
- Use the game context to provide more targeted advice`;

      const userPrompt = `Analyze this position in the context of the complete game and give me a strategic hint. Consider the opening played, recent tactical themes, and the overall position trends.`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 150,
        temperature: 0.7,
        top_p: 0.9
      });

      return {
        message: response.choices[0].message.content.trim(),
        type: 'hint',
        coach: 'Coach B',
        timestamp: new Date().toISOString(),
        positionAnalysis: positionInfo,
        gameContext: {
          phase: gamePhase,
          moveCount: moveHistory.length,
          pgnInsights: pgnAnalysis.keyThemes
        }
      };

    } catch (error) {
      console.error('Groq API error for hint:', error);
      return this.getFallbackHint();
    }
  }

  /**
   * Analyze blunder with complete game context
   */
  async analyzeBlunder(position, playerMove, evaluationChange, gameContext = {}) {
    if (!this.isConfigured()) {
      console.warn('Groq API key not configured, using fallback blunder analysis');
      return this.getFallbackBlunderAnalysis(evaluationChange, gameContext.isUserBlunder);
    }

    try {
      const chess = new Chess(position);
      const positionInfo = this.analyzePosition(chess);
      const difficulty = gameContext.difficulty || 'intermediate';
      const pgn = gameContext.pgn || '';
      const isUserBlunder = gameContext.isUserBlunder || false;
      const bestMove = gameContext.bestMove || '';
      const gamePhase = gameContext.gamePhase || this.determineGamePhase(gameContext.moveHistory?.length || 0);
      const playerColor = gameContext.playerColor || 'white';

      // Analyze game context for blunder assessment
      const pgnAnalysis = this.analyzePGNContext(pgn, gamePhase, playerColor);

      let systemPrompt;
      let userPrompt;

      if (isUserBlunder) {
        systemPrompt = `You are Coach B, providing constructive feedback on a player's blunder. Use the complete game context to explain why this move was problematic.

GAME CONTEXT:
- Player Color: ${playerColor}
- Game Phase: ${gamePhase}
- Difficulty Level: ${difficulty}
- Evaluation Change: ${Math.abs(evaluationChange)} centipawns lost

POSITION FEATURES:
- ${positionInfo.keyFeatures.join(', ')}
- Material: ${positionInfo.materialBalance === 0 ? 'Equal' : positionInfo.materialBalance > 0 ? 'White ahead' : 'Black ahead'}

GAME HISTORY PATTERNS:
${pgnAnalysis.insights}

RECENT GAME CONTEXT:
${pgn.slice(-300)}

Your coaching approach:
- Explain the blunder in context of the overall game plan
- Point out what the player missed based on recent moves/themes
- Suggest how this fits into patterns from the game
- Be encouraging but educational
- Reference the game flow and strategic themes
- Keep it concise (2-3 sentences)`;

        userPrompt = `The player just played ${playerMove} and lost ${Math.abs(evaluationChange)} centipawns. ${bestMove ? `The better move was ${bestMove}.` : ''} Explain this blunder in the context of the complete game, focusing on what they missed based on the game's themes and recent moves.`;
      } else {
        systemPrompt = `You are Coach B, helping the player capitalize on the computer's mistake. Use the game context to guide them toward the best continuation.

GAME CONTEXT & OPPORTUNITY:
- The computer just made an error (${Math.abs(evaluationChange)} centipawns)
- Player Color: ${playerColor}
- Game Phase: ${gamePhase}
- Difficulty: ${difficulty}

CURRENT POSITION:
- ${positionInfo.keyFeatures.join(', ')}
- Key Tactics: ${positionInfo.tactics.join(', ') || 'Look for forcing moves'}

GAME FLOW CONTEXT:
${pgnAnalysis.insights}

Help the player find the best response based on the game's strategic themes and tactical patterns.`;

        userPrompt = `The computer just made a mistake! Based on the game context and themes we've seen, guide the player toward the strongest continuation without giving away the exact move.`;
      }

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 150,
        temperature: 0.8,
        top_p: 0.9
      });

      return {
        message: response.choices[0].message.content.trim(),
        type: 'blunder_analysis',
        coach: 'Coach B',
        isUserBlunder,
        evaluationChange,
        severity: Math.abs(evaluationChange) > 300 ? 'major' : Math.abs(evaluationChange) > 150 ? 'moderate' : 'minor',
        timestamp: new Date().toISOString(),
        gameContext: {
          phase: gamePhase,
          pgnInsights: pgnAnalysis.keyThemes
        }
      };

    } catch (error) {
      console.error('Groq API error for blunder analysis:', error);
      return this.getFallbackBlunderAnalysis(evaluationChange, gameContext.isUserBlunder);
    }
  }

  /**
   * Generate chess coaching response for moves and positions
   */
  async generateChessCoaching(position, playerMove, gameContext = {}) {
    if (!this.isConfigured()) {
      console.warn('Groq API key not configured, using fallback coaching');
      return this.getFallbackCoaching(playerMove);
    }

    try {
      const chess = new Chess(position);
      const positionInfo = this.analyzePosition(chess);
      const difficulty = gameContext.difficulty || 'intermediate';
      const moveHistory = gameContext.moveHistory || [];

      const systemPrompt = `You are Coach B, an expert chess coach. Provide helpful coaching ONLY for the student's moves, not for computer/AI moves.

Your coaching style:
- Focus exclusively on analyzing and improving the student's play
- Never announce or explain computer moves
- Supportive and educational about student moves only
- Provide specific, actionable advice for student improvement
- Appropriate for ${difficulty} level
- Keep responses concise (1-2 sentences)
- Encourage improvement without being critical

Position analysis:
- Game phase: ${positionInfo.phase}
- Key features: ${positionInfo.keyFeatures.join(', ') || 'Balanced position'}
- Material balance: ${positionInfo.materialBalance === 0 ? 'Equal' : positionInfo.materialBalance > 0 ? 'White ahead' : 'Black ahead'}

${moveHistory.length > 0 ? `Recent moves: ${moveHistory.slice(-4).join(' ')}` : ''}`;

      const userPrompt = playerMove 
        ? `The student just played ${playerMove} in this position: ${position}. Provide coaching feedback about their move only.`
        : `Provide coaching guidance for the student in this position: ${position}.`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 120,
        temperature: 0.7
      });

      return {
        message: response.choices[0].message.content.trim(),
        coach: 'Coach B',
        timestamp: new Date().toISOString(),
        positionAnalysis: positionInfo
      };

    } catch (error) {
      console.error('Groq API error for coaching:', error);
      return this.getFallbackCoaching(playerMove);
    }
  }

  /**
   * Generate welcome coaching message for new training sessions
   */
  async generateWelcomeMessage(difficulty = 'intermediate', gameContext = {}) {
    if (!this.isConfigured()) {
      console.warn('Groq API key not configured, using fallback welcome');
      return this.getFallbackWelcomeMessage(difficulty);
    }

    try {
      const systemPrompt = `You are Coach B, an expert chess coach, welcoming a student to a personal chess training session. Create an encouraging, motivating welcome message that sets the tone for learning.

Your welcome style:
- Warm and encouraging
- Briefly explain what they'll learn
- Appropriate for ${difficulty} level players  
- Keep it conversational and personal
- Limit to 2-3 sentences
- Make them excited to play and learn`;

      const userPrompt = `Welcome a ${difficulty} level chess student to a new training session. Make them feel comfortable and excited to learn.`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 120,
        temperature: 0.8
      });

      return {
        message: response.choices[0].message.content.trim(),
        coach: 'Coach B',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Groq API error for welcome message:', error);
      return this.getFallbackWelcomeMessage(difficulty);
    }
  }

  /**
   * Determine if an evaluation change constitutes a blunder
   */
  static isBlunder(evaluationChange, gamePhase = 'middlegame') {
    const threshold = gamePhase === 'endgame' ? 100 : 150; // Lower threshold for endgame
    return Math.abs(evaluationChange) >= threshold;
  }

  /**
   * Determine if an evaluation change is significant enough to warrant coaching
   */
  static isSignificantChange(evaluationChange) {
    return Math.abs(evaluationChange) >= 75; // Significant but not necessarily blunder
  }

  /**
   * Analyze a blunder and provide targeted coaching
   */
  async analyzeBlunder(position, playerMove, evaluationChange, gameContext = {}) {
    if (!this.isConfigured()) {
      console.warn('Groq API key not configured, using fallback blunder analysis');
      return this.getFallbackBlunderAnalysis(evaluationChange);
    }

    try {
      const chess = new Chess(position);
      const positionInfo = this.analyzePosition(chess);
      const difficulty = gameContext.difficulty || 'intermediate';
      const pgn = gameContext.pgn || '';
      const isUserBlunder = gameContext.isUserBlunder || false;
      const bestMove = gameContext.bestMove || '';

      let systemPrompt;
      let userPrompt;

      if (isUserBlunder) {
        // User made a blunder - provide constructive feedback
        systemPrompt = `You are Coach B, a supportive chess instructor. The student just made a significant mistake (blunder). Your job is to help them learn without being harsh.

Your coaching approach:
- Be understanding and encouraging
- Explain what went wrong briefly
- Suggest what they should look for instead
- Keep it appropriate for ${difficulty} level
- Limit to 2-3 sentences
- Focus on learning, not criticism

Position context:
- Game phase: ${positionInfo.phase}
- Evaluation change: ${evaluationChange} centipawns
- Material balance: ${positionInfo.materialBalance === 0 ? 'Equal' : positionInfo.materialBalance > 0 ? 'White ahead' : 'Black ahead'}
- Key tactical features: ${positionInfo.tactics.length > 0 ? positionInfo.tactics.join(', ') : 'None obvious'}`;

        userPrompt = `The student played ${playerMove} which lost about ${Math.abs(evaluationChange)} centipawns. ${bestMove ? `The better move was ${bestMove}.` : ''} Help them understand what to watch out for next time.`;
      } else {
        // Engine made a blunder - challenge the user to find the right move
        systemPrompt = `You are Coach B, an encouraging chess instructor. The computer just made a mistake, creating an opportunity for the student to find a strong move.

Your teaching approach:
- Create excitement about the opportunity
- Give a hint without revealing the exact move
- Encourage them to calculate carefully
- Make it appropriate for ${difficulty} level
- Limit to 2-3 sentences
- Be motivational and engaging

Position context:
- Game phase: ${positionInfo.phase}
- Evaluation change: ${evaluationChange} centipawns (in student's favor)
- Key tactical opportunities: ${positionInfo.tactics.length > 0 ? positionInfo.tactics.join(', ') : 'Look deeper'}`;

        userPrompt = `The computer just played ${playerMove} which gave you an advantage of about ${Math.abs(evaluationChange)} centipawns. Can you spot the strong response? Give a hint to help them find it.`;
      }

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 120,
        temperature: 0.7,
        top_p: 0.9
      });

      return {
        message: response.choices[0].message.content.trim(),
        type: 'blunder_analysis',
        coach: 'Coach B',
        timestamp: new Date().toISOString(),
        evaluationChange,
        isUserBlunder,
        positionAnalysis: positionInfo
      };

    } catch (error) {
      console.error('Groq API error for blunder analysis:', error);
      return this.getFallbackBlunderAnalysis(evaluationChange, isUserBlunder);
    }
  }

  /**
   * Generate hints with full game context (PGN)
   */
  async generateContextualHint(position, gameContext = {}) {
    if (!this.isConfigured()) {
      console.warn('Groq API key not configured, using fallback hint');
      return this.getFallbackHint();
    }

    try {
      const chess = new Chess(position);
      const positionInfo = this.analyzePosition(chess);
      const difficulty = gameContext.difficulty || 'intermediate';
      const pgn = gameContext.pgn || '';
      const moveHistory = gameContext.moveHistory || [];

      const systemPrompt = `You are Coach B, a chess instructor providing hints. You have access to the full game context to give better guidance.

Your hint style:
- Use the game context to give relevant advice
- Guide toward good principles without revealing exact moves
- Consider the opening/middlegame patterns from the PGN
- Keep it appropriate for ${difficulty} level
- Be encouraging and educational
- Limit to 2-3 sentences maximum

Game context:
- Current phase: ${positionInfo.phase}
- Move number: ${Math.floor(moveHistory.length / 2) + 1}
- Recent pattern: ${this.analyzeRecentPattern(moveHistory)}
- Position features: ${positionInfo.keyFeatures.join(', ') || 'Balanced position'}
- Tactical opportunities: ${positionInfo.tactics.length > 0 ? positionInfo.tactics.join(', ') : 'Look for forcing moves'}`;

      const userPrompt = `Given this game context and position: ${position}, provide a helpful hint. ${pgn ? `Game so far: ${pgn.slice(-200)}` : ''} Help the student think about the best approach.`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 100,
        temperature: 0.7,
        top_p: 0.9
      });

      return {
        message: response.choices[0].message.content.trim(),
        type: 'contextual_hint',
        coach: 'Coach B',
        timestamp: new Date().toISOString(),
        positionAnalysis: positionInfo
      };

    } catch (error) {
      console.error('Groq API error for contextual hint:', error);
      return this.getFallbackHint();
    }
  }

  /**
   * Analyze recent move patterns to provide context
   */
  analyzeRecentPattern(moveHistory) {
    if (moveHistory.length < 4) return 'Opening phase';
    
    const recentMoves = moveHistory.slice(-4);
    const hasCaptures = recentMoves.some(move => move.includes('x'));
    const hasChecks = recentMoves.some(move => move.includes('+'));
    const hasCastling = recentMoves.some(move => move.includes('O-O'));
    
    if (hasChecks) return 'Tactical sequence';
    if (hasCaptures) return 'Material exchange';
    if (hasCastling) return 'King safety focus';
    return 'Positional play';
  }

  /**
   * Determine if an evaluation change indicates a blunder
   */
  static isBlunder(evaluationChange, gamePhase = 'middlegame') {
    const thresholds = {
      opening: 100,     // 1 pawn in opening
      middlegame: 150,  // 1.5 pawns in middlegame  
      endgame: 75       // 0.75 pawns in endgame (more sensitive)
    };
    
    return Math.abs(evaluationChange) >= (thresholds[gamePhase] || thresholds.middlegame);
  }

  /**
   * Determine if evaluation change is significant enough for coaching
   */
  static isSignificantChange(evaluationChange) {
    return Math.abs(evaluationChange) >= 75; // 0.75 pawn threshold
  }
  analyzePosition(chess) {
    const fen = chess.fen();
    const moves = chess.moves();
    const moveCount = chess.moveNumber();
    
    // Determine game phase
    let phase = 'opening';
    if (moveCount > 15) phase = 'middlegame';
    if (this.isEndgame(chess)) phase = 'endgame';

    // Calculate material balance
    const materialBalance = this.calculateMaterialBalance(chess);

    // Identify key features
    const keyFeatures = [];
    
    if (chess.inCheck()) keyFeatures.push('in check');
    if (moves.length < 5) keyFeatures.push('few moves available');
    if (this.hasTacticalThreats(chess)) keyFeatures.push('tactical opportunities');
    if (Math.abs(materialBalance) > 300) keyFeatures.push('material imbalance');

    // Identify basic tactics
    const tactics = [];
    if (chess.inCheck()) tactics.push('check');
    if (this.hasCaptures(chess)) tactics.push('captures available');
    if (this.hasCastling(chess)) tactics.push('castling available');

    return {
      phase,
      materialBalance,
      keyFeatures,
      tactics,
      moveCount
    };
  }

  /**
   * Calculate material balance (positive = white ahead)
   */
  calculateMaterialBalance(chess) {
    const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    let balance = 0;

    const board = chess.board();
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const value = pieceValues[piece.type] || 0;
          balance += piece.color === 'w' ? value * 100 : -value * 100;
        }
      }
    }
    return balance;
  }

  /**
   * Check if position is endgame
   */
  isEndgame(chess) {
    const board = chess.board();
    let pieceCount = 0;
    let queenCount = 0;

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece && piece.type !== 'k') {
          pieceCount++;
          if (piece.type === 'q') queenCount++;
        }
      }
    }

    return pieceCount <= 12 || (queenCount === 0 && pieceCount <= 14);
  }

  /**
   * Check for tactical threats
   */
  hasTacticalThreats(chess) {
    const moves = chess.moves({ verbose: true });
    return moves.some(move => move.captured || move.san.includes('+') || move.san.includes('#'));
  }

  /**
   * Check for available captures
   */
  hasCaptures(chess) {
    const moves = chess.moves({ verbose: true });
    return moves.some(move => move.captured);
  }

  /**
   * Check for castling availability
   */
  hasCastling(chess) {
    const moves = chess.moves();
    return moves.some(move => move === 'O-O' || move === 'O-O-O');
  }

  /**
   * Generate welcome coaching message for new training sessions
   */
  async generateWelcomeMessage(difficulty = 'intermediate', gameContext = {}) {
    if (!this.isConfigured()) {
      console.warn('Groq API key not configured, using fallback welcome');
      return this.getFallbackWelcomeMessage(difficulty);
    }

    try {
      const systemPrompt = `You are Coach B, an expert chess coach, welcoming a student to a personal chess training session. Create an encouraging, motivating welcome message that sets the tone for learning.

Your welcome style:
- Warm and encouraging
- Briefly explain what they'll learn
- Appropriate for ${difficulty} level players  
- Keep it conversational and personal
- Limit to 2-3 sentences
- Make them excited to play and learn`;

      const userPrompt = `Welcome a ${difficulty} level chess student to a new training session. Make them feel comfortable and excited to learn.`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 120,
        temperature: 0.8
      });

      return {
        message: response.choices[0].message.content.trim(),
        coach: 'Coach B',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('Groq API error for welcome message:', error);
      return this.getFallbackWelcomeMessage(difficulty);
    }
  }

  /**
   * Fallback welcome message when API is not available
   */
  getFallbackWelcomeMessage(difficulty) {
    const welcomeMessages = {
      beginner: "Welcome! I'm Coach B, excited to help you start your chess journey. We'll focus on fundamental principles and build your confidence step by step.",
      intermediate: "Great to see you here! I'm Coach B, and let's work on improving your tactical vision and positional understanding through some instructive play.", 
      advanced: "Welcome to our training session! I'm Coach B, and I'll challenge you with complex positions and help refine your strategic thinking."
    };

    return {
      message: welcomeMessages[difficulty] || welcomeMessages.intermediate,
      coach: 'Coach B',
      timestamp: new Date().toISOString(),
      fallback: true
    };
  }

  /**
   * Fallback coaching when API is not available
   */
  getFallbackCoaching(playerMove) {
    const fallbackMessages = [
      "Good move! Keep developing your pieces and controlling the center.",
      "Nice! Remember to think about piece safety and development.",
      "Well played! Focus on improving your piece coordination.",
      "Excellent! Continue to look for tactics and improving your position.",
      "Great choice! Keep building your position and looking for opportunities."
    ];

    return {
      message: fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)],
      coach: 'Coach B',
      timestamp: new Date().toISOString(),
      fallback: true
    };
  }

  /**
   * Fallback hint when API is not available
   */
  getFallbackHint() {
    const fallbackHints = [
      "Look for the most forcing moves - checks, captures, and threats!",
      "Consider improving your worst-placed piece.",
      "Think about controlling key squares and improving coordination.",
      "Look for tactical patterns like pins, forks, and skewers.",
      "Focus on piece activity and central control."
    ];

    return {
      message: fallbackHints[Math.floor(Math.random() * fallbackHints.length)],
      type: 'hint',
      coach: 'Coach B',
      timestamp: new Date().toISOString(),
      fallback: true
    };
  }

  /**
   * Fallback blunder analysis when API is not available
   */
  getFallbackBlunderAnalysis(evaluationChange, isUserBlunder = true) {
    const userBlunderMessages = [
      "That move gave your opponent an advantage. Try to double-check for tactics before moving!",
      "Oops! Look for checks, captures, and threats before making your next move.",
      "That wasn't ideal. Remember to ask: 'What is my opponent threatening?' before moving.",
      "Let's learn from that! Always scan for hanging pieces and tactical threats."
    ];

    const engineBlunderMessages = [
      "Great! The computer just gave you a chance. Look for the most forcing moves!",
      "Opportunity! The engine made a mistake. Can you find the strong response?",
      "Nice! You have a tactical opportunity here. Look for checks, captures, and threats!",
      "The computer slipped up! Time to find your best move and seize the advantage."
    ];

    const messages = isUserBlunder ? userBlunderMessages : engineBlunderMessages;

    return {
      message: messages[Math.floor(Math.random() * messages.length)],
      type: 'blunder_analysis',
      coach: 'Coach B',
      timestamp: new Date().toISOString(),
      evaluationChange,
      isUserBlunder,
      fallback: true
    };
  }

  /**
   * Helper method to determine if a move is a blunder
   * @param {number} evaluationChange - Change in position evaluation
   * @param {string} gamePhase - Current phase of the game
   * @returns {boolean} True if the move is considered a blunder
   */
  static isBlunder(evaluationChange, gamePhase = 'middlegame') {
    // Negative evaluation change means position got worse for the player
    if (evaluationChange >= 0) return false;
    
    const thresholds = {
      'opening': 150,     // More forgiving in opening
      'middlegame': 100,  // Standard threshold
      'endgame': 80       // Less forgiving in endgame
    };
    
    const threshold = thresholds[gamePhase] || thresholds['middlegame'];
    return Math.abs(evaluationChange) >= threshold;
  }

  /**
   * Helper method to determine if an evaluation change is significant
   * @param {number} evaluationChange - Change in position evaluation
   * @returns {boolean} True if the change warrants attention
   */
  static isSignificantChange(evaluationChange) {
    // Any change of 50+ centipawns is worth noting
    return Math.abs(evaluationChange) >= 50;
  }

  /**
   * Helper method to detect tactical patterns in position
   * @param {Chess} game - Chess.js game instance
   * @returns {Array} List of detected patterns
   */
  static detectTacticalPatterns(game) {
    const patterns = [];
    const position = game.fen();
    
    // Check for pins, forks, skewers etc.
    // This is a simplified version - real implementation would be more complex
    if (game.inCheck()) {
      patterns.push('check');
    }
    
    // Look for pieces that can be captured
    const moves = game.moves({ verbose: true });
    const captures = moves.filter(move => move.captured);
    if (captures.length > 0) {
      patterns.push('tactical_shots');
    }
    
    return patterns;
  }

  /**
   * Analyze PGN context to extract strategic insights
   */
  analyzePGNContext(pgn, gamePhase, playerColor) {
    if (!pgn || pgn.length < 50) {
      return {
        insights: 'Limited game history available for analysis.',
        keyThemes: [],
        openingType: 'Unknown'
      };
    }

    const insights = [];
    const keyThemes = [];
    
    // Extract opening information
    let openingType = 'Standard';
    if (pgn.includes('1.e4')) {
      openingType = 'King\'s Pawn';
      insights.push('King\'s pawn opening - focus on central control and rapid development');
    } else if (pgn.includes('1.d4')) {
      openingType = 'Queen\'s Pawn';
      insights.push('Queen\'s pawn opening - strategic game with positional themes');
    } else if (pgn.includes('1.Nf3') || pgn.includes('1.c4')) {
      openingType = 'Hypermodern';
      insights.push('Hypermodern opening - controlling center from distance');
    }

    // Analyze tactical themes
    if (pgn.includes('x')) {
      keyThemes.push('captures');
      insights.push('Active piece exchanges - material balance is important');
    }
    
    if (pgn.includes('+')) {
      keyThemes.push('checks');
      insights.push('Tactical game with checking sequences - king safety is crucial');
    }
    
    if (pgn.includes('O-O')) {
      keyThemes.push('castling');
      insights.push('Both sides have prioritized king safety through castling');
    }
    
    if (pgn.includes('=Q')) {
      keyThemes.push('promotion');
      insights.push('Pawn promotion themes - endgame conversion is key');
    }

    // Analyze game flow
    const moveCount = (pgn.match(/\d+\./g) || []).length;
    if (gamePhase === 'opening' && moveCount > 10) {
      insights.push('Extended opening phase - focus on completing development');
    } else if (gamePhase === 'middlegame') {
      insights.push('Critical middlegame - tactical awareness and strategic planning essential');
    } else if (gamePhase === 'endgame') {
      insights.push('Endgame phase - technique and precise calculation required');
    }

    return {
      insights: insights.join('. ') + '.',
      keyThemes,
      openingType,
      moveCount
    };
  }

  /**
   * Generate AI chat response for general chess discussions
   */
  async generateChatResponse(message, context = {}) {
    if (!this.isConfigured()) {
      console.warn('Groq API key not configured, using fallback chat response');
      return this.getFallbackChatResponse();
    }

    try {
      const {
        user = {},
        session = {},
        userGames = [],
        gameContext = ''
      } = context;

      // Build comprehensive context for the AI
      const gamesHistoryContext = userGames.length > 0 ? `

USER'S GAME HISTORY (${userGames.length} games):
${userGames.slice(0, 10).map(game => 
  `- ${game.gameType} vs ${game.opponent || 'AI'}: ${game.result || 'Ongoing'} (${game.accuracy ? game.accuracy + '% accuracy' : 'No accuracy data'})`
).join('\n')}

RECENT PATTERNS:
- Total Games: ${userGames.length}
- Average Accuracy: ${this.calculateAverageAccuracy(userGames)}%
- Main Game Types: ${this.getMainGameTypes(userGames)}
- Common Openings: ${this.getCommonOpenings(userGames)}` : '';

      const systemPrompt = `You are Coach B, an expert chess coach and analyst powered by Groq LLaMA. You have access to the user's complete game history and can provide detailed insights.

USER PROFILE:
- Name: ${user.name || 'Player'}
- Email: ${user.email || 'Not provided'}
- Lichess Username: ${user.lichessUsername || 'Not connected'}

SESSION TYPE: ${session.sessionType || 'general'}
${gameContext}${gamesHistoryContext}

Your coaching style as Coach B:
- Analyze patterns across the user's games to provide personalized insights
- Provide specific, actionable advice based on their playing history
- Reference actual games and positions when relevant
- Be encouraging but honest about areas for improvement
- Use the user's game history to personalize recommendations
- When discussing specific games, cite the PGN or moves
- Focus on long-term improvement and understanding
- Draw connections between games to identify patterns
- Provide tactical and strategic guidance
- Help with opening preparation, middlegame planning, and endgame technique

Keep responses conversational, insightful, and educational. You are powered by Groq's advanced LLaMA model for superior chess understanding.`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 600,
        temperature: 0.7,
        top_p: 0.9
      });

      return {
        message: response.choices[0].message.content.trim(),
        messageType: 'text',
        metadata: {
          gamesAnalyzed: userGames.length,
          hasGameContext: !!gameContext,
          sessionType: session.sessionType || 'general',
          model: this.model,
          service: 'groq'
        }
      };

    } catch (error) {
      console.error('Groq API error for chat:', error);
      return this.getFallbackChatResponse();
    }
  }

  /**
   * Fallback response for chat when Groq is not available
   */
  getFallbackChatResponse() {
    const fallbackResponses = [
      "I'm Coach B, here to help analyze your chess games and provide improvement suggestions. What specific aspect would you like to work on?",
      "Based on your games, I can help identify patterns and areas for improvement. What would you like to explore?",
      "I'm having trouble connecting to my AI service right now, but I'm ready to help with your chess analysis. Could you try rephrasing your question?",
      "Let me help you improve your chess! I can analyze your games, identify patterns, and suggest specific areas to focus on.",
      "I'm Coach B, powered by advanced AI. I'm here to help you become a stronger chess player through personalized analysis."
    ];

    return {
      message: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
      messageType: 'text',
      metadata: { 
        fallback: true,
        service: 'groq-fallback' 
      }
    };
  }

  /**
   * Helper functions for game analysis
   */
  calculateAverageAccuracy(games) {
    const gamesWithAccuracy = games.filter(game => game.accuracy !== null && game.accuracy !== undefined);
    if (gamesWithAccuracy.length === 0) return 0;
    
    const sum = gamesWithAccuracy.reduce((acc, game) => acc + game.accuracy, 0);
    return Math.round(sum / gamesWithAccuracy.length);
  }

  getMainGameTypes(games) {
    const typeCounts = {};
    games.forEach(game => {
      const type = game.gameType || 'Unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    return Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => `${type} (${count})`)
      .join(', ') || 'Various game types';
  }

  getCommonOpenings(games) {
    const openingCounts = {};
    games.forEach(game => {
      const opening = game.opening || 'Unknown';
      if (opening !== 'Unknown') {
        openingCounts[opening] = (openingCounts[opening] || 0) + 1;
      }
    });
    
    return Object.entries(openingCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([opening, count]) => `${opening} (${count})`)
      .join(', ') || 'Various openings';
  }

  /**
   * Determine game phase based on move count
   */
  determineGamePhase(moveCount) {
    if (moveCount < 20) return 'opening';
    if (moveCount < 40) return 'middlegame';
    return 'endgame';
  }
}

const groqServiceInstance = new GroqService();

// Make static methods accessible on the instance for route access
groqServiceInstance.isBlunder = GroqService.isBlunder;
groqServiceInstance.isSignificantChange = GroqService.isSignificantChange;

module.exports = groqServiceInstance;
