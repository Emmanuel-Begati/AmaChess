const OpenAI = require('openai');
const { Chess } = require('chess.js');

class OpenAIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    // Use GPT-4o for enhanced chess understanding and coaching
    this.model = 'gpt-4o';
  }

  isConfigured() {
    return this.client.apiKey && 
           this.client.apiKey !== 'your-openai-api-key-here' &&
           this.client.apiKey && 
           this.client.apiKey.length > 20;
  }

  /**
   * Generate chess coaching advice based on the current position and move
   */
  async generateChessCoaching(position, playerMove, gameContext = {}) {
    if (!this.isConfigured()) {
      console.warn('OpenAI API key not configured, using fallback coaching');
      return this.getFallbackCoaching(playerMove);
    }

    try {
      const chess = new Chess(position);
      const moveHistory = gameContext.moveHistory || [];
      const difficulty = gameContext.difficulty || 'intermediate';
      const isAIMove = gameContext.isAIMove || false;
      
      // Create context about the position
      const positionInfo = this.analyzePosition(chess);
      
      let systemPrompt;
      let userPrompt;

      if (isAIMove) {
        // AI explaining its own move
        systemPrompt = `You are Magnus Carlsen, the world chess champion, acting as a personal chess coach. You just made a move and need to explain your reasoning to help the student understand.

Your teaching style:
- Clear and educational explanations
- Focus on the strategic/tactical reasons for the move
- Keep it appropriate for ${difficulty} level players
- Be encouraging and supportive
- Limit to 2-3 sentences
- Stay in character as Magnus

Current position analysis:
- Game phase: ${positionInfo.phase}
- Material balance: ${positionInfo.materialBalance > 0 ? 'White ahead' : positionInfo.materialBalance < 0 ? 'Black ahead' : 'Equal material'}
- Key features: ${positionInfo.keyFeatures.join(', ') || 'Balanced position'}`;

        userPrompt = `I just played ${playerMove}. Explain briefly why this was a good move and what strategic/tactical idea it accomplishes.`;
      } else {
        // Coaching the human player's move
        systemPrompt = `You are Magnus Carlsen, the world chess champion, acting as a personal chess coach. Analyze the student's move and provide encouraging, educational feedback.

Your coaching style:
- Always be positive and encouraging
- Point out what was good about the move
- Gently suggest improvements if needed
- Focus on learning opportunities
- Keep it appropriate for ${difficulty} level
- Limit to 2-3 sentences
- Stay in character as Magnus

Current position analysis:
- Game phase: ${positionInfo.phase}  
- Move number: ${Math.floor(moveHistory.length / 2) + 1}
- Material balance: ${positionInfo.materialBalance > 0 ? 'White ahead' : positionInfo.materialBalance < 0 ? 'Black ahead' : 'Equal material'}
- Key features: ${positionInfo.keyFeatures.join(', ') || 'Balanced position'}
- Tactical opportunities: ${positionInfo.tactics.length > 0 ? positionInfo.tactics.join(', ') : 'None obvious'}`;

        userPrompt = playerMove 
          ? `The student just played ${playerMove}. Provide encouraging feedback on this move and suggest what they should think about next.`
          : `This is the starting position. Provide opening advice and encourage the student to make a good first move.`;
      }

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

      const message = response.choices[0].message.content.trim();

      return {
        message,
        coach: 'Coach B',
        timestamp: new Date().toISOString(),
        positionAnalysis: positionInfo
      };

    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to basic coaching
      return this.getFallbackCoaching(playerMove);
    }
  }

  /**
   * Generate chess coaching hints with PGN context
   */
  async generateHint(position, gameContext = {}) {
    if (!this.isConfigured()) {
      console.warn('OpenAI API key not configured, using fallback hint');
      return this.getFallbackHint();
    }

    try {
      const chess = new Chess(position);
      const positionInfo = this.analyzePosition(chess);
      const difficulty = gameContext.difficulty || 'intermediate';
      const pgn = gameContext.pgn || '';
      const moveHistory = gameContext.moveHistory || [];

      const systemPrompt = `You are Coach B, an expert chess coach. Give strategic hints to help the student find good moves without revealing the exact solution.

Your hint style:
- Guide toward good principles without giving exact moves
- Encourage tactical awareness and pattern recognition
- Use questions to make the student think
- Keep it appropriate for ${difficulty} level
- Be encouraging and educational
- Limit to 1-2 sentences maximum
- Consider the game context and previous moves

Position analysis:
- Game phase: ${positionInfo.phase}
- Key features: ${positionInfo.keyFeatures.join(', ') || 'Balanced position'}
- Available tactics: ${positionInfo.tactics.length > 0 ? positionInfo.tactics.join(', ') : 'Look deeper'}
- Material balance: ${positionInfo.materialBalance === 0 ? 'Equal' : positionInfo.materialBalance > 0 ? 'White ahead' : 'Black ahead'}

${pgn ? `Game context (PGN): ${pgn.slice(-200)}` : ''}
${moveHistory.length > 0 ? `Recent moves: ${moveHistory.slice(-6).join(' ')}` : ''}`;

      const userPrompt = `Give me a strategic hint for this position: ${position}. Help me think about what to look for without revealing the best move.`;

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
        type: 'hint',
        coach: 'Coach B',
        timestamp: new Date().toISOString(),
        positionAnalysis: positionInfo
      };

    } catch (error) {
      console.error('OpenAI API error for hint:', error);
      return this.getFallbackHint();
    }
  }

  /**
   * Analyze a blunder and provide targeted coaching
   */
  async analyzeBlunder(position, playerMove, evaluationChange, gameContext = {}) {
    if (!this.isConfigured()) {
      console.warn('OpenAI API key not configured, using fallback blunder analysis');
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
      console.error('OpenAI API error for blunder analysis:', error);
      return this.getFallbackBlunderAnalysis(evaluationChange, isUserBlunder);
    }
  }

  /**
   * Generate hints with full game context (PGN)
   */
  async generateContextualHint(position, gameContext = {}) {
    if (!this.isConfigured()) {
      console.warn('OpenAI API key not configured, using fallback hint');
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
      console.error('OpenAI API error for contextual hint:', error);
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
      console.warn('OpenAI API key not configured, using fallback welcome');
      return this.getFallbackWelcomeMessage(difficulty);
    }

    try {
      const systemPrompt = `You are Magnus Carlsen, the world chess champion, welcoming a student to a personal chess training session. Create an encouraging, motivating welcome message that sets the tone for learning.

Your welcome style:
- Warm and encouraging
- Briefly explain what they'll learn
- Appropriate for ${difficulty} level players  
- Keep it conversational and personal
- Limit to 2-3 sentences
- Stay in character as Magnus
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
        coach: 'Magnus Carlsen',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('OpenAI API error for welcome message:', error);
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
}

module.exports = new OpenAIService();
