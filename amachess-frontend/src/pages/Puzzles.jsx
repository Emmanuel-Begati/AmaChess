import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChessBoard from '../components/ChessBoard';

const Puzzles = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [dailyPuzzleCompleted, setDailyPuzzleCompleted] = useState(false);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [randomPuzzleMode, setRandomPuzzleMode] = useState(false);
  const [currentRandomPuzzle, setCurrentRandomPuzzle] = useState(null);
  const [randomPuzzleCompleted, setRandomPuzzleCompleted] = useState(false);

  // User puzzle statistics
  const userStats = {
    puzzlesSolved: 1247,
    puzzleRating: 1685,
    bestStreak: 23,
    currentStreak: 8,
    averageRating: 1542,
    improvementThisMonth: 87,
    accuracyRate: 76.3,
    averageTime: 45,
    favoriteTheme: "Pin"
  };

  // Daily Challenge
  const dailyChallenge = {
    id: "daily_2024_01_20",
    title: "Daily Challenge - January 20",
    fen: "r2qkb1r/pp2nppp/3p4/2pP4/4P3/2N2N2/PPP2PPP/R1BQKB1R w KQkq c6 0 6",
    theme: "Discovered Attack",
    rating: 1650,
    movesToMate: 3,
    averageTime: 63,
    solveCount: 2847,
    attempts: 4521,
    successRate: 63,
    solution: ["1. Nxe7+", "Qxe7", "2. Nd5"],
    description: "White has a powerful discovered attack. Find the winning sequence!"
  };

  // Featured Puzzles with tactical motifs
  const featuredPuzzles = [
    {
      id: 1,
      title: "Tactical Masterpiece",
      description: "A brilliant combination featuring multiple tactical motifs",
      difficulty: "Expert",
      rating: 2100,
      theme: "Combination",
      subThemes: ["Pin", "Fork", "Deflection"],
      gradient: "from-purple-600 to-indigo-600",
      fen: "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4",
      movesToSolve: 4,
      solveRate: 34,
      averageTime: 182
    },
    {
      id: 2,
      title: "Endgame Precision",
      description: "Test your endgame technique in this critical position",
      difficulty: "Advanced",
      rating: 1850,
      theme: "Endgame",
      subThemes: ["King Activity", "Pawn Promotion"],
      gradient: "from-blue-600 to-cyan-600",
      fen: "8/8/8/3k4/8/3K4/3P4/8 w - - 0 1",
      movesToSolve: 6,
      solveRate: 67,
      averageTime: 94
    },
    {
      id: 3,
      title: "Attacking Fury",
      description: "Launch a devastating attack against the enemy king",
      difficulty: "Hard",
      rating: 1750,
      theme: "Attack",
      subThemes: ["Sacrifice", "Mating Attack"],
      gradient: "from-red-600 to-pink-600",
      fen: "r2qkb1r/ppp2ppp/2np1n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 b kq - 0 5",
      movesToSolve: 5,
      solveRate: 45,
      averageTime: 156
    }
  ];

  // Performance Analytics Data
  const performanceData = {
    weeklyProgress: [
      { day: 'Mon', solved: 12, accuracy: 78 },
      { day: 'Tue', solved: 15, accuracy: 82 },
      { day: 'Wed', solved: 18, accuracy: 75 },
      { day: 'Thu', solved: 22, accuracy: 80 },
      { day: 'Fri', solved: 19, accuracy: 85 },
      { day: 'Sat', solved: 25, accuracy: 88 },
      { day: 'Sun', solved: 20, accuracy: 83 }
    ],
    themePerformance: [
      { theme: "Pin", solved: 89, accuracy: 82, rating: 1720 },
      { theme: "Fork", solved: 76, accuracy: 79, rating: 1680 },
      { theme: "Skewer", solved: 54, accuracy: 85, rating: 1750 },
      { theme: "Back Rank", solved: 43, accuracy: 77, rating: 1640 },
      { theme: "Deflection", solved: 38, accuracy: 81, rating: 1695 },
      { theme: "Discovery", solved: 32, accuracy: 74, rating: 1615 }
    ],
    ratingHistory: [
      { month: 'Sep', rating: 1520 },
      { month: 'Oct', rating: 1548 },
      { month: 'Nov', rating: 1591 },
      { month: 'Dec', rating: 1634 },
      { month: 'Jan', rating: 1685 }
    ]
  };

  // Latest Achievements
  const achievements = [
    {
      id: 1,
      title: "Tactical Genius",
      description: "Solved 50 puzzles with 90%+ accuracy",
      icon: "🧠",
      unlocked: true,
      date: "2024-01-18",
      rarity: "Epic"
    },
    {
      id: 2,
      title: "Speed Demon",
      description: "Solved 10 puzzles under 30 seconds",
      icon: "⚡",
      unlocked: true,
      date: "2024-01-15",
      rarity: "Rare"
    },
    {
      id: 3,
      title: "Streak Master",
      description: "Maintain a 20+ solve streak",
      icon: "🔥",
      unlocked: true,
      date: "2024-01-12",
      rarity: "Legendary"
    },
    {
      id: 4,
      title: "Pin Expert",
      description: "Master 100 pin puzzles",
      icon: "📌",
      unlocked: false,
      progress: 87,
      rarity: "Rare"
    }
  ];

  // Leaderboard
  const leaderboard = [
    { rank: 1, username: "TacticalMaster", rating: 2847, solved: 5642, country: "🇷🇺" },
    { rank: 2, username: "ChessNinja", rating: 2798, solved: 4891, country: "🇺🇸" },
    { rank: 3, username: "PuzzleKing", rating: 2756, solved: 6234, country: "🇮🇳" },
    { rank: 4, username: "EndgameHero", rating: 2734, solved: 3987, country: "🇩🇪" },
    { rank: 5, username: "TacticQueen", rating: 2712, solved: 4156, country: "🇫🇷" },
    { rank: 67, username: "You", rating: 1685, solved: 1247, country: "🇺🇸", highlight: true },
  ];

  // Practice puzzles by theme
  const puzzleThemes = [
    { name: "Pin", count: 1247, difficulty: "★★☆", color: "bg-blue-600" },
    { name: "Fork", count: 983, difficulty: "★☆☆", color: "bg-green-600" },
    { name: "Skewer", count: 756, difficulty: "★★★", color: "bg-purple-600" },
    { name: "Back Rank", count: 642, difficulty: "★★☆", color: "bg-red-600" },
    { name: "Deflection", count: 589, difficulty: "★★★", color: "bg-orange-600" },
    { name: "Discovery", count: 534, difficulty: "★★★", color: "bg-indigo-600" },
    { name: "Double Attack", count: 478, difficulty: "★★☆", color: "bg-pink-600" },
    { name: "Zugzwang", count: 234, difficulty: "★★★★", color: "bg-gray-600" }
  ];

  const solveDailyPuzzle = () => {
    setDailyPuzzleCompleted(true);
  };

  const handlePuzzleMove = (move, newFen) => {
    // Handle puzzle move logic here
    console.log('Puzzle move:', move, newFen);
  };

  const handleDailyPuzzleMove = (move, newFen) => {
    console.log('Daily puzzle move:', move, newFen);
    // Check if move is correct solution
    if (move.san === dailyChallenge.solution[0]) {
      solveDailyPuzzle();
    }
  };

  // Random puzzles database (in real app, this would come from your backend)
  const randomPuzzles = [
    {
      id: "rp_001",
      fen: "2rr3k/pp3pp1/1nnqbN1p/3ppN2/2nPP3/2P1B3/PPQ2PPP/R4RK1 w - - 0 1",
      theme: "Double Attack",
      rating: 1750,
      solution: ["Qxc4", "Nxc4", "Nxd6"],
      description: "White has a powerful knight fork. Find the winning sequence!",
      difficulty: "Hard",
      moves: 3
    },
    {
      id: "rp_002",
      fen: "r1bqk2r/pp2nppp/2n1p3/2ppP3/3P4/2P1BN2/PP3PPP/RNBQ1RK1 b kq - 0 8",
      theme: "Pin",
      rating: 1600,
      solution: ["Bg4"],
      description: "Black can pin the white knight and gain a material advantage.",
      difficulty: "Medium",
      moves: 1
    },
    {
      id: "rp_003",
      fen: "r3k2r/pb3p2/2p1pn2/1p6/3P4/1B2P3/P4PPP/R3K2R w KQkq - 0 1",
      theme: "Back Rank",
      rating: 1900,
      solution: ["Ra8+", "Rxa8", "Rxa8#"],
      description: "White can deliver a back rank mate. How?",
      difficulty: "Expert",
      moves: 3
    },
    {
      id: "rp_004",
      fen: "r1bq1rk1/ppp2ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQR1K1 w - - 0 9",
      theme: "Discovery",
      rating: 1400,
      solution: ["Nxe5"],
      description: "A discovered attack wins material for White.",
      difficulty: "Easy",
      moves: 1
    },
    {
      id: "rp_005",
      fen: "r2q1rk1/ppp2ppp/2n1bn2/2b1p3/3pP3/3P1NP1/PPP1NPP1/R1BQKB1R w KQ - 0 9",
      theme: "Deflection",
      rating: 1850,
      solution: ["Bxf7+", "Kxf7", "Ng5+"],
      description: "Deflect the king and attack the queen!",
      difficulty: "Advanced",
      moves: 3
    }
  ];

  const getRandomPuzzle = () => {
    const availablePuzzles = randomPuzzles.filter(puzzle => 
      selectedDifficulty === 'All' || puzzle.difficulty === selectedDifficulty
    );
    const randomIndex = Math.floor(Math.random() * availablePuzzles.length);
    return availablePuzzles[randomIndex];
  };

  const startRandomPuzzleMode = () => {
    const puzzle = getRandomPuzzle();
    setCurrentRandomPuzzle(puzzle);
    setRandomPuzzleMode(true);
    setRandomPuzzleCompleted(false);
    setShowSolution(false);
  };

  const handleRandomPuzzleMove = (move, newFen) => {
    if (!currentRandomPuzzle || randomPuzzleCompleted) return;
    
    console.log('Random puzzle move:', move, newFen);
    // Check if move matches the solution
    if (move.san === currentRandomPuzzle.solution[0]) {
      setRandomPuzzleCompleted(true);
    }
  };

  const nextRandomPuzzle = () => {
    const puzzle = getRandomPuzzle();
    setCurrentRandomPuzzle(puzzle);
    setRandomPuzzleCompleted(false);
    setShowSolution(false);
  };

  const exitRandomPuzzleMode = () => {
    setRandomPuzzleMode(false);
    setCurrentRandomPuzzle(null);
    setRandomPuzzleCompleted(false);
    setShowSolution(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-[#121621] text-white">
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        
        <div className="px-4 lg:px-8 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col max-w-7xl flex-1">
            
            {/* Random Puzzle Solver Mode */}
            {randomPuzzleMode && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-gradient-to-br from-[#272e45] to-[#374162] rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[#455173]">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">Random Puzzle Challenge</h2>
                      <p className="text-[#97a1c4]">Solve puzzles to improve your tactical skills</p>
                    </div>
                    <button 
                      onClick={exitRandomPuzzleMode}
                      className="text-[#97a1c4] hover:text-white transition-colors"
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {currentRandomPuzzle && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Puzzle Board */}
                      <div className="bg-[#374162] rounded-xl p-6">
                        <div className="flex justify-center mb-4">
                          <ChessBoard
                            position={currentRandomPuzzle.fen}
                            onMove={handleRandomPuzzleMove}
                            interactive={!randomPuzzleCompleted}
                            showNotation={true}
                            width={400}
                          />
                        </div>
                        
                        {/* Puzzle Status */}
                        <div className="text-center">
                          <p className="text-[#97a1c4] text-sm mb-3">{currentRandomPuzzle.description}</p>
                          {!randomPuzzleCompleted ? (
                            <p className="text-blue-400 text-sm font-medium">
                              Find the best move for White
                            </p>
                          ) : (
                            <div className="bg-green-600 text-white p-3 rounded-lg mb-4">
                              <p className="font-semibold">✓ Puzzle Solved!</p>
                              <p className="text-sm opacity-90">Great job! +10 puzzle rating</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Puzzle Info & Controls */}
                      <div className="space-y-6">
                        {/* Puzzle Details */}
                        <div className="bg-[#374162] rounded-lg p-6">
                          <h3 className="text-xl font-semibold text-white mb-4">Puzzle Details</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[#97a1c4] text-sm">Theme</p>
                              <p className="text-white font-semibold">{currentRandomPuzzle.theme}</p>
                            </div>
                            <div>
                              <p className="text-[#97a1c4] text-sm">Rating</p>
                              <p className="text-white font-semibold">{currentRandomPuzzle.rating}</p>
                            </div>
                            <div>
                              <p className="text-[#97a1c4] text-sm">Difficulty</p>
                              <p className="text-white font-semibold">{currentRandomPuzzle.difficulty}</p>
                            </div>
                            <div>
                              <p className="text-[#97a1c4] text-sm">Moves</p>
                              <p className="text-white font-semibold">{currentRandomPuzzle.moves}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          {randomPuzzleCompleted && (
                            <button
                              onClick={nextRandomPuzzle}
                              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                              Next Puzzle
                            </button>
                          )}
                          
                          <button
                            onClick={() => setShowSolution(!showSolution)}
                            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-semibold transition-colors"
                          >
                            {showSolution ? 'Hide Solution' : 'Show Solution'}
                          </button>

                          <button
                            onClick={nextRandomPuzzle}
                            className="w-full bg-[#455173] hover:bg-[#566280] text-white py-3 rounded-lg font-semibold transition-colors"
                          >
                            Skip Puzzle
                          </button>
                        </div>

                        {/* Solution Display */}
                        {showSolution && (
                          <div className="bg-[#455173] rounded-lg p-4">
                            <h4 className="text-white font-semibold mb-2">Solution:</h4>
                            <div className="flex flex-wrap gap-2">
                              {currentRandomPuzzle.solution.map((move, index) => (
                                <span key={index} className="bg-blue-800 text-white px-3 py-1 rounded text-sm font-medium">
                                  {index + 1}. {move}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">Chess Puzzles</h1>
              <p className="text-[#97a1c4] text-lg">Sharpen your tactical skills with our collection of chess puzzles</p>
            </div>

           

            {/* User Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-[#272e45] to-[#374162] rounded-xl p-6 border border-[#374162]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🧩</span>
                  </div>
                  <div>
                    <p className="text-[#97a1c4] text-sm">Puzzles Solved</p>
                    <p className="text-2xl font-bold text-white">{userStats.puzzlesSolved.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-green-400 text-sm">+{userStats.improvementThisMonth} this month</p>
              </div>

              <div className="bg-gradient-to-br from-[#272e45] to-[#374162] rounded-xl p-6 border border-[#374162]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-xl">⭐</span>
                  </div>
                  <div>
                    <p className="text-[#97a1c4] text-sm">Puzzle Rating</p>
                    <p className="text-2xl font-bold text-white">{userStats.puzzleRating}</p>
                  </div>
                </div>
                <p className="text-purple-400 text-sm">Top 15% globally</p>
              </div>

              <div className="bg-gradient-to-br from-[#272e45] to-[#374162] rounded-xl p-6 border border-[#374162]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🔥</span>
                  </div>
                  <div>
                    <p className="text-[#97a1c4] text-sm">Best Streak</p>
                    <p className="text-2xl font-bold text-white">{userStats.bestStreak}</p>
                  </div>
                </div>
                <p className="text-orange-400 text-sm">Current: {userStats.currentStreak}</p>
              </div>

              <div className="bg-gradient-to-br from-[#272e45] to-[#374162] rounded-xl p-6 border border-[#374162]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🎯</span>
                  </div>
                  <div>
                    <p className="text-[#97a1c4] text-sm">Accuracy Rate</p>
                    <p className="text-2xl font-bold text-white">{userStats.accuracyRate}%</p>
                  </div>
                </div>
                <p className="text-green-400 text-sm">Avg time: {userStats.averageTime}s</p>
              </div>
            </div>

            {/* Daily Challenge Section */}
            <div className="bg-gradient-to-r from-[#272e45] to-[#1e293b] rounded-xl p-8 mb-8 border border-[#374162]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👑</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{dailyChallenge.title}</h2>
                  <p className="text-[#97a1c4]">{dailyChallenge.theme} • Rating: {dailyChallenge.rating}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chess Board */}
                <div className="bg-[#374162] rounded-xl p-6">
                  <div className="flex justify-center mb-4">
                    <ChessBoard
                      position={dailyChallenge.fen}
                      onMove={handleDailyPuzzleMove}
                      interactive={!dailyPuzzleCompleted}
                      showNotation={true}
                      width={500}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[#97a1c4] text-sm mb-3">{dailyChallenge.description}</p>
                    {!dailyPuzzleCompleted ? (
                      <p className="text-blue-400 text-sm font-medium">
                        Make your move on the board above
                      </p>
                    ) : (
                      <div className="bg-green-600 text-white p-3 rounded-lg">
                        <p className="font-semibold">✓ Completed!</p>
                        <p className="text-sm opacity-90">+25 rating points earned</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Challenge Stats */}
                <div className="space-y-4">
                  <div className="bg-[#374162] rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Challenge Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[#97a1c4] text-sm">Average Time</p>
                        <p className="text-xl font-bold text-blue-400">{dailyChallenge.averageTime}s</p>
                      </div>
                      <div>
                        <p className="text-[#97a1c4] text-sm">Success Rate</p>
                        <p className="text-xl font-bold text-green-400">{dailyChallenge.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-[#97a1c4] text-sm">Solved By</p>
                        <p className="text-xl font-bold text-purple-400">{dailyChallenge.solveCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[#97a1c4] text-sm">Attempts</p>
                        <p className="text-xl font-bold text-orange-400">{dailyChallenge.attempts.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#374162] rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Puzzle Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#97a1c4]">Theme:</span>
                        <span className="text-white font-medium">{dailyChallenge.theme}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#97a1c4]">Moves to solve:</span>
                        <span className="text-white font-medium">{dailyChallenge.movesToMate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#97a1c4]">Rating:</span>
                        <span className="text-white font-medium">{dailyChallenge.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="pb-3 mb-6">
              <div className="flex border-b border-[#374162] gap-8">
                {['All', 'Daily', 'Custom', 'Saved'].map((tab) => (
                  <button
                    key={tab}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                      activeTab === tab 
                        ? 'border-b-blue-800 text-white' 
                        : 'border-b-transparent text-[#97a1c4] hover:text-white'
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    <p className="text-sm font-bold leading-normal tracking-[0.015em]">{tab}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Puzzles Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Featured Puzzles</h2>
                <div className="flex gap-2">
                  {['All', 'Easy', 'Medium', 'Hard', 'Expert'].map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedDifficulty === difficulty
                          ? 'bg-blue-800 text-white'
                          : 'bg-[#374162] text-[#97a1c4] hover:bg-[#455173] hover:text-white'
                      }`}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPuzzles.map((puzzle) => (
                  <div key={puzzle.id} className="bg-gradient-to-br from-[#272e45] to-[#374162] rounded-xl overflow-hidden border border-[#374162] hover:border-blue-600 transition-all duration-300 hover:transform hover:scale-105">
                    {/* Chess Board for Puzzle */}
                    <div className="p-4 bg-[#374162]">
                      <div className="flex justify-center">
                        <ChessBoard
                          position={puzzle.fen}
                          onMove={(move, newFen) => handlePuzzleMove(move, newFen)}
                          interactive={false}
                          showNotation={false}
                          width={340}
                        />
                      </div>
                      
                      {/* Rating badge overlay */}
                      <div className="flex justify-between items-center mt-2">
                        <span className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm font-medium">
                          {puzzle.rating}
                        </span>
                        <span className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-xs font-medium">
                          {puzzle.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white mb-2">{puzzle.title}</h3>
                      <p className="text-[#97a1c4] text-sm mb-4">{puzzle.description}</p>
                      
                      {/* Theme badge */}
                      <div className="flex justify-center mb-4">
                        <span className="bg-blue-800/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                          {puzzle.theme}
                        </span>
                      </div>
                      
                      {/* Tactical themes */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {puzzle.subThemes.map((theme, index) => (
                          <span key={index} className="bg-blue-800/20 text-blue-400 px-2 py-1 rounded text-xs font-medium">
                            {theme}
                          </span>
                        ))}
                      </div>

                      {/* Puzzle stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-[#97a1c4]">Success Rate</p>
                          <p className="text-white font-semibold">{puzzle.solveRate}%</p>
                        </div>
                        <div>
                          <p className="text-[#97a1c4]">Avg Time</p>
                          <p className="text-white font-semibold">{puzzle.averageTime}s</p>
                        </div>
                      </div>

                      <Link 
                        to={`/puzzle-solver?theme=${puzzle.theme}&difficulty=${puzzle.difficulty}`}
                        className="w-full bg-blue-800 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors block text-center"
                      >
                        Solve Puzzle
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Analytics */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Performance Analytics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weekly Progress Chart */}
                <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                  <h3 className="text-xl font-semibold text-white mb-4">This Week's Progress</h3>
                  <div className="space-y-4">
                    {performanceData.weeklyProgress.map((day, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-[#97a1c4] text-sm w-8">{day.day}</span>
                          <div className="w-32 bg-[#374162] rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                              style={{ width: `${(day.solved / 25) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-semibold">{day.solved}</p>
                          <p className="text-[#97a1c4] text-xs">{day.accuracy}% acc</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Theme Performance */}
                <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                  <h3 className="text-xl font-semibold text-white mb-4">Theme Performance</h3>
                  <div className="space-y-3">
                    {performanceData.themePerformance.map((theme, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[#374162] rounded-lg">
                        <div>
                          <p className="text-white font-medium">{theme.theme}</p>
                          <p className="text-[#97a1c4] text-sm">{theme.solved} solved</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{theme.rating}</p>
                          <p className="text-green-400 text-sm">{theme.accuracy}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rating History */}
              <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162] mt-6">
                <h3 className="text-xl font-semibold text-white mb-4">Rating History</h3>
                <div className="flex items-end gap-4 h-32">
                  {performanceData.ratingHistory.map((month, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="bg-gradient-to-t from-blue-600 to-purple-600 w-full rounded-t-lg"
                        style={{ height: `${((month.rating - 1500) / 200) * 100}%` }}
                      ></div>
                      <p className="text-[#97a1c4] text-xs mt-2">{month.month}</p>
                      <p className="text-white text-sm font-semibold">{month.rating}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Latest Achievements */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Latest Puzzle Achievements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`bg-gradient-to-br from-[#272e45] to-[#374162] rounded-xl p-6 border transition-all duration-300 hover:scale-105 ${
                    achievement.unlocked 
                      ? achievement.rarity === 'Legendary' ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' 
                        : achievement.rarity === 'Epic' ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'border-[#374162] opacity-75'
                  }`}>
                    <div className="text-center">
                      <div className={`text-4xl mb-3 ${achievement.unlocked ? '' : 'grayscale'}`}>
                        {achievement.icon}
                      </div>
                      <h4 className={`font-bold text-lg mb-2 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                        {achievement.title}
                      </h4>
                      <p className="text-[#97a1c4] text-sm mb-3">{achievement.description}</p>
                      
                      {achievement.unlocked ? (
                        <div>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            achievement.rarity === 'Legendary' ? 'bg-yellow-600 text-white' :
                            achievement.rarity === 'Epic' ? 'bg-purple-600 text-white' :
                            'bg-blue-600 text-white'
                          }`}>
                            {achievement.rarity}
                          </span>
                          <p className="text-green-400 text-xs mt-2">Unlocked {achievement.date}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-500 text-xs mb-2">Progress: {achievement.progress}/100</p>
                          <div className="w-full bg-gray-700 rounded-full h-1.5">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{width: `${achievement.progress}%`}}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Puzzle Rating Leaderboard</h2>
              <div className="bg-[#272e45] rounded-xl border border-[#374162] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#374162] border-b border-[#455173]">
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Rank</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Player</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Rating</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Solved</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Country</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((player, index) => (
                        <tr key={index} className={`border-b border-[#374162] transition-colors duration-200 ${
                          player.highlight 
                            ? 'bg-blue-800/20 border-blue-600' 
                            : 'hover:bg-[#374162]/50'
                        }`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {player.rank <= 3 && (
                                <span className="text-lg">
                                  {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                                </span>
                              )}
                              <span className={`font-bold ${player.highlight ? 'text-blue-400' : 'text-white'}`}>
                                #{player.rank}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-medium ${player.highlight ? 'text-blue-400' : 'text-white'}`}>
                              {player.username}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-bold text-lg ${
                              player.rating >= 2500 ? 'text-yellow-400' :
                              player.rating >= 2000 ? 'text-purple-400' :
                              player.rating >= 1500 ? 'text-blue-400' :
                              'text-green-400'
                            }`}>
                              {player.rating}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[#97a1c4]">
                            {player.solved.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-lg">{player.country}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Puzzle Categories */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Practice by Theme</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {puzzleThemes.map((theme, index) => (
                  <Link 
                    key={index} 
                    to={`/puzzle-solver?theme=${theme.name}`}
                    className="bg-[#272e45] hover:bg-[#374162] rounded-xl p-6 border border-[#374162] hover:border-blue-600 transition-all duration-300 hover:scale-105 text-left block"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 ${theme.color} rounded-lg flex items-center justify-center`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256" className="text-white">
                          <path d="M136,100a12,12,0,1,1-12-12A12,12,0,0,1,136,100Zm96,29.48A104.29,104.29,0,0,1,130.1,232l-2.17,0a103.32,103.32,0,0,1-69.26-26A8,8,0,1,1,69.34,194a84.71,84.71,0,0,0,20.1,13.37L116,170.84c-22.78-9.83-47.47-5.65-61.4-3.29A31.84,31.84,0,0,1,23.3,154.72l-.3-.43-13.78-22a8,8,0,0,1,2.59-11.05L112,59.53V32a8,8,0,0,1,8-8h8A104,104,0,0,1,232,129.48Zm-16-.22A88,88,0,0,0,128,40V64a8,8,0,0,1-3.81,6.81L27.06,130.59l9.36,15A15.92,15.92,0,0,0,52,151.77c16-2.7,48.77-8.24,78.07,8.18A40.06,40.06,0,0,0,168,120a8,8,0,0,1,16,0,56.07,56.07,0,0,1-51.8,55.83l-27.11,37.28A90.89,90.89,0,0,0,129.78,216A88.29,88.29,0,0,0,216,129.26Z"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{theme.name}</h3>
                        <p className="text-[#97a1c4] text-sm">{theme.difficulty}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[#97a1c4] text-sm">{theme.count} puzzles</p>
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
              <h3 className="text-xl font-semibold text-white mb-4">Find Specific Puzzles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#97a1c4] text-sm mb-2">Search puzzles</label>
                  <input
                    type="text"
                    placeholder="Enter keywords..."
                    className="w-full px-4 py-3 bg-[#374162] border border-[#455173] rounded-lg text-white placeholder-[#97a1c4] focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[#97a1c4] text-sm mb-2">Rating range</label>
                  <select className="w-full px-4 py-3 bg-[#374162] border border-[#455173] rounded-lg text-white focus:outline-none focus:border-blue-600">
                    <option>All ratings</option>
                    <option>1000-1400</option>
                    <option>1400-1800</option>
                    <option>1800+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#97a1c4] text-sm mb-2">Theme</label>
                  <select className="w-full px-4 py-3 bg-[#374162] border border-[#455173] rounded-lg text-white focus:outline-none focus:border-blue-600">
                    <option>All themes</option>
                    <option>Pin</option>
                    <option>Fork</option>
                    <option>Skewer</option>
                    <option>Back Rank</option>
                    <option>Deflection</option>
                  </select>
                </div>
              </div>
              <Link 
                to="/puzzle-solver"
                className="mt-4 w-full md:w-auto px-8 py-3 bg-blue-800 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors inline-block text-center"
              >
                Start Solving Puzzles
              </Link>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default Puzzles;
