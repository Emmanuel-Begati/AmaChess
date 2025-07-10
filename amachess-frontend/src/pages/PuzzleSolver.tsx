import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChessBoard from '../components/ChessGame';

const PuzzleSolver = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [userMove, setUserMove] = useState('');
  const [puzzleState, setPuzzleState] = useState('solving'); // 'solving', 'correct', 'incorrect', 'hint'
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [streak, setStreak] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  // Get filter parameters from URL
  const themeFilter = searchParams.get('theme') || 'all';
  const difficultyFilter = searchParams.get('difficulty') || 'all';
  const ratingFilter = searchParams.get('rating') || 'all';

  // Comprehensive puzzle database
  const puzzleDatabase = [
    {
      id: 1,
      fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4",
      title: "Italian Game Trap",
      theme: "Pin",
      subThemes: ["Discovery", "Tempo"],
      difficulty: "Beginner",
      rating: 1200,
      solution: ["Bxf7+"],
      explanation: "The bishop sacrifice on f7 creates a discovered check and wins material due to the pin on the king.",
      hint: "Look for a forcing move that attacks the king and wins material.",
      movesToSolve: 1,
      popularity: 85,
      successRate: 76,
      averageTime: 45,
      description: "A classic tactical motif in the Italian Game where White sacrifices the bishop to win material.",
      learningObjectives: ["Recognize pin patterns", "Calculate forcing moves", "Understand sacrifice motifs"]
    },
    {
      id: 2,
      fen: "rnbqkb1r/ppp2ppp/4pn2/3p4/2PP4/2N2N2/PP2PPPP/R1BQKB1R b KQkq - 0 4",
      title: "Queen's Gambit Fork",
      theme: "Fork",
      subThemes: ["Knight Fork", "Center Control"],
      difficulty: "Intermediate", 
      rating: 1500,
      solution: ["Ne4"],
      explanation: "The knight moves to e4, forking the queen and bishop while controlling important central squares.",
      hint: "Find a knight move that attacks two pieces simultaneously.",
      movesToSolve: 1,
      popularity: 92,
      successRate: 68,
      averageTime: 62,
      description: "A powerful knight fork that demonstrates the importance of piece coordination in the Queen's Gambit.",
      learningObjectives: ["Master knight fork patterns", "Understand piece coordination", "Develop tactical vision"]
    },
    {
      id: 3,
      fen: "r2qk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/3P1N2/PPP1QPPP/RNB1K2R w KQkq - 0 6",
      title: "Discovered Attack Masterpiece",
      theme: "Discovery",
      subThemes: ["Double Attack", "Piece Activity"],
      difficulty: "Advanced",
      rating: 1800,
      solution: ["Ng5"],
      explanation: "Moving the knight creates a discovered attack from the queen to the bishop while attacking f7.",
      hint: "Move a piece to create a discovered attack while gaining tempo.",
      movesToSolve: 1,
      popularity: 78,
      successRate: 52,
      averageTime: 89,
      description: "An elegant discovered attack that showcases the power of piece coordination and double threats.",
      learningObjectives: ["Recognize discovered attack patterns", "Calculate double threats", "Improve tactical calculation"]
    },
    {
      id: 4,
      fen: "2kr3r/ppp1qppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP1QPPP/R1B1K2R w KQ - 0 8",
      title: "Back Rank Weakness",
      theme: "Back Rank",
      subThemes: ["Deflection", "Mating Attack"],
      difficulty: "Expert",
      rating: 2000,
      solution: ["Qe8+"],
      explanation: "The queen sacrifice forces the king to capture, leading to a back rank mate with the rook.",
      hint: "Look for a forcing move that exploits the weak back rank.",
      movesToSolve: 2,
      popularity: 89,
      successRate: 34,
      averageTime: 156,
      description: "A brilliant queen sacrifice that demonstrates the devastating power of back rank weaknesses.",
      learningObjectives: ["Identify back rank patterns", "Calculate sacrificial attacks", "Master mating combinations"]
    },
    {
      id: 5,
      fen: "r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP1QPPP/R1B1R1K1 b - - 0 8",
      title: "Deflection Tactic",
      theme: "Deflection",
      subThemes: ["Overloaded Piece", "Material Gain"],
      difficulty: "Intermediate",
      rating: 1650,
      solution: ["Bxf2+"],
      explanation: "The bishop sacrifice deflects the king, allowing Black to win the queen with a discovered check.",
      hint: "Find a way to deflect the defender of an important piece.",
      movesToSolve: 2,
      popularity: 73,
      successRate: 61,
      averageTime: 78,
      description: "A classic deflection tactic that removes a key defender to win material.",
      learningObjectives: ["Understand deflection concepts", "Identify overloaded pieces", "Practice tactical sequences"]
    },
    {
      id: 6,
      fen: "r2qk2r/ppp2ppp/2n2n2/2bpp3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq d6 0 6",
      title: "Skewer Pattern",
      theme: "Skewer",
      subThemes: ["X-ray Attack", "Material Win"],
      difficulty: "Beginner",
      rating: 1300,
      solution: ["Bb5"],
      explanation: "The bishop pins the knight to the king, winning material when the knight moves.",
      hint: "Use your bishop to create a pin along the diagonal.",
      movesToSolve: 1,
      popularity: 81,
      successRate: 72,
      averageTime: 38,
      description: "A fundamental skewer pattern that demonstrates the power of long-range pieces.",
      learningObjectives: ["Master skewer patterns", "Understand pin vs skewer", "Develop pattern recognition"]
    }
  ];

  // Filter puzzles based on URL parameters
  const filteredPuzzles = puzzleDatabase.filter(puzzle => {
    const themeMatch = themeFilter === 'all' || puzzle.theme.toLowerCase() === themeFilter.toLowerCase();
    const difficultyMatch = difficultyFilter === 'all' || puzzle.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    const ratingMatch = ratingFilter === 'all' || 
      (ratingFilter === '1000-1400' && puzzle.rating >= 1000 && puzzle.rating <= 1400) ||
      (ratingFilter === '1400-1800' && puzzle.rating >= 1400 && puzzle.rating <= 1800) ||
      (ratingFilter === '1800+' && puzzle.rating >= 1800);
    
    return themeMatch && difficultyMatch && ratingMatch;
  });

  const currentPuzzle = filteredPuzzles[currentPuzzleIndex];

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Reset timer when puzzle changes
  useEffect(() => {
    setStartTime(Date.now());
    setTimeSpent(0);
  }, [currentPuzzleIndex]);

  const handleMove = (move, newFen) => {
    const moveNotation = move.san;
    setUserMove(moveNotation);
    setAttempts(prev => prev + 1);

    if (currentPuzzle.solution.includes(moveNotation)) {
      setPuzzleState('correct');
      setStreak(prev => prev + 1);
      setTotalSolved(prev => prev + 1);
      
      // Update accuracy
      const newAccuracy = (totalSolved + 1) / ((totalSolved + 1) + (attempts - totalSolved)) * 100;
      setAccuracy(Math.round(newAccuracy));
      
      // Auto-advance after 2 seconds
      setTimeout(() => {
        nextPuzzle();
      }, 2000);
    } else {
      setPuzzleState('incorrect');
      setStreak(0);
      
      // Reset after 1.5 seconds
      setTimeout(() => {
        setPuzzleState('solving');
      }, 1500);
    }
  };

  const nextPuzzle = () => {
    if (currentPuzzleIndex < filteredPuzzles.length - 1) {
      setCurrentPuzzleIndex(prev => prev + 1);
      setPuzzleState('solving');
      setAttempts(0);
      setShowHint(false);
      setUserMove('');
    }
  };

  const previousPuzzle = () => {
    if (currentPuzzleIndex > 0) {
      setCurrentPuzzleIndex(prev => prev - 1);
      setPuzzleState('solving');
      setAttempts(0);
      setShowHint(false);
      setUserMove('');
    }
  };

  const showPuzzleHint = () => {
    setShowHint(true);
    setPuzzleState('hint');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'text-green-400 bg-green-900/20 border-green-600';
      case 'intermediate': return 'text-yellow-400 bg-yellow-900/20 border-yellow-600';
      case 'advanced': return 'text-orange-400 bg-orange-900/20 border-orange-600';
      case 'expert': return 'text-red-400 bg-red-900/20 border-red-600';
      default: return 'text-blue-400 bg-blue-900/20 border-blue-600';
    }
  };

  if (!currentPuzzle) {
    return (
      <div className="min-h-screen bg-[#121621] text-white">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">No puzzles found</h2>
            <p className="text-[#97a1c4] mb-6">Try adjusting your filters or go back to browse all puzzles.</p>
            <button 
              onClick={() => navigate('/puzzles')}
              className="px-6 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Puzzles
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121621] text-white">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Puzzle Solver</h1>
            <p className="text-[#97a1c4]">
              Puzzle {currentPuzzleIndex + 1} of {filteredPuzzles.length}
              {themeFilter !== 'all' && ` • ${themeFilter} theme`}
            </p>
          </div>
          <button 
            onClick={() => navigate('/puzzles')}
            className="px-4 py-2 bg-[#374162] text-white rounded-lg hover:bg-[#455173] transition-colors"
          >
            ← Back to Puzzles
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
            <p className="text-[#97a1c4] text-sm">Current Streak</p>
            <p className="text-2xl font-bold text-orange-400">{streak}</p>
          </div>
          <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
            <p className="text-[#97a1c4] text-sm">Solved Today</p>
            <p className="text-2xl font-bold text-green-400">{totalSolved}</p>
          </div>
          <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
            <p className="text-[#97a1c4] text-sm">Accuracy</p>
            <p className="text-2xl font-bold text-blue-400">{accuracy}%</p>
          </div>
          <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
            <p className="text-[#97a1c4] text-sm">Time</p>
            <p className="text-2xl font-bold text-purple-400">{formatTime(timeSpent)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Left Column - Puzzle Info */}
          <div className="xl:col-span-1 space-y-6">
            {/* Puzzle Details */}
            <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
              <h3 className="text-xl font-bold text-white mb-4">{currentPuzzle.title}</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#97a1c4]">Theme:</span>
                  <span className="text-blue-400 font-medium">{currentPuzzle.theme}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#97a1c4]">Rating:</span>
                  <span className="text-white font-bold">{currentPuzzle.rating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#97a1c4]">Difficulty:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(currentPuzzle.difficulty)}`}>
                    {currentPuzzle.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#97a1c4]">Moves to solve:</span>
                  <span className="text-white font-medium">{currentPuzzle.movesToSolve}</span>
                </div>
              </div>

              <div className="border-t border-[#374162] pt-4">
                <p className="text-[#97a1c4] text-sm">{currentPuzzle.description}</p>
              </div>
            </div>

            {/* Sub-themes */}
            <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
              <h4 className="text-white font-semibold mb-3">Tactical Themes</h4>
              <div className="flex flex-wrap gap-2">
                {currentPuzzle.subThemes.map((theme, index) => (
                  <span key={index} className="bg-blue-800/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            {/* Learning Objectives */}
            <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
              <h4 className="text-white font-semibold mb-3">Learning Objectives</h4>
              <ul className="space-y-2">
                {currentPuzzle.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-[#97a1c4] text-sm">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Puzzle Stats */}
            <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
              <h4 className="text-white font-semibold mb-3">Puzzle Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#97a1c4]">Success Rate</p>
                  <p className="text-green-400 font-bold">{currentPuzzle.successRate}%</p>
                </div>
                <div>
                  <p className="text-[#97a1c4]">Popularity</p>
                  <p className="text-blue-400 font-bold">{currentPuzzle.popularity}%</p>
                </div>
                <div>
                  <p className="text-[#97a1c4]">Avg Time</p>
                  <p className="text-purple-400 font-bold">{currentPuzzle.averageTime}s</p>
                </div>
                <div>
                  <p className="text-[#97a1c4]">Your Attempts</p>
                  <p className="text-orange-400 font-bold">{attempts}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - Chess Board */}
          <div className="xl:col-span-3 flex flex-col items-center">
            <div className="mb-6">
              <ChessBoard
                position={currentPuzzle.fen}
                onMove={handleMove}
                interactive={puzzleState === 'solving' || puzzleState === 'hint'}
                showNotation={true}
                width={750}
              />
            </div>

            {/* Move Input & Controls */}
            <div className="w-full max-w-lg space-y-4">
              {/* Status Display */}
              {puzzleState === 'correct' && (
                <div className="bg-green-600 text-white p-4 rounded-lg text-center">
                  <p className="font-semibold">✓ Correct! Well done!</p>
                  <p className="text-sm opacity-90">+10 rating points • Moving to next puzzle...</p>
                </div>
              )}
              
              {puzzleState === 'incorrect' && (
                <div className="bg-red-600 text-white p-4 rounded-lg text-center">
                  <p className="font-semibold">✗ Not quite right</p>
                  <p className="text-sm opacity-90">Try again! Look for {currentPuzzle.theme.toLowerCase()} patterns.</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={showPuzzleHint}
                  disabled={showHint || puzzleState === 'correct'}
                  className="flex-1 bg-yellow-800 hover:bg-yellow-700 disabled:bg-[#374162] disabled:opacity-50 text-white py-3 rounded-lg transition-colors font-medium"
                >
                  {showHint ? 'Hint Shown' : 'Show Hint'}
                </button>
                <button
                  onClick={() => setPuzzleState('solving')}
                  disabled={puzzleState === 'correct'}
                  className="flex-1 bg-[#374162] hover:bg-[#455173] disabled:opacity-50 text-white py-3 rounded-lg transition-colors font-medium"
                >
                  Reset Position
                </button>
              </div>

              {/* Hint Display */}
              {showHint && (
                <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
                  <p className="text-yellow-400 font-medium mb-2">💡 Hint:</p>
                  <p className="text-white text-sm">{currentPuzzle.hint}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Navigation & Solution */}
          <div className="xl:col-span-1 space-y-6">
            {/* Navigation */}
            <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
              <h4 className="text-white font-semibold mb-4">Navigation</h4>
              <div className="space-y-3">
                <button
                  onClick={previousPuzzle}
                  disabled={currentPuzzleIndex === 0}
                  className="w-full flex items-center justify-center gap-2 bg-[#374162] hover:bg-[#455173] disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous Puzzle
                </button>
                <button
                  onClick={nextPuzzle}
                  disabled={currentPuzzleIndex === filteredPuzzles.length - 1}
                  className="w-full flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors"
                >
                  Next Puzzle
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Solution (shown after hint or correct answer) */}
            {(showHint || puzzleState === 'correct') && (
              <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                <h4 className="text-white font-semibold mb-3">Solution</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-[#97a1c4] text-sm mb-1">Best move:</p>
                    <p className="text-white font-mono text-lg">{currentPuzzle.solution[0]}</p>
                  </div>
                  <div>
                    <p className="text-[#97a1c4] text-sm mb-2">Explanation:</p>
                    <p className="text-white text-sm">{currentPuzzle.explanation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Progress */}
            <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
              <h4 className="text-white font-semibold mb-3">Progress</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#97a1c4]">Completion</span>
                    <span className="text-white">{currentPuzzleIndex + 1}/{filteredPuzzles.length}</span>
                  </div>
                  <div className="w-full bg-[#374162] rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentPuzzleIndex + 1) / filteredPuzzles.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[#97a1c4]">Solved</p>
                    <p className="text-green-400 font-bold">{totalSolved}</p>
                  </div>
                  <div>
                    <p className="text-[#97a1c4]">Remaining</p>
                    <p className="text-blue-400 font-bold">{filteredPuzzles.length - currentPuzzleIndex - 1}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
              <h4 className="text-white font-semibold mb-4">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-2 bg-[#374162] hover:bg-[#455173] text-white rounded-lg transition-colors text-sm">
                  🔀 Shuffle Puzzles
                </button>
                <button className="w-full text-left px-4 py-2 bg-[#374162] hover:bg-[#455173] text-white rounded-lg transition-colors text-sm">
                  🎯 Practice This Theme
                </button>
                <button className="w-full text-left px-4 py-2 bg-[#374162] hover:bg-[#455173] text-white rounded-lg transition-colors text-sm">
                  📊 View Statistics
                </button>
                <button className="w-full text-left px-4 py-2 bg-[#374162] hover:bg-[#455173] text-white rounded-lg transition-colors text-sm">
                  💾 Save Progress
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PuzzleSolver;
