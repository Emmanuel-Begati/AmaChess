const Groq = require('groq-sdk');
const LichessService = require('./lichessService');

class InsightsService {
  constructor() {
    this.lichessService = new LichessService();
    this.insightsCache = new Map();
    this.CACHE_TTL = 15 * 60 * 1000; // 15 minutes

    // Reuse the same Groq client configuration as openaiService
    if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your-groq-api-key-here') {
      this.groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
      this.model = 'llama-3.3-70b-versatile';
    } else {
      this.groqClient = null;
      this.model = null;
      console.warn('⚠️  InsightsService: Groq API key not configured. AI insights will use fallback.');
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  CORE: Compute all stats directly from raw Lichess game JSON
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Get the user's color for a specific game.
   */
  _getUserColor(game, username) {
    const uLower = username.toLowerCase();
    if (game.players.white?.user?.name?.toLowerCase() === uLower) return 'white';
    if (game.players.black?.user?.name?.toLowerCase() === uLower) return 'black';
    return 'white'; // fallback
  }

  /**
   * Map a rating to a tier label matching the knowledge base.
   */
  _getRatingTier(rating) {
    if (!rating || rating < 1000) return 'Beginner (Under 1000)';
    if (rating < 1200) return 'Novice (1000-1200)';
    if (rating < 1400) return 'Intermediate (1200-1400)';
    if (rating < 1600) return 'Club Player (1400-1600)';
    if (rating < 1800) return 'Advanced (1600-1800)';
    if (rating < 2000) return 'Expert (1800-2000)';
    return 'Candidate Master (2000+)';
  }

  /**
   * Compute accurate stats directly from the raw Lichess game array.
   * This avoids the bugs in the legacy analyzeBulkGames method.
   */
  _computeStatsFromGames(games, username) {
    let wins = 0, losses = 0, draws = 0;
    let totalRatingDiff = 0;
    const accuracies = [];
    let blunders = 0, mistakes = 0, inaccuracies = 0;
    const openingCounts = {};
    const ratings = [];

    for (const game of games) {
      const userColor = this._getUserColor(game, username);
      const opponentColor = userColor === 'white' ? 'black' : 'white';

      // Win / Loss / Draw
      if (!game.winner) {
        draws++;
      } else if (game.winner === userColor) {
        wins++;
      } else {
        losses++;
      }

      // Rating diff (per-game, already accounts for color)
      const diff = game.players[userColor]?.ratingDiff;
      if (typeof diff === 'number') totalRatingDiff += diff;

      // User's rating in this game
      const rating = game.players[userColor]?.rating;
      if (typeof rating === 'number') ratings.push(rating);

      // Accuracy (only available for analysed games)
      const acc = game.accuracy?.[userColor];
      if (typeof acc === 'number') accuracies.push(acc);

      // Blunders / Mistakes / Inaccuracies from move-level analysis
      if (Array.isArray(game.analysis)) {
        // analysis array alternates white/black moves (index 0 = white move 1, etc.)
        for (let i = 0; i < game.analysis.length; i++) {
          const move = game.analysis[i];
          // Even indices = white's moves, odd = black's moves
          const moveColor = i % 2 === 0 ? 'white' : 'black';
          if (moveColor !== userColor) continue;
          if (!move?.judgment) continue;

          const name = move.judgment.name;
          if (name === 'Blunder') blunders++;
          else if (name === 'Mistake') mistakes++;
          else if (name === 'Inaccuracy') inaccuracies++;
        }
      }

      // Opening tracking
      const openingName = game.opening?.name || 'Unknown';
      if (!openingCounts[openingName]) {
        openingCounts[openingName] = { games: 0, wins: 0 };
      }
      openingCounts[openingName].games++;
      if (game.winner === userColor) openingCounts[openingName].wins++;
    }

    const totalGames = games.length;
    const avgAccuracy = accuracies.length > 0
      ? Math.round((accuracies.reduce((s, a) => s + a, 0) / accuracies.length) * 10) / 10
      : null;
    const avgRating = ratings.length > 0
      ? Math.round(ratings.reduce((s, r) => s + r, 0) / ratings.length)
      : 0;

    // Top openings sorted by frequency
    const topOpenings = Object.entries(openingCounts)
      .map(([name, data]) => ({
        name,
        games: data.games,
        winRate: data.games > 0 ? Math.round((data.wins / data.games) * 100) : 0
      }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 3);

    return {
      gamesAnalyzed: totalGames,
      wins,
      losses,
      draws,
      winRate: totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0,
      lossRate: totalGames > 0 ? Math.round((losses / totalGames) * 100) : 0,
      drawRate: totalGames > 0 ? Math.round((draws / totalGames) * 100) : 0,
      overallAccuracy: avgAccuracy,        // null if no accuracy data available
      hasAccuracyData: accuracies.length > 0,
      averageRating: avgRating,
      ratingProgress: totalRatingDiff,     // net rating change across all games
      totalBlunders: blunders,
      totalMistakes: mistakes,
      totalInaccuracies: inaccuracies,
      hasAnalysisData: blunders + mistakes + inaccuracies > 0,
      mostPlayedOpening: topOpenings.length > 0 ? topOpenings[0].name : 'Varied',
      topOpenings
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  PUBLIC: Generate dashboard insights
  // ──────────────────────────────────────────────────────────────────────────

  async generateDashboardInsights(lichessUsername, forceRefresh = false) {
    const cacheKey = `insights_${lichessUsername.toLowerCase()}`;
    if (!forceRefresh) {
      const cached = this.insightsCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        console.log(`✅ Cache hit for insights: ${lichessUsername}`);
        return { ...cached.data, cached: true };
      }
    }

    console.log(`🔍 Generating dashboard insights for: ${lichessUsername}`);
    const startTime = Date.now();

    // Step 1: Fetch the last 10 games (with evals, clocks, accuracy, openings)
    const games = await this.lichessService.getUserGames(lichessUsername, 10);

    if (!games || games.length === 0) {
      return {
        insight: {
          message: "No recent games found on Lichess. Play some rated games and come back for personalized coaching insights!",
          coach: 'Coach B',
          type: 'no_data'
        },
        analysis: null,
        gamesAnalyzed: 0,
        cached: false
      };
    }

    // Step 2: Compute accurate stats directly from raw game data
    const stats = this._computeStatsFromGames(games, lichessUsername);

    // Step 3: Build per-game detail for the LLM prompt
    const perGameDetails = this._buildPerGameDetails(games, lichessUsername);

    // Step 4: Build the LLM summary combining stats + per-game details
    const summary = { ...stats, recentResults: perGameDetails };

    // Step 5: Generate coaching insight + puzzle theme recommendations in parallel
    const [insight, recommendedThemes] = await Promise.all([
      this._generateInsightWithGroq(summary, lichessUsername),
      this._generatePuzzleRecommendations(summary)
    ]);

    const result = {
      insight,
      analysis: stats,
      recommendedThemes,
      gamesAnalyzed: games.length,
      generatedAt: new Date().toISOString(),
      generationTimeMs: Date.now() - startTime,
      cached: false
    };

    // Cache the result
    this.insightsCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    console.log(`✅ Dashboard insights generated for ${lichessUsername} in ${Date.now() - startTime}ms`);
    return result;
  }

  /**
   * Build per-game detail array for the LLM prompt, including critical moments.
   */
  _buildPerGameDetails(games, username) {
    return games.map(game => {
      const userColor = this._getUserColor(game, username);
      const opponentColor = userColor === 'white' ? 'black' : 'white';
      const result = !game.winner ? 'Draw' : (game.winner === userColor ? 'Win' : 'Loss');
      const accuracy = game.accuracy?.[userColor];
      const ratingDiff = game.players[userColor]?.ratingDiff || 0;
      const opponentRating = game.players[opponentColor]?.rating || '?';
      const opening = game.opening?.name || 'Unknown';
      const timeControl = game.speed || 'unknown';

      // Extract critical blunder/mistake moments from engine analysis
      const criticalMoments = this._extractCriticalMoments(game, userColor);

      // Determine total moves by the user
      const moves = game.moves ? game.moves.split(' ') : [];
      const totalMoves = Math.ceil(moves.length / 2);

      return {
        result,
        accuracy: typeof accuracy === 'number' ? `${Math.round(accuracy)}%` : 'N/A',
        ratingChange: ratingDiff > 0 ? `+${ratingDiff}` : `${ratingDiff}`,
        opponentRating,
        opening,
        timeControl,
        totalMoves,
        criticalMoments
      };
    });
  }

  /**
   * Extract critical moments (blunders/mistakes) from engine analysis.
   * Returns concise descriptions of the worst errors per game.
   */
  _extractCriticalMoments(game, userColor) {
    const moments = [];
    if (!Array.isArray(game.analysis)) return moments;

    const moves = game.moves ? game.moves.split(' ') : [];
    const clocks = game.clocks || [];

    for (let i = 0; i < game.analysis.length; i++) {
      const move = game.analysis[i];
      const moveColor = i % 2 === 0 ? 'white' : 'black';
      if (moveColor !== userColor) continue;
      if (!move?.judgment) continue;

      const severity = move.judgment.name; // 'Blunder', 'Mistake', 'Inaccuracy'
      if (severity !== 'Blunder' && severity !== 'Mistake') continue;

      // The move number in chess terms (1-indexed)
      const moveNumber = Math.floor(i / 2) + 1;
      // The actual move played
      const movePlayed = moves[i] || '?';
      // The best move suggested by engine
      const bestMove = move.best || null;
      // Evaluation difference
      const evalBefore = game.analysis[i - (moveColor === 'white' ? 0 : 1)];
      
      // Determine game phase by move number
      let phase;
      if (moveNumber <= 10) phase = 'opening';
      else if (moveNumber <= 30) phase = 'middlegame';
      else phase = 'endgame';

      // Check time pressure (clock data is in centiseconds, alternating white/black)
      let timePressure = false;
      if (clocks.length > i) {
        const clockTime = clocks[i] / 100; // convert to seconds
        timePressure = clockTime < 30; // under 30 seconds = time pressure
      }

      // Eval drop magnitude
      const evalDrop = move.judgment.comment || '';

      moments.push({
        moveNumber,
        phase,
        severity,
        movePlayed,
        bestMove,
        timePressure,
        evalDrop
      });

      // Cap at 3 critical moments per game to keep prompt manageable
      if (moments.length >= 3) break;
    }

    return moments;
  }

  /**
   * Build a formatted section of critical moments for the LLM prompt.
   * Aggregates blunders/mistakes across all games into a concise summary.
   */
  _buildCriticalMomentsSection(recentResults) {
    const allMoments = [];
    const phaseCounts = { opening: 0, middlegame: 0, endgame: 0 };
    let timePressureBlunders = 0;
    let totalBlunderMoments = 0;

    recentResults.forEach((game, gameIdx) => {
      if (!game.criticalMoments || game.criticalMoments.length === 0) return;
      game.criticalMoments.forEach(m => {
        phaseCounts[m.phase]++;
        if (m.timePressure) timePressureBlunders++;
        if (m.severity === 'Blunder') totalBlunderMoments++;

        const bestInfo = m.bestMove ? ` (engine suggests ${m.bestMove})` : '';
        const timeInfo = m.timePressure ? ' [TIME PRESSURE]' : '';
        allMoments.push(`  Game ${gameIdx + 1}, move ${m.moveNumber} (${m.phase}): ${m.severity} — played ${m.movePlayed}${bestInfo}${timeInfo}`);
      });
    });

    if (allMoments.length === 0) {
      return 'DEEP GAME ANALYSIS: No engine analysis available for these games. Focus on general patterns from the stats above.';
    }

    // Build pattern summary
    const worstPhase = Object.entries(phaseCounts).sort((a, b) => b[1] - a[1])[0];
    const patterns = [];
    if (worstPhase[1] > 0) patterns.push(`Most errors in the ${worstPhase[0]} (${worstPhase[1]} total)`);
    if (timePressureBlunders > 0) patterns.push(`${timePressureBlunders} errors occurred under time pressure (<30s)`);
    if (totalBlunderMoments > 0) patterns.push(`${totalBlunderMoments} were serious blunders`);

    return `DEEP GAME ANALYSIS — Critical errors from recent games:
${allMoments.join('\n')}

Patterns detected: ${patterns.join('. ') || 'No strong patterns detected.'}`;
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  GROQ PROMPTING
  // ──────────────────────────────────────────────────────────────────────────

  async _generateInsightWithGroq(summary, username) {
    if (!this.groqClient) {
      return this._getFallbackInsight(summary);
    }

    try {
      const accuracyLine = summary.overallAccuracy !== null
        ? `Overall Accuracy: ${summary.overallAccuracy}% (from ${summary.hasAccuracyData ? 'analysed' : 'no'} games)`
        : 'Overall Accuracy: Not available (games have not been computer-analysed on Lichess)';

      const blunderLine = summary.hasAnalysisData
        ? `Blunders: ${summary.totalBlunders} | Mistakes: ${summary.totalMistakes} | Inaccuracies: ${summary.totalInaccuracies}`
        : 'Blunder/Mistake data: Not available (games were not computer-analysed on Lichess)';

      const playerTier = this._getRatingTier(summary.averageRating);

      const systemPrompt = `You are Coach B, a world-class personal chess coach for AmaChess. You deeply understand chess improvement science from the best coaches and authors (Silman, Dvoretsky, Seirawan, Heisman, de la Maza, Yusupov). You analyze a student's SPECIFIC game data to give them the ONE insight that will help them improve the most RIGHT NOW.

═══════════════════════════════════════════════════════════
CHESS IMPROVEMENT KNOWLEDGE BASE
═══════════════════════════════════════════════════════════

RATING TIER PRIORITIES (apply the tier matching the player's rating):

BEGINNER (Under 1000):
- #1 priority: Stop hanging pieces. Learn to check if a square is attacked before moving there.
- Learn basic checkmate patterns (back rank, queen+king, rook+king).
- Opening: Just follow 3 rules — control the center, develop all pieces, castle early. No specific openings.
- Endgame: King + Queen vs King, King + Rook vs King.
- Biggest issue: Leaving pieces en prise (undefended). Every blunder at this level = free piece.

NOVICE (1000-1200):
- #1 priority: Basic tactics — forks, pins, skewers. Solve 10-15 puzzles daily.
- Learn to count attackers vs defenders before captures.
- Opening: Choose ONE opening as White and ONE defense as Black. Stick with them for months.
- Endgame: King+Pawn endings (opposition, passed pawns). Lucena and Philidor positions.
- Common mistake: Playing too fast. Slow down, use the clock, check for blunders before clicking.

INTERMEDIATE (1200-1400):
- #1 priority: Pattern recognition through puzzle volume. Solve 15-20 puzzles daily.
- Learn the most common tactical motifs: discovered attacks, double attacks, removing the defender, deflection.
- Calculation: Practice seeing 2 moves ahead consistently before trying 3.
- Opening: Deepen understanding of your ONE opening. Learn the IDEAS, not memorize 15 moves of theory.
- Endgame: Rook endgames (7th rank, passed pawns, active king). Basic bishop vs knight understanding.
- Common mistake: Studying openings instead of tactics. Openings don't matter if you blunder a piece on move 15.

CLUB PLAYER (1400-1600):
- #1 priority: Eliminate blunders through "blunder check" habit — before every move, ask "does this hang anything?"
- Deepen tactical ability: interference, intermezzo, quiet moves in combinations.
- Calculation: Aim for reliable 3-move calculation. Practice candidate moves.
- Opening: Still stick to 1-2 openings, but now study the typical middlegame plans that arise from them.
- Endgame: Opposite-colored bishop endgames, knight endgames, basic rook+pawn vs rook.
- Positional concepts: Piece activity, weak squares, pawn structure basics.
- Common mistake: Switching openings every week. Depth beats breadth.

ADVANCED (1600-1800):
- #1 priority: Positional understanding — weak pawns, outposts, good vs bad bishops, pawn structures.
- Tactics still matter: sacrificial combinations, long forcing sequences.
- Calculation: 3-4 moves deep reliably. Practice visualizing the board after moves.
- Opening: Can maintain a small repertoire (2-3 openings as White, 2 defenses as Black). Study model games in your openings.
- Endgame: Complex rook endings, minor piece endgames, pawn race calculations.
- Game review is CRITICAL at this level: annotate your own games without an engine first, then compare.
- Common mistake: Neglecting endgames. Many games are lost by failing to convert winning endgames.

EXPERT (1800-2000):
- #1 priority: Deep strategic understanding — prophylaxis, planning, pawn structure mastery.
- Opening preparation now matters: learn 5-8 moves of theory in your lines + understand resulting structures.
- Calculation: 4-5 moves deep. Practice complex positions with multiple candidate moves.
- Endgame: Theoretical endgames (Vancura, Lucena variations), queen endgames, complex pieces.
- Study master games in your own openings for strategic patterns.
- Common mistake: Over-relying on tactics while ignoring slow positional play.

CANDIDATE MASTER (2000+):
- Deep opening preparation is important. Study specific theoretical lines and novelties.
- Master strategic concepts: dynamic vs static advantages, piece coordination, advanced prophylaxis.
- Endgame precision is crucial — study Dvoretsky's Endgame Manual.
- Work on competitive psychology: tournament preparation, energy management, handling time pressure.

═══════════════════════════════════════════════════════════
UNIVERSAL IMPROVEMENT PRINCIPLES
═══════════════════════════════════════════════════════════

TACTICS:
- Tactics determine 70%+ of games below 2000. They should be 50%+ of training time.
- Puzzle solving should be deliberate: don't rush, find ALL candidate moves, then choose.
- Pattern recognition improves through volume — consistency (daily) matters more than marathon sessions.

ENDGAMES:
- "The endgame is where games are won and lost." Study endgames BEFORE openings at every level.
- Priority order: K+P, Rook endings, Bishop endings, Knight endings, Queen endings.
- A player who is strong in endgames can play for draws against stronger opponents and convert against weaker ones.

OPENINGS:
- Below 1600: Opening PRINCIPLES only. Don't memorize — understand WHY moves are played.
- "Stick to one opening" — building deep understanding of one opening's middlegame plans > knowing 5 openings superficially.
- The opening you play matters far less than whether you understand the resulting positions.
- Don't change openings after a loss. The loss was likely a tactical or middlegame error, not an opening problem.

CALCULATION:
- The #1 skill separator between rating levels is calculation depth.
- Practice: pick a position, calculate without moving pieces, then verify with engine.
- "When you see a good move, look for a better one." — Emanuel Lasker
- Forcing moves first: checks, captures, threats — evaluate these before quiet moves in calculations.

TIME MANAGEMENT:
- Blitz/bullet is fun but teaches bad habits. For improvement, play rapid (10+0 or 15+10).
- Spend more time in CRITICAL positions (tactics, move 15-25), less in the opening.
- If a player's blunders cluster at low clock times, time management — not chess knowledge — is the issue.
- Use increment time controls to avoid pure time scrambles.

GAME REVIEW:
- Review losses with this process: (1) without engine, find where you went wrong, (2) check with engine, (3) study the correct idea.
- Focus on "critical moments" — the 2-3 positions where the evaluation swung the most.
- Don't just learn the correct move — understand the PRINCIPLE behind it.

PSYCHOLOGY:
- Tilt (emotional frustration after a loss) causes rating drops. Stop playing after 2 consecutive losses.
- "Every master was once a disaster." — consistency and patience drive improvement.
- Focus on the PROCESS (did I think through the position?) not the RESULT (did I win?).

PRACTICE BALANCE BY LEVEL:
- Below 1400: 60% puzzles, 20% playing games, 15% endgame study, 5% opening review
- 1400-1800: 40% puzzles, 25% games (reviewed after), 20% endgame/positional study, 15% opening study
- 1800+: 30% puzzles, 25% games, 25% opening preparation, 20% endgame/strategy study

═══════════════════════════════════════════════════════════
YOUR COACHING STYLE
═══════════════════════════════════════════════════════════

- You are speaking directly to YOUR student. Be warm, personal, and encouraging.
- NEVER call the student by their tier label (e.g., "Club Player", "Candidate Master", "Novice", "Intermediate"). Those labels are for YOUR internal reference only — the student should never see them. Just speak naturally to them as a coach would.
- Reference their SPECIFIC data — actual blunder counts, win rates, rating changes, critical moment details.
- Identify their ONE biggest strength (be genuine, find something positive in their data).
- Identify the ONE thing that will improve their rating the most RIGHT NOW based on their tier.
- Give ONE concrete, actionable recommendation they can start TODAY (e.g., "solve 15 puzzles focusing on pins before your next game").
- Keep your response to 3-4 sentences, written as natural conversational paragraphs. NO bullet points.
- If their game data shows blunders in a specific phase (opening/middlegame/endgame), reference that specifically.
- If their blunders happen under time pressure, address time management — not just chess skill.
- End with genuine encouragement tied to their data (e.g., "that +34 rating climb shows real progress").
- NEVER make openings the primary topic for players under 1800 unless the data strongly warrants it.`;

      const userPrompt = `PLAYER PROFILE:
Rating: ${summary.averageRating} (${playerTier})
Games Analyzed: ${summary.gamesAnalyzed}
Win Rate: ${summary.winRate}% (${summary.wins}W / ${summary.losses}L / ${summary.draws}D)
${accuracyLine}
Net Rating Change: ${summary.ratingProgress > 0 ? '+' : ''}${summary.ratingProgress}
${blunderLine}
Most Played Openings: ${summary.topOpenings.map(o => `${o.name} (${o.games} games, ${o.winRate}% win rate)`).join(', ') || 'Varied'}

GAME-BY-GAME BREAKDOWN (newest first):
${summary.recentResults.map((r, i) => `Game ${i + 1}: ${r.result} | Accuracy: ${r.accuracy} | Rating: ${r.ratingChange} | vs ${r.opponentRating} | ${r.opening} | ${r.timeControl} | ${r.totalMoves} moves`).join('\n')}

${this._buildCriticalMomentsSection(summary.recentResults)}
Based on ALL of the above data and the coaching principles for this player's rating tier, provide your personalized coaching insight.`;

      const response = await this.groqClient.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
        top_p: 0.9
      });

      return {
        message: response.choices[0].message.content.trim(),
        coach: 'Coach B',
        type: 'ai_generated',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Groq API error for dashboard insights:', error.message);
      return this._getFallbackInsight(summary);
    }
  }

  _getFallbackInsight(summary) {
    let message;
    const accText = summary.overallAccuracy !== null ? ` with ${summary.overallAccuracy}% accuracy` : '';

    if (summary.winRate >= 60) {
      message = `Great recent form! You're winning ${summary.winRate}% of your games${accText}. Your net rating change of ${summary.ratingProgress > 0 ? '+' : ''}${summary.ratingProgress} shows real progress — keep it up!`;
    } else if (summary.winRate >= 45) {
      message = `Solid play across your last ${summary.gamesAnalyzed} games with a ${summary.winRate}% win rate${accText}. Focus on consistency and you'll keep climbing.`;
    } else {
      message = `Tough stretch with a ${summary.winRate}% win rate, but every loss is a learning opportunity. Review your games after playing and look for patterns — you've got this!`;
    }

    return {
      message,
      coach: 'Coach B',
      type: 'fallback',
      timestamp: new Date().toISOString()
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  //  PUZZLE THEME RECOMMENDATIONS
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Generate personalized puzzle theme recommendations using Groq.
   * Returns an array of { theme, reason } objects.
   */
  async _generatePuzzleRecommendations(summary) {
    if (!this.groqClient) {
      return this._getFallbackThemes(summary);
    }

    try {
      const validThemes = [
        'fork', 'pin', 'skewer', 'discoveredAttack', 'doubleCheck',
        'hangingPiece', 'trappedPiece', 'backRankMate', 'sacrifice',
        'deflection', 'attraction', 'interference', 'clearance',
        'endgame', 'pawnEndgame', 'rookEndgame', 'knightEndgame', 'bishopEndgame',
        'mateIn1', 'mateIn2', 'mateIn3', 'mate',
        'middlegame', 'opening', 'promotion', 'exposedKing',
        'kingsideAttack', 'queensideAttack', 'quietMove', 'defensiveMove',
        'intermezzo', 'zugzwang', 'xRayAttack', 'capturingDefender'
      ];

      const systemPrompt = `You are an expert chess coach recommending puzzle themes based on a player's performance data. Follow these improvement principles:

1. BELOW 1200: Focus on basic tactics (mate patterns, hanging pieces, simple forks). NO opening or advanced themes.
2. 1200-1600: Core tactics (fork, pin, skewer, discovered attack, back rank). Basic endgames. NO opening themes.
3. 1600-1800: Can include advanced tactics (deflection, interference, sacrifice). Endgame themes important. Opening themes only if player shows clear weakness.
4. 1800-2000: Full range including positional themes (quiet moves, defensive moves). Opening themes acceptable.
5. 2000+: All themes appropriate, including zugzwang, intermezzo, complex endgames.

RULES:
- If blunders are high (3+), ALWAYS recommend hangingPiece or basic tactics like fork/pin
- If win rate is low, prioritize defensive and calculation themes
- Endgame themes should appear for ALL rating levels
- DO NOT recommend "opening" theme for players under 1800
- Vary recommendations — pick from different categories (e.g., 1 tactic + 1 endgame + 1 pattern)

You MUST respond with valid JSON only — no markdown, no commentary. The format:
[
  { "theme": "<theme_name>", "reason": "<1 sentence why>" },
  { "theme": "<theme_name>", "reason": "<1 sentence why>" },
  { "theme": "<theme_name>", "reason": "<1 sentence why>" }
]

Valid theme names: ${validThemes.join(', ')}

Be specific in reasons — reference data like blunder counts, win rate, or rating.`;

      const accuracyInfo = summary.overallAccuracy !== null
        ? `Accuracy: ${summary.overallAccuracy}%`
        : 'Accuracy: N/A';
      const blunderInfo = summary.hasAnalysisData
        ? `Blunders: ${summary.totalBlunders}, Mistakes: ${summary.totalMistakes}`
        : 'Blunder data: N/A';

      const userPrompt = `Player data from last ${summary.gamesAnalyzed} games:
Rating: ${summary.averageRating} (${this._getRatingTier(summary.averageRating)})
Win: ${summary.winRate}% (${summary.wins}W/${summary.losses}L/${summary.draws}D)
${accuracyInfo}
${blunderInfo}
Rating Change: ${summary.ratingProgress > 0 ? '+' : ''}${summary.ratingProgress}
Openings: ${summary.topOpenings.map(o => `${o.name} (${o.winRate}%)`).join(', ') || 'Varied'}
Recent: ${summary.recentResults.map(r => `${r.result}(${r.accuracy})`).join(', ')}`;

      const response = await this.groqClient.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.5
      });

      const raw = response.choices[0].message.content.trim();
      // Parse JSON — handle potential markdown wrapping
      const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const themes = JSON.parse(jsonStr);

      // Validate and sanitize
      if (Array.isArray(themes) && themes.length > 0) {
        return themes
          .filter(t => t.theme && t.reason && validThemes.includes(t.theme))
          .slice(0, 3)
          .map(t => ({
            theme: t.theme,
            reason: t.reason.substring(0, 120) // cap reason length
          }));
      }

      return this._getFallbackThemes(summary);
    } catch (error) {
      console.error('Groq puzzle recommendation error:', error.message);
      return this._getFallbackThemes(summary);
    }
  }

  /**
   * Rule-based fallback when Groq is unavailable.
   * Maps common weaknesses to puzzle themes.
   */
  _getFallbackThemes(summary) {
    const themes = [];

    // High blunders → hanging pieces / tactics awareness
    if (summary.totalBlunders >= 3) {
      themes.push({
        theme: 'hangingPiece',
        reason: `You had ${summary.totalBlunders} blunders in your recent games — practice spotting undefended pieces.`
      });
    }

    // Low win rate → defensive skills
    if (summary.winRate < 45) {
      themes.push({
        theme: 'defensiveMove',
        reason: `With a ${summary.winRate}% win rate, sharpening your defensive play can help you save more games.`
      });
    }

    // Always recommend forks for tactical improvement
    if (themes.length < 3) {
      themes.push({
        theme: 'fork',
        reason: 'Forks are one of the most common tactical patterns — mastering them wins material consistently.'
      });
    }

    // Endgame practice
    if (themes.length < 3) {
      themes.push({
        theme: 'endgame',
        reason: 'Strong endgame technique converts advantages into wins — practice converting your winning positions.'
      });
    }

    // Back rank awareness
    if (themes.length < 3) {
      themes.push({
        theme: 'backRankMate',
        reason: 'Back rank threats are easy to miss in fast games — practice both attacking and defending them.'
      });
    }

    return themes.slice(0, 3);
  }

  clearCache(username = null) {
    if (username) {
      this.insightsCache.delete(`insights_${username.toLowerCase()}`);
    } else {
      this.insightsCache.clear();
    }
  }
}

module.exports = InsightsService;
