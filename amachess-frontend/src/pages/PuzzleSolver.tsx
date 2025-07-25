import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChessGame from '../components/ChessGame';
import { usePuzzle } from '../hooks/usePuzzle';
import { Chess } from 'chess.js';
import { puzzleService } from '../services/puzzleService';

interface PuzzleTheme {
  name: string;
  count: number;
}

const PuzzleSolver = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [showGameAnalysis, setShowGameAnalysis] = useState(false);
  const [engineAnalysis, setEngineAnalysis] = useState<any>(null);
  const [availableThemes, setAvailableThemes] = useState<PuzzleTheme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>(searchParams.get('theme') || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(searchParams.get('difficulty') || 'all');
  const [selectedRating, setSelectedRating] = useState<string>(searchParams.get('rating') || 'all');
  const [puzzleStats, setPuzzleStats] = useState({
    solved: 0,
    accuracy: 0,
    streak: 0,
    averageTime: 0
  });
  const [userId] = useState('user123'); // TODO: Get from auth context
  const [puzzleStartTime, setPuzzleStartTime] = useState<number>(Date.now());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);

  // Use the enhanced puzzle hook
  const {
    puzzle: currentPuzzle,
    isLoading,
    error,
    isCompleted,
    makeMove,
    loadRandomPuzzle,
    showHintAction,
    showSolutionAction,
    resetPuzzle,
    showHint: hintVisible,
    showSolution: solutionVisible,
    gamePosition,
    solvedMoves,
    totalMoves,
    gameContext,
    analysisMode,
    loadGameContext,
    enterAnalysisMode,
    analyzePosition,
    getProgress,
    getTotalUserMoves,
    // Solution mode functionality
    userAttempts,
    solutionMoves,
    solutionModeActive,
    solutionIndex,
    stepSolutionForward,
    stepSolutionBackward,
    exitSolutionMode,
    boardKey
  } = usePuzzle();

  // Determine board orientation and turn indicator
  const [activeColor, setActiveColor] = useState<'white' | 'black'>('white');

  useEffect(() => {
    // Load available themes from the backend
    loadAvailableThemes();
  }, []);

  useEffect(() => {
    // Load initial puzzle with filters
    loadPuzzleWithFilters();
  }, [selectedTheme, selectedDifficulty, selectedRating]);

  useEffect(() => {
    // Determine board orientation from which side the user is playing
    if (currentPuzzle?.userSide) {
      setActiveColor(currentPuzzle.userSide);
      console.log('User is playing as:', currentPuzzle.userSide);
    } else if (currentPuzzle?.fen) {
      // Fallback to original logic if userSide is not available
      const chess = new Chess(currentPuzzle.fen);
      const turn = chess.turn() === 'w' ? 'white' : 'black';
      // The user plays the opposite side to whoever is to move in the original FEN
      const userSide = turn === 'white' ? 'black' : 'white';
      setActiveColor(userSide);
    }
    
    // Reset tracking variables for new puzzle
    if (currentPuzzle) {
      setPuzzleStartTime(Date.now());
      setHintsUsed(0);
      setSolutionShown(false);
    }
  }, [currentPuzzle]);

  useEffect(() => {
    // Show notification when puzzle is completed and update backend stats
    if (isCompleted && solvedMoves === totalMoves && currentPuzzle) {
      const timeSpent = Math.floor((Date.now() - puzzleStartTime) / 1000);
      
      setNotification({
        type: 'success',
        message: `Excellent! Puzzle solved in ${solvedMoves} moves!`
      });
      
      // Update backend stats
      puzzleService.updateUserStats(
        userId,
        currentPuzzle,
        true, // isCorrect
        timeSpent,
        hintsUsed,
        solutionShown
      ).then(() => {
        console.log('User stats updated successfully');
      }).catch((error) => {
        console.error('Failed to update user stats:', error);
      });
      
      // Update local stats
      setPuzzleStats(prev => ({
        ...prev,
        solved: prev.solved + 1,
        streak: prev.streak + 1
      }));
    }
  }, [isCompleted, solvedMoves, totalMoves, currentPuzzle, puzzleStartTime, userId, hintsUsed, solutionShown]);

  useEffect(() => {
    // Show notification for errors
    if (error) {
      setNotification({
        type: 'error',
        message: error
      });
    }
  }, [error]);

  // Auto-hide notifications after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [notification]);

  const loadAvailableThemes = async () => {
    try {
      const response = await fetch('/api/puzzles/themes');
      const data = await response.json();
      
      if (data.success) {
        // Format themes with counts (we'll get counts from stats endpoint)
        const statsResponse = await fetch('/api/puzzles/stats');
        const statsData = await statsResponse.json();
        
        if (statsData.success) {
          const themesWithCounts = data.data.map((theme: string) => ({
            name: theme,
            count: statsData.data.byTheme[theme] || 0
          })).filter((theme: PuzzleTheme) => theme.count > 0)
            .sort((a: PuzzleTheme, b: PuzzleTheme) => b.count - a.count);
          
          setAvailableThemes(themesWithCounts);
        }
      }
    } catch (error) {
      console.error('Failed to load themes:', error);
    }
  };

  const loadPuzzleWithFilters = async () => {
    const filters: any = {};
    
    if (selectedTheme !== 'all') {
      filters.themes = [selectedTheme];
    }
    
    if (selectedDifficulty !== 'all') {
      filters.difficulty = selectedDifficulty;
    }
    
    if (selectedRating !== 'all') {
      const ratingRanges: { [key: string]: { min: number; max: number } } = {
        'under1400': { min: 0, max: 1400 },
        '1400-1600': { min: 1400, max: 1600 },
        '1600-1800': { min: 1600, max: 1800 },
        '1800-2000': { min: 1800, max: 2000 },
        'over2000': { min: 2000, max: 3000 }
      };
      
      if (ratingRanges[selectedRating]) {
        filters.minRating = ratingRanges[selectedRating].min;
        filters.maxRating = ratingRanges[selectedRating].max;
      }
    }
    
    await loadRandomPuzzle(filters);
  };

  const handleMove = (move: { from: string; to: string; san?: string; promotion?: string }) => {
    if (!currentPuzzle || isCompleted || solutionModeActive) return false;
    
    console.log('PuzzleSolver handleMove called with:', move);
    
    // Use the puzzle hook's move validation with the move object
    const isCorrect = makeMove({
      from: move.from,
      to: move.to,
      ...(move.promotion && { promotion: move.promotion })
    });
    
    console.log('Move result:', isCorrect);
    
    if (!isCorrect && error) {
      setNotification({
        type: 'error',
        message: error
      });
      // Update stats for incorrect moves
      setPuzzleStats(prev => ({
        ...prev,
        streak: 0
      }));
    }
    
    // Return the result so ChessBoard knows whether to allow the move
    return isCorrect;
  };

  const loadNextPuzzle = async () => {
    resetPuzzle();
    setNotification(null);
    setShowGameAnalysis(false);
    setEngineAnalysis(null);
    await loadPuzzleWithFilters();
  };

  const handleShowHint = () => {
    showHintAction();
    setHintsUsed(prev => prev + 1);
    setNotification({
      type: 'info',
      message: 'Hint revealed!'
    });
  };

  const handleShowSolution = () => {
    showSolutionAction(); // This starts the interactive solution mode
    setSolutionShown(true);
    setNotification({
      type: 'info',
      message: 'Solution mode activated! Use the controls to step through.'
    });
  };

  const handleAnalyzePosition = async () => {
    setShowGameAnalysis(true);
    enterAnalysisMode();
    await loadGameContext();
    
    // Get Stockfish analysis
    const analysis = await analyzePosition();
    if (analysis) {
      setEngineAnalysis(analysis);
    }
  };

  const progressPercentage = getProgress();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-500 text-green-900';
      case 'intermediate':
        return 'bg-yellow-500 text-yellow-900';
      case 'advanced':
        return 'bg-orange-500 text-orange-900';
      case 'expert':
        return 'bg-red-500 text-red-900';
      default:
        return 'bg-gray-500 text-gray-900';
    }
  };

  const getThemeColor = (theme: string) => {
    const colors = [
      'bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600',
      'bg-orange-600', 'bg-indigo-600', 'bg-pink-600', 'bg-teal-600'
    ];
    const index = theme.length % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] via-[#111827] to-[#0a0f1c] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading puzzle...</p>
        </div>
      </div>
    );
  }

  if (!currentPuzzle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] via-[#111827] to-[#0a0f1c] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No puzzle found with current filters</p>
          <button
            onClick={() => {
              setSelectedTheme('all');
              setSelectedDifficulty('all');
              setSelectedRating('all');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1c] via-[#111827] to-[#0a0f1c] text-white">
      <Header />
      
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg border-l-4 ${
            notification.type === 'success' 
              ? 'bg-green-900/90 border-green-400 text-green-100' 
              : notification.type === 'error'
              ? 'bg-red-900/90 border-red-400 text-red-100'
              : 'bg-blue-900/90 border-blue-400 text-blue-100'
          } backdrop-blur-sm`}>
            <p className="font-medium">{notification.message}</p>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Puzzle Solver</h1>
            <p className="text-gray-400">Solve tactical puzzles from the Lichess database</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-[#374162] hover:bg-[#455173] rounded-lg transition-colors"
              title="Settings"
            >
              ⚙️
            </button>
            
            <button
              onClick={() => navigate('/puzzles')}
              className="px-4 py-2 bg-[#374162] hover:bg-[#455173] rounded-lg transition-colors"
            >
              Back to Puzzles
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showSettings && (
          <div className="mb-8 bg-[#1e293b] rounded-xl p-6 border border-[#374162]">
            <h3 className="text-lg font-semibold text-white mb-4">Puzzle Filters</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Theme Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Theme ({availableThemes.length} available)
                </label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full bg-[#374162] text-white rounded-lg px-3 py-2 border border-[#455173] focus:border-blue-400 focus:outline-none"
                >
                  <option value="all">All Themes</option>
                  {availableThemes.map((theme) => (
                    <option key={theme.name} value={theme.name}>
                      {theme.name} ({theme.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Difficulty
                </label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full bg-[#374162] text-white rounded-lg px-3 py-2 border border-[#455173] focus:border-blue-400 focus:outline-none"
                >
                  <option value="all">All Difficulties</option>
                  <option value="beginner">Beginner (&lt; 1400)</option>
                  <option value="intermediate">Intermediate (1400-1800)</option>
                  <option value="advanced">Advanced (1800-2200)</option>
                  <option value="expert">Expert (&gt; 2200)</option>
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rating Range
                </label>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="w-full bg-[#374162] text-white rounded-lg px-3 py-2 border border-[#455173] focus:border-blue-blue-400 focus:outline-none"
                >
                  <option value="all">All Ratings</option>
                  <option value="under1400">Under 1400</option>
                  <option value="1400-1600">1400-1600</option>
                  <option value="1600-1800">1600-1800</option>
                  <option value="1800-2000">1800-2000</option>
                  <option value="over2000">Over 2000</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
            <p className="text-[#97a1c4] text-sm">Solved</p>
            <p className="text-2xl font-bold text-green-400">{puzzleStats.solved}</p>
          </div>
          <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
            <p className="text-[#97a1c4] text-sm">Current Streak</p>
            <p className="text-2xl font-bold text-orange-400">{puzzleStats.streak}</p>
          </div>
          <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
            <p className="text-[#97a1c4] text-sm">Progress</p>
            <p className="text-2xl font-bold text-blue-400">{Math.round(progressPercentage)}%</p>
          </div>
          <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
            <p className="text-[#97a1c4] text-sm">Rating</p>
            <p className="text-2xl font-bold text-purple-400">{currentPuzzle.rating}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - PGN/Moves Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* PGN/Moves Panel */}
            <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
              <h4 className="text-white font-semibold mb-4">
                {solutionModeActive ? 'Solution Moves' : 'Your Attempts'}
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {solutionModeActive ? (
                  // Show solution moves when in solution mode
                  solutionMoves.length > 0 ? (
                    solutionMoves.map((move, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-green-400">{index + 1}. {move}</span>
                        <span className="text-gray-400">✓</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">Step through the solution...</p>
                  )
                ) : (
                  // Show user attempts when not in solution mode
                  userAttempts.length > 0 ? (
                    userAttempts.map((attempt, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className={attempt.includes('✓') ? 'text-green-400' : 'text-red-400'}>
                          {index + 1}. {attempt.replace(' ✓', '').replace(' (incorrect)', '')}
                        </span>
                        <span className={attempt.includes('✓') ? 'text-green-400' : 'text-red-400'}>
                          {attempt.includes('✓') ? '✓' : '✗'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">Make your moves...</p>
                  )
                )}
              </div>
            </div>

            {/* Puzzle Info */}
            <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
              <h4 className="text-white font-semibold mb-3">Puzzle Details</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#97a1c4]">ID:</span>
                  <span className="text-white text-sm font-mono">{currentPuzzle.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#97a1c4]">Rating:</span>
                  <span className="text-white font-bold">{currentPuzzle.rating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#97a1c4]">Difficulty:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(currentPuzzle.difficulty)}`}>
                    {currentPuzzle.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#97a1c4]">Moves:</span>
                  <span className="text-white font-medium">{currentPuzzle.moves?.length || 0}</span>
                </div>
              </div>
            </div>

            {/* Themes */}
            <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
              <h4 className="text-white font-semibold mb-3">Themes</h4>
              <div className="flex flex-wrap gap-2">
                {currentPuzzle.themes.map((theme, index) => (
                  <span 
                    key={index} 
                    className={`${getThemeColor(theme)}/20 text-blue-400 px-3 py-1 rounded-full text-xs border border-blue-400/30`}
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Center Columns - Chess Board */}
          <div className="lg:col-span-2 flex flex-col items-center space-y-6">
            {/* Progress Bar */}
            <div className="w-full bg-[#374162] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            {/* Chess Board */}
            <div className="flex justify-center">
              <ChessGame
                key={boardKey}
                isModalMode={true}
                position={gamePosition || currentPuzzle.fen}
                onMove={handleMove}
                interactive={(!isCompleted || analysisMode) && !solutionModeActive}
                showNotation={false}
                engineEnabled={analysisMode}
                orientation={activeColor}
              />
            </div>

            {/* Solution Display */}
            {solutionVisible && !solutionModeActive && (
              <div className="bg-[#1e293b] rounded-xl p-4 border border-[#374162] w-full max-w-md">
                <h4 className="text-white font-semibold mb-2">Solution:</h4>
                <div className="flex flex-wrap gap-2">
                  {currentPuzzle.moves.map((move, index) => (
                    <span key={index} className="bg-[#374162] text-green-400 px-2 py-1 rounded text-sm">
                      {index + 1}. {move}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hint Display */}
            {hintVisible && (
              <div className="bg-[#1e293b] rounded-xl p-4 border border-yellow-400/30 w-full max-w-md">
                <p className="text-yellow-400 font-medium mb-2">💡 Hint:</p>
                <p className="text-white text-sm">{currentPuzzle.hint}</p>
              </div>
            )}
          </div>

          {/* Right Column - Controls & Analysis */}
          <div className="lg:col-span-1 space-y-6">
            {/* Puzzle Controls */}
            <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
              <h4 className="text-white font-semibold mb-4">Controls</h4>
              <div className="space-y-3">
                {!isCompleted && !solutionModeActive && (
                  <>
                    <button
                      onClick={handleShowHint}
                      disabled={hintVisible}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors"
                    >
                      {hintVisible ? 'Hint Shown' : 'Show Hint'}
                    </button>
                    <button
                      onClick={handleShowSolution}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition-colors"
                    >
                      Show Solution
                    </button>
                  </>
                )}

                {solutionModeActive && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400 mb-2">
                      {solutionModeActive ? 'Solution Active' : 'Solution Mode'}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={stepSolutionBackward}
                        disabled={solutionIndex <= 0}
                        className="flex-1 bg-[#374162] hover:bg-[#455173] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors text-sm"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={stepSolutionForward}
                        disabled={solutionIndex >= currentPuzzle.moves.length}
                        className="flex-1 bg-[#374162] hover:bg-[#455173] disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors text-sm"
                      >
                        Next →
                      </button>
                    </div>
                    <button
                      onClick={exitSolutionMode}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors text-sm"
                    >
                      Exit Solution
                    </button>
                  </div>
                )}

                <button
                  onClick={loadNextPuzzle}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
                >
                  Next Puzzle
                </button>

                {isCompleted && (
                  <button
                    onClick={handleAnalyzePosition}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Analyze Position
                  </button>
                )}
              </div>
            </div>

            {/* Engine Analysis */}
            {showGameAnalysis && engineAnalysis && (
              <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                <h4 className="text-white font-semibold mb-3">Engine Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#97a1c4]">Evaluation:</span>
                    <span className="text-white">{engineAnalysis.evaluation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#97a1c4]">Best Move:</span>
                    <span className="text-green-400">{engineAnalysis.bestMove}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#97a1c4]">Depth:</span>
                    <span className="text-white">{engineAnalysis.depth}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Game Context */}
            {gameContext && (
              <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                <h4 className="text-white font-semibold mb-3">Game Context</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#97a1c4]">Game:</span>
                    <a 
                      href={currentPuzzle.gameUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      View on Lichess
                    </a>
                  </div>
                  {gameContext.players && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-[#97a1c4]">White:</span>
                        <span className="text-white">{gameContext.players.white}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#97a1c4]">Black:</span>
                        <span className="text-white">{gameContext.players.black}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PuzzleSolver;
