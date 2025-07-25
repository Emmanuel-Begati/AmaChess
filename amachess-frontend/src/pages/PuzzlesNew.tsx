import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChessBoard from '../components/ChessBoard';
import { usePuzzle } from '../hooks/usePuzzle';
import { LichessPuzzle, UserPuzzleStats, DailyChallenge, DailyChallengeStats, puzzleService } from '../services/puzzleService';
import { Chess } from 'chess.js';

const Puzzles = () => {
  // State management
  const [dailyPuzzleCompleted, setDailyPuzzleCompleted] = useState(false);
  const [randomPuzzleMode, setRandomPuzzleMode] = useState(false);
  const [dailyPuzzleGame, setDailyPuzzleGame] = useState<Chess | null>(null);
  const [dailyPuzzleCurrentMoveIndex, setDailyPuzzleCurrentMoveIndex] = useState(0);
  
  // User statistics and daily challenge data
  const [userStats, setUserStats] = useState<UserPuzzleStats | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [dailyChallengeStats, setDailyChallengeStats] = useState<DailyChallengeStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  
  // Use the puzzle hook for random puzzle functionality
  const {
    puzzle: currentLichessPuzzle,
    isLoading: puzzleLoading,
    error: puzzleError,
    isCompleted: puzzleCompleted,
    makeMove,
    loadRandomPuzzle,
    showHintAction,
    showSolutionAction,
    resetPuzzle,
    showHint: hintVisible,
    showSolution: solutionVisible
  } = usePuzzle();

  // Load user statistics and daily challenge data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);
        
        // Load daily challenge (public endpoint)
        try {
          const challenge = await puzzleService.getDailyChallenge();
          setDailyChallenge(challenge);
          
          // Initialize daily puzzle game
          if (challenge?.fen) {
            const game = new Chess(challenge.fen);
            setDailyPuzzleGame(game);
          }
          
          // Load daily challenge statistics
          const challengeStats = await puzzleService.getDailyChallengeStats();
          setDailyChallengeStats(challengeStats);
        } catch (error) {
          console.error('Failed to load daily challenge:', error);
        }
        
        // Try to load user statistics (requires auth)
        try {
          const userId = 'user123'; // In a real app, get from auth context
          const stats = await puzzleService.getUserStats(userId);
          setUserStats(stats);
        } catch (error) {
          console.warn('User not authenticated, using default stats:', error);
          // Set default/guest user stats
          setUserStats({
            id: 'guest',
            userId: 'guest',
            totalPuzzlesSolved: 0,
            currentPuzzleRating: 1200,
            bestPuzzleRating: 1200,
            currentStreak: 0,
            bestStreak: 0,
            totalTimeSpent: 0,
            averageAccuracy: 0,
            averageTimePerPuzzle: 0,
            favoriteThemes: '',
            weeklyGoal: 50,
            weeklyProgress: 0,
            monthlyGoal: 200,
            monthlyProgress: 0,
            lastActiveDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
        
      } catch (error) {
        console.error('Failed to load user data:', error);
        setStatsError('Failed to load user data');
      } finally {
        setStatsLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  // Daily Challenge move handler
  const handleDailyPuzzleMove = (moveDetails: { sourceSquare: string; targetSquare: string; piece: string }) => {
    if (!dailyChallenge || !dailyPuzzleGame) return false;

    const move = {
      from: moveDetails.sourceSquare,
      to: moveDetails.targetSquare,
      promotion: 'q'
    };

    console.log('Daily puzzle move:', move);

    try {
      const gameCopy = new Chess(dailyPuzzleGame.fen());
      const result = gameCopy.move(move);
      
      if (!result) {
        console.log('Invalid move attempted');
        return false;
      }

      // Check if this move matches the solution
      const solutionMoves = dailyChallenge.moves || dailyChallenge.solution || [];
      if (dailyPuzzleCurrentMoveIndex < solutionMoves.length) {
        const expectedMove = solutionMoves[dailyPuzzleCurrentMoveIndex];
        const moveStr = `${moveDetails.sourceSquare}${moveDetails.targetSquare}`;
        
        if (moveStr === expectedMove || result.san === expectedMove) {
          setDailyPuzzleGame(gameCopy);
          setDailyPuzzleCurrentMoveIndex(prev => prev + 1);
          
          // Check if puzzle is completed
          if (dailyPuzzleCurrentMoveIndex + 1 >= solutionMoves.length) {
            setDailyPuzzleCompleted(true);
            console.log('Daily puzzle completed!');
          }
          
          return true;
        } else {
          console.log('Incorrect move. Expected:', expectedMove, 'Got:', moveStr);
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error processing daily puzzle move:', error);
      return false;
    }
  };

  // Random puzzle mode handlers
  const startRandomPuzzleMode = () => {
    setRandomPuzzleMode(true);
    loadRandomPuzzle();
  };

  const exitRandomPuzzleMode = () => {
    setRandomPuzzleMode(false);
  };

  const handleRandomPuzzleMove = (move: { from: string; to: string; san?: string }) => {
    console.log('Random puzzle move:', move);
    return makeMove(move);
  };

  const nextRandomPuzzle = () => {
    loadRandomPuzzle();
  };

  // Featured puzzle themes for the graphical layout
  const puzzleThemes = [
    { name: 'Pin', icon: '📌', color: 'from-red-500 to-red-600', count: 1250 },
    { name: 'Fork', icon: '🔱', color: 'from-blue-500 to-blue-600', count: 980 },
    { name: 'Skewer', icon: '🗡️', color: 'from-green-500 to-green-600', count: 750 },
    { name: 'Back Rank', icon: '👑', color: 'from-purple-500 to-purple-600', count: 650 },
    { name: 'Deflection', icon: '↗️', color: 'from-yellow-500 to-yellow-600', count: 820 },
    { name: 'Sacrifice', icon: '⚔️', color: 'from-orange-500 to-orange-600', count: 540 }
  ];

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1f3a] to-[#2d3561] flex items-center justify-center">
        <div className="text-white text-xl">Loading puzzles...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f3a] to-[#2d3561]">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Random Puzzle Button - Clean and prominent at the top */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-white mb-4 md:mb-0">
                <h2 className="text-2xl font-bold mb-2">🎯 Random Puzzle Challenge</h2>
                <p className="text-blue-100">Test your tactical skills with unlimited random puzzles</p>
              </div>
              <button
                onClick={startRandomPuzzleMode}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
              >
                Start Random Puzzle
              </button>
            </div>
          </div>
        </div>

        {/* Random Puzzle Mode */}
        {randomPuzzleMode && (
          <div className="mb-8 bg-[#272e45] rounded-2xl p-6 border border-[#374162]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Random Puzzle Mode</h3>
              <button
                onClick={exitRandomPuzzleMode}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Exit Mode
              </button>
            </div>
            
            {puzzleLoading ? (
              <div className="text-center text-white py-8">Loading puzzle...</div>
            ) : currentLichessPuzzle ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <ChessBoard
                    position={currentLichessPuzzle.fen}
                    onMove={handleRandomPuzzleMove}
                    orientation={currentLichessPuzzle.sideToMove === 'white' ? 'white' : 'black'}
                    className="max-w-md mx-auto"
                  />
                </div>
                <div className="space-y-4">
                  <div className="bg-[#374162] rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-2">Puzzle Info</h4>
                    <p className="text-[#97a1c4]">Rating: {currentLichessPuzzle.rating}</p>
                    <p className="text-[#97a1c4]">Themes: {currentLichessPuzzle.themes.join(', ')}</p>
                    <p className="text-[#97a1c4]">Difficulty: {currentLichessPuzzle.difficulty}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={showHintAction}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Hint
                    </button>
                    <button
                      onClick={showSolutionAction}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Solution
                    </button>
                    <button
                      onClick={nextRandomPuzzle}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Next Puzzle
                    </button>
                  </div>
                  {hintVisible && (
                    <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-3">
                      <p className="text-yellow-100">{currentLichessPuzzle.hint}</p>
                    </div>
                  )}
                  {solutionVisible && (
                    <div className="bg-green-900 border border-green-600 rounded-lg p-3">
                      <p className="text-green-100">Solution: {currentLichessPuzzle.solution?.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-red-400 py-8">Failed to load puzzle</div>
            )}
          </div>
        )}

        {/* Daily Challenge Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">🏆 Daily Challenge</h2>
              <p className="text-purple-100">
                {dailyChallenge?.challengeDate ? 
                  `Challenge for ${new Date(dailyChallenge.challengeDate).toLocaleDateString()}` : 
                  'Loading daily challenge...'
                }
              </p>
            </div>

            {dailyChallenge && dailyPuzzleGame ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <ChessBoard
                    position={dailyPuzzleGame.fen()}
                    onMove={handleDailyPuzzleMove}
                    orientation={dailyChallenge.sideToMove === 'white' ? 'white' : 'black'}
                    className="max-w-md mx-auto"
                    disabled={dailyPuzzleCompleted}
                  />
                  {dailyPuzzleCompleted && (
                    <div className="bg-green-900 border border-green-500 rounded-lg p-4 text-center">
                      <p className="text-green-100 font-bold">🎉 Daily Challenge Completed!</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="bg-white bg-opacity-20 rounded-xl p-4">
                    <h4 className="text-white font-semibold mb-3">Challenge Details</h4>
                    <div className="space-y-2 text-purple-100">
                      <p>Rating: {dailyChallenge.rating}</p>
                      <p>Themes: {dailyChallenge.themes.join(', ')}</p>
                      <p>Difficulty: {dailyChallenge.difficulty}</p>
                      <p>Progress: {dailyPuzzleCurrentMoveIndex}/{(dailyChallenge.moves || []).length} moves</p>
                    </div>
                  </div>
                  {dailyChallengeStats && (
                    <div className="bg-white bg-opacity-20 rounded-xl p-4">
                      <h4 className="text-white font-semibold mb-3">Community Stats</h4>
                      <div className="space-y-2 text-purple-100">
                        <p>Success Rate: {dailyChallengeStats.stats.successRate.toFixed(1)}%</p>
                        <p>Total Attempts: {dailyChallengeStats.stats.totalAttempts}</p>
                        <p>Solved: {dailyChallengeStats.stats.solvedAttempts}</p>
                        <p>Avg Time: {dailyChallengeStats.stats.averageTime}s</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-white py-8">Loading daily challenge...</div>
            )}
          </div>
        </div>

        {/* User Statistics */}
        {userStats && (
          <div className="mb-8">
            <div className="bg-[#272e45] rounded-2xl p-6 border border-[#374162]">
              <h3 className="text-2xl font-bold text-white mb-6">📊 Your Puzzle Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#374162] rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">{userStats.totalPuzzlesSolved}</div>
                  <div className="text-[#97a1c4] text-sm">Puzzles Solved</div>
                </div>
                <div className="bg-[#374162] rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{userStats.currentPuzzleRating}</div>
                  <div className="text-[#97a1c4] text-sm">Current Rating</div>
                </div>
                <div className="bg-[#374162] rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{userStats.currentStreak}</div>
                  <div className="text-[#97a1c4] text-sm">Current Streak</div>
                </div>
                <div className="bg-[#374162] rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-400">{userStats.averageAccuracy.toFixed(1)}%</div>
                  <div className="text-[#97a1c4] text-sm">Accuracy</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Puzzle Themes Grid */}
        <div className="mb-8">
          <div className="bg-[#272e45] rounded-2xl p-6 border border-[#374162]">
            <h3 className="text-2xl font-bold text-white mb-6">🎯 Puzzle Themes</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {puzzleThemes.map((theme, index) => (
                <Link
                  key={index}
                  to={`/puzzle-training?theme=${theme.name.toLowerCase()}`}
                  className={`bg-gradient-to-r ${theme.color} rounded-xl p-4 text-white hover:scale-105 transition-transform shadow-lg`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{theme.icon}</span>
                    <span className="text-sm opacity-75">{theme.count}</span>
                  </div>
                  <h4 className="font-bold text-lg">{theme.name}</h4>
                  <p className="text-sm opacity-90">Practice {theme.name.toLowerCase()} tactics</p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/puzzle-training"
            className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white hover:scale-105 transition-transform shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">🎓 Puzzle Training</h3>
                <p className="text-green-100">Structured learning with progressive difficulty</p>
              </div>
              <div className="text-4xl">→</div>
            </div>
          </Link>
          
          <Link
            to="/puzzle-solver"
            className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white hover:scale-105 transition-transform shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">🧩 Puzzle Solver</h3>
                <p className="text-orange-100">Solve individual puzzles at your own pace</p>
              </div>
              <div className="text-4xl">→</div>
            </div>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Puzzles;
