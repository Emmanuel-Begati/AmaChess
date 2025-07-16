import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChessGame from '../components/ChessGame';
import { usePuzzle } from '../hooks/usePuzzle';
import { Chess } from 'chess.js';

const PuzzleTraining = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [showGameAnalysis, setShowGameAnalysis] = useState(false);
  const [engineAnalysis, setEngineAnalysis] = useState<any>(null);

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
    // Load initial puzzle
    loadRandomPuzzle();
  }, [loadRandomPuzzle]);

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
  }, [currentPuzzle]);

  useEffect(() => {
    // Show notification when puzzle is completed
    if (isCompleted && solvedMoves === totalMoves) {
      setNotification({
        type: 'success',
        message: `Excellent! Puzzle solved in ${solvedMoves} moves!`
      });
    }
  }, [isCompleted, solvedMoves, totalMoves]);

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

  const handleMove = (move: { from: string; to: string; san?: string; promotion?: string }) => {
    if (!currentPuzzle || isCompleted || solutionModeActive) return false;
    
    console.log('PuzzleTraining handleMove called with:', move);
    
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
    }
    
    // Return the result so ChessBoard knows whether to allow the move
    return isCorrect;
  };

  const loadNextPuzzle = async () => {
    resetPuzzle();
    setNotification(null);
    setShowGameAnalysis(false);
    setEngineAnalysis(null);
    await loadRandomPuzzle();
  };

  const handleShowHint = () => {
    showHintAction();
    setNotification({
      type: 'info',
      message: 'Hint revealed!'
    });
  };

  const handleShowSolution = () => {
    showSolutionAction(); // This starts the interactive solution mode
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
            <h1 className="text-3xl font-bold text-white mb-2">Puzzle Training</h1>
            <p className="text-gray-400">Sharpen your tactical skills</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 bg-[#374162] hover:bg-[#455173] rounded-lg transition-colors"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            <button
              onClick={() => navigate('/puzzles')}
              className="px-4 py-2 bg-[#374162] hover:bg-[#455173] rounded-lg transition-colors"
            >
              Back to Puzzles
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-8 bg-[#1e293b] rounded-xl p-6 border border-[#374162]">
            <h3 className="text-lg font-semibold mb-4">Puzzle Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select className="w-full bg-[#374162] border border-[#475569] rounded-lg px-3 py-2">
                  <option>All</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                  <option>Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Theme</label>
                <select className="w-full bg-[#374162] border border-[#475569] rounded-lg px-3 py-2">
                  <option>All themes</option>
                  <option>Pin</option>
                  <option>Fork</option>
                  <option>Skewer</option>
                  <option>Mate in one</option>
                  <option>Endgame</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Rating Range</label>
                <select className="w-full bg-[#374162] border border-[#475569] rounded-lg px-3 py-2">
                  <option>All ratings</option>
                  <option>800-1200</option>
                  <option>1200-1600</option>
                  <option>1600-2000</option>
                  <option>2000+</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* PGN/Moves Panel - Always visible on left */}
          <div className="bg-[#1e293b] rounded-xl p-6 border border-[#374162]">
            <h3 className="text-lg font-semibold mb-4">
              {solutionModeActive ? 'Solution' : 'Your Attempts'}
            </h3>
            
            {/* Moves display */}
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {solutionModeActive ? (
                // Show solution moves when in solution mode
                <div className="space-y-1">
                  {currentPuzzle?.moves.map((move, index) => {
                    const isPlayed = index < solutionIndex;
                    const isCurrent = index === solutionIndex;
                    const isUserMove = (currentPuzzle.userSide === 'white' && index % 2 === 0) ||
                                     (currentPuzzle.userSide === 'black' && index % 2 === 1);
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex items-center gap-2 p-2 rounded text-sm ${
                          isCurrent ? 'bg-blue-600 text-white' :
                          isPlayed ? 'bg-green-600/30 text-green-300' :
                          'bg-gray-700 text-gray-400'
                        }`}
                      >
                        <span className="font-mono min-w-[60px]">
                          {Math.floor(index / 2) + 1}{index % 2 === 0 ? '.' : '...'}
                        </span>
                        <span className="font-mono flex-1">{move}</span>
                        <span className="text-xs">
                          {isUserMove ? 'You' : 'Engine'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                // Show user attempts when not in solution mode
                <div className="space-y-1">
                  {userAttempts.length === 0 ? (
                    <p className="text-gray-400 text-sm">No moves attempted yet</p>
                  ) : (
                    userAttempts.map((attempt, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded text-sm bg-gray-700">
                        <span className="font-mono min-w-[40px]">{index + 1}.</span>
                        <span className="font-mono flex-1">{attempt}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Solution mode controls */}
            {solutionModeActive && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={stepSolutionBackward}
                    disabled={solutionIndex <= 0}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  
                  <button
                    onClick={stepSolutionForward}
                    disabled={!currentPuzzle || solutionIndex >= currentPuzzle.moves.length}
                    className="flex items-center gap-1 px-3 py-2 bg-gray-600 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm"
                  >
                    Forward
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <button
                  onClick={exitSolutionMode}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                >
                  Exit Solution Mode
                </button>
              </div>
            )}
          </div>

          {/* Game Context Sidebar (when showing analysis) */}
          {showGameAnalysis && gameContext && (
            <div className="bg-[#1e293b] rounded-xl p-6 border border-[#374162]">
              <h3 className="text-lg font-semibold mb-4">Game Context</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Game ID:</p>
                  <p className="font-mono text-sm">{currentPuzzle?.id}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Opening:</p>
                  <p className="text-sm">Unknown</p>
                </div>
                {gameContext.lichessUrl && (
                  <a 
                    href={gameContext.lichessUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
                  >
                    View full game
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Chess Board */}
          <div className={`${showGameAnalysis ? 'lg:col-span-1' : 'lg:col-span-2'}`}>
            <div className="bg-[#1e293b] rounded-xl p-6 border border-[#374162]">
              {/* Turn Indicator and Progress */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${
                    activeColor === 'white' ? 'bg-white' : 'bg-gray-800 border-2 border-white'
                  }`}></div>
                  <span className="text-lg font-medium">
                    {activeColor === 'white' ? 'White' : 'Black'} to play
                  </span>
                </div>
                
                {currentPuzzle && (
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-400">
                      Progress: <span className="text-white font-bold">{solvedMoves}/{totalMoves}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Rating: <span className="text-white font-bold">{currentPuzzle.rating}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {totalMoves > 1 && (
                <div className="mb-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Chess Board */}
              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : currentPuzzle ? (
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
              ) : (
                <div className="flex items-center justify-center h-96">
                  <p className="text-gray-400">No puzzle loaded</p>
                </div>
              )}

              {/* Puzzle Description */}
              {currentPuzzle && (
                <div className="mt-4 text-center">
                  <p className="text-gray-400 text-lg">
                    {isCompleted 
                      ? `Puzzle solved! Found the best continuation.` 
                      : `Find the best move for ${activeColor === 'white' ? 'White' : 'Black'}`
                    }
                  </p>
                  {getTotalUserMoves() > 1 && !isCompleted && (
                    <p className="text-sm text-blue-400 mt-2">
                      This puzzle requires {getTotalUserMoves()} move{getTotalUserMoves() > 1 ? 's' : ''} to complete
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Puzzle Info & Controls */}
          <div className="space-y-6">
            {/* Puzzle Info */}
            {currentPuzzle && (
              <div className="bg-[#1e293b] rounded-xl p-6 border border-[#374162]">
                <h3 className="text-lg font-semibold mb-4">Puzzle Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID:</span>
                    <span className="font-mono text-sm">{currentPuzzle.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rating:</span>
                    <span className="font-semibold">{currentPuzzle.rating}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Difficulty:</span>
                    <span className="font-semibold">{currentPuzzle.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Popularity:</span>
                    <span className="font-semibold">{currentPuzzle.popularity}%</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-2">Themes:</span>
                    <div className="flex flex-wrap gap-2">
                      {currentPuzzle.themes?.map((theme, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-800/30 text-blue-300 text-xs rounded">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="bg-[#1e293b] rounded-xl p-6 border border-[#374162]">
              <h3 className="text-lg font-semibold mb-4">Controls</h3>
              <div className="space-y-3">
                {isCompleted ? (
                  <>
                    <button
                      onClick={loadNextPuzzle}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      Next Puzzle
                    </button>
                    
                    <button
                      onClick={handleAnalyzePosition}
                      disabled={analysisMode}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      {analysisMode ? 'Analyzing...' : 'Analyze Position'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleShowHint}
                      disabled={hintVisible}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                      {hintVisible ? 'Hint Shown' : 'Show Hint'}
                    </button>
                    
                    <button
                      onClick={handleShowSolution}
                      disabled={solutionVisible}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                      {solutionModeActive ? 'Solution Active' : solutionVisible ? 'Solution Mode' : 'Show Solution'}
                    </button>
                  </>
                )}
                
                <button
                  onClick={loadNextPuzzle}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Skip Puzzle
                </button>
              </div>
            </div>

            {/* Engine Analysis */}
            {engineAnalysis && (
              <div className="bg-[#1e293b] rounded-xl p-6 border border-purple-500/50">
                <h3 className="text-lg font-semibold mb-3 text-purple-300">🤖 Engine Analysis</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Evaluation:</span>
                    <span className="font-bold text-white">{engineAnalysis.score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Best Move:</span>
                    <span className="font-mono bg-gray-800 px-2 py-1 rounded text-sm">
                      {engineAnalysis.bestMove}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Depth:</span>
                    <span className="text-white">{engineAnalysis.depth}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Hint Display */}
            {hintVisible && currentPuzzle && (
              <div className="bg-[#1e293b] rounded-xl p-6 border border-blue-500/50">
                <h3 className="text-lg font-semibold mb-2 text-blue-300">💡 Hint</h3>
                <p className="text-gray-300">{currentPuzzle.hint}</p>
              </div>
            )}

            {/* Solution Display - Only show if not in interactive mode */}
            {solutionVisible && !solutionModeActive && currentPuzzle && (
              <div className="bg-[#1e293b] rounded-xl p-6 border border-yellow-500/50">
                <h3 className="text-lg font-semibold mb-3 text-yellow-300">🔍 Solution</h3>
                <div className="space-y-2">
                  {currentPuzzle.moves.map((move, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-gray-400 text-sm w-8">{index + 1}.</span>
                      <span className={`font-mono px-2 py-1 rounded text-sm ${
                        index < solvedMoves 
                          ? 'bg-green-800 text-green-200' 
                          : 'bg-gray-800 text-gray-200'
                      }`}>
                        {move}
                      </span>
                      {index < solvedMoves && (
                        <span className="text-green-400 text-xs">✓</span>
                      )}
                    </div>
                  ))}
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

export default PuzzleTraining;
