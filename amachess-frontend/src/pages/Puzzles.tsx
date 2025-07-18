import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChessGame from '../components/ChessGame';
import { usePuzzle } from '../hooks/usePuzzle';
import { LichessPuzzle } from '../services/puzzleService';

const Puzzles = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [dailyPuzzleCompleted, setDailyPuzzleCompleted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [randomPuzzleMode, setRandomPuzzleMode] = useState(false);
  
  // Use the puzzle hook for Lichess puzzle integration
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

  // Practice puzzles by theme - will be loaded from database
  const [puzzleThemes, setPuzzleThemes] = useState([
    { name: "Pin", count: 1247, difficulty: "★★☆", color: "bg-blue-600" },
    { name: "Fork", count: 983, difficulty: "★☆☆", color: "bg-green-600" },
    { name: "Skewer", count: 756, difficulty: "★★★", color: "bg-purple-600" },
    { name: "Back Rank", count: 642, difficulty: "★★☆", color: "bg-red-600" },
    { name: "Deflection", count: 589, difficulty: "★★★", color: "bg-orange-600" },
    { name: "Discovery", count: 534, difficulty: "★★★", color: "bg-indigo-600" },
    { name: "Double Attack", count: 478, difficulty: "★★☆", color: "bg-pink-600" },
    { name: "Zugzwang", count: 234, difficulty: "★★★★", color: "bg-gray-600" }
  ]);

  // Load actual themes from the database
  useEffect(() => {
    loadPuzzleThemes();
  }, []);

  const loadPuzzleThemes = async () => {
    try {
      const [themesResponse, statsResponse] = await Promise.all([
        fetch('/api/puzzles/themes'),
        fetch('/api/puzzles/stats')
      ]);
      
      const themesData = await themesResponse.json();
      const statsData = await statsResponse.json();
      
      if (themesData.success && statsData.success) {
        const themeColors = [
          "bg-blue-600", "bg-green-600", "bg-purple-600", "bg-red-600",
          "bg-orange-600", "bg-indigo-600", "bg-pink-600", "bg-teal-600",
          "bg-cyan-600", "bg-yellow-600", "bg-rose-600", "bg-violet-600"
        ];
        
        const themesWithData = themesData.data.map((theme: string, index: number) => {
          const count = statsData.data.byTheme[theme] || 0;
          const difficulty = count > 1000 ? "★☆☆" : count > 500 ? "★★☆" : count > 200 ? "★★★" : "★★★★";
          
          return {
            name: theme,
            count: count,
            difficulty: difficulty,
            color: themeColors[index % themeColors.length]
          };
        }).filter((theme: any) => theme.count > 0)
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 12); // Show top 12 themes
        
        setPuzzleThemes(themesWithData);
      }
    } catch (error) {
      console.error('Failed to load puzzle themes:', error);
    }
  };

  const solveDailyPuzzle = () => {
    setDailyPuzzleCompleted(true);
  };

  const handlePuzzleMove = (move, newFen) => {
    // Handle puzzle move logic here
    console.log('Puzzle move:', move, newFen);
  };

  const handleDailyPuzzleMove = (moveObj) => {
    console.log('Daily puzzle move:', moveObj);
    // Check if move is correct solution
    // Note: You'd need to implement proper move validation here
    if (moveObj.from === 'e2' && moveObj.to === 'e4') { // Example check
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

  const startRandomPuzzleMode = async () => {
    setRandomPuzzleMode(true);
    setShowSolution(false);
    
    // Load a random puzzle with difficulty filter
    const difficultyMap: { [key: string]: string } = {
      'All': '',
      'Easy': 'Beginner',
      'Medium': 'Intermediate', 
      'Hard': 'Advanced',
      'Expert': 'Expert'
    };
    
    const filters = selectedDifficulty !== 'All' ? 
      { difficulty: difficultyMap[selectedDifficulty] as any } : undefined;
    
    await loadRandomPuzzle(filters);
  };

  const handleRandomPuzzleMove = (move: { from: string; to: string; san?: string }) => {
    if (!currentLichessPuzzle || puzzleCompleted) return;
    
    console.log('Random puzzle move:', move);
    console.log('Current puzzle:', currentLichessPuzzle);
    
    // Convert move to UCI format
    const uciMove = `${move.from}${move.to}`;
    console.log('UCI move:', uciMove);
    console.log('Expected move:', currentLichessPuzzle.moves[0]);
    
    // Use the puzzle hook's move validation
    const isCorrect = makeMove(uciMove);
    console.log('Move correct:', isCorrect);
  };

  const nextRandomPuzzle = async () => {
    const difficultyMap: { [key: string]: string } = {
      'All': '',
      'Easy': 'Beginner',
      'Medium': 'Intermediate', 
      'Hard': 'Advanced',
      'Expert': 'Expert'
    };
    
    const filters = selectedDifficulty !== 'All' ? 
      { difficulty: difficultyMap[selectedDifficulty] as any } : undefined;
    
    await loadRandomPuzzle(filters);
  };

  const exitRandomPuzzleMode = () => {
    setRandomPuzzleMode(false);
    setShowSolution(false);
    resetPuzzle();
  };

  return (
    <div className="min-h-screen bg-[#121621] text-white" style={{fontFamily: 'Lexend, "Noto Sans", sans-serif'}}>
      <Header />
      
      {/* Main Content Container - Fully Responsive */}
      <main className="flex-1 w-full bg-[#121621]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 lg:py-8 bg-[#121621]">
          <div className="max-w-[1400px] mx-auto bg-[#121621]">
            
            {/* Random Puzzle Solver Mode */}
            {randomPuzzleMode && (
              <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 xs:p-4">
                <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-6 lg:p-8 w-full max-w-6xl max-h-[98vh] xs:max-h-[95vh] overflow-y-auto border border-[#475569] shadow-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 xs:gap-4 mb-4 xs:mb-6">
                    <div className="min-w-0">
                      <h2 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">Random Puzzle Challenge</h2>
                      <p className="text-[#97a1c4] text-sm xs:text-base lg:text-lg">Solve puzzles to improve your tactical skills</p>
                    </div>
                    <button 
                      onClick={exitRandomPuzzleMode}
                      className="text-[#97a1c4] hover:text-white transition-colors self-end sm:self-center p-1 hover:bg-white/10 rounded-lg"
                    >
                      <svg className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {puzzleLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-white text-lg">Loading puzzle...</p>
                      </div>
                    </div>
                  ) : puzzleError ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <p className="text-red-400 text-lg mb-4">Error loading puzzle: {puzzleError}</p>
                        <button 
                          onClick={() => loadRandomPuzzle()}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  ) : currentLichessPuzzle && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-6 lg:gap-8">
                      {/* Puzzle Board */}
                      <div className="bg-[#475569] rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-6 order-2 lg:order-1">
                        <div className="flex justify-center mb-3 xs:mb-4">
                          <ChessGame
                            isModalMode={true}
                            position={currentLichessPuzzle.fen}
                            onMove={handleRandomPuzzleMove}
                            interactive={!puzzleCompleted}
                            showNotation={false}
                            engineEnabled={false}
                          />
                        </div>
                        
                        {/* Puzzle Status */}
                        <div className="text-center">
                          <p className="text-[#97a1c4] text-sm xs:text-base mb-3 xs:mb-4 leading-relaxed">{currentLichessPuzzle.description}</p>
                          {puzzleError ? (
                            <div className="bg-red-600 text-white p-3 xs:p-4 rounded-lg">
                              <p className="font-semibold text-sm xs:text-base">✗ {puzzleError}</p>
                            </div>
                          ) : !puzzleCompleted ? (
                            <p className="text-blue-400 text-sm xs:text-base font-medium">
                              Find the best move for White
                            </p>
                          ) : (
                            <div className="bg-green-600 text-white p-3 xs:p-4 rounded-lg">
                              <p className="font-semibold text-sm xs:text-base">✓ Puzzle Solved!</p>
                              <p className="text-xs xs:text-sm opacity-90">Great job! +10 puzzle rating</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Puzzle Info & Controls */}
                      <div className="space-y-4 xs:space-y-6 order-1 lg:order-2">
                        {/* Puzzle Details */}
                        <div className="bg-[#475569] rounded-lg p-4 xs:p-6">
                          <h3 className="text-lg xs:text-xl sm:text-2xl font-semibold text-white mb-4 xs:mb-6">Puzzle Details</h3>
                          <div className="grid grid-cols-2 gap-3 xs:gap-4 sm:gap-6">
                            <div>
                              <p className="text-[#97a1c4] text-sm xs:text-base">Theme</p>
                              <p className="text-white font-semibold text-base xs:text-lg lg:text-xl break-words">{currentLichessPuzzle.themes?.[0] || 'Unknown'}</p>
                            </div>
                            <div>
                              <p className="text-[#97a1c4] text-sm xs:text-base">Rating</p>
                              <p className="text-white font-semibold text-base xs:text-lg lg:text-xl">{currentLichessPuzzle.rating}</p>
                            </div>
                            <div>
                              <p className="text-[#97a1c4] text-sm xs:text-base">Difficulty</p>
                              <p className="text-white font-semibold text-base xs:text-lg lg:text-xl">{currentLichessPuzzle.difficulty}</p>
                            </div>
                            <div>
                              <p className="text-[#97a1c4] text-sm xs:text-base">Moves</p>
                              <p className="text-white font-semibold text-base xs:text-lg lg:text-xl">{currentLichessPuzzle.moves?.length || 0}</p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 xs:space-y-4">
                          {puzzleCompleted && (
                            <button
                              onClick={nextRandomPuzzle}
                              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 xs:py-4 lg:py-5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-base xs:text-lg lg:text-xl"
                            >
                              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                              Next Puzzle
                            </button>
                          )}
                          
                          <button
                            onClick={() => showHintAction()}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 xs:py-4 rounded-lg font-semibold transition-colors text-base xs:text-lg"
                          >
                            Show Hint
                          </button>

                          <button
                            onClick={() => showSolutionAction()}
                            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 xs:py-4 rounded-lg font-semibold transition-colors text-base xs:text-lg"
                          >
                            Show Solution
                          </button>

                          <button
                            onClick={nextRandomPuzzle}
                            className="w-full bg-[#455173] hover:bg-[#566280] text-white py-3 xs:py-4 rounded-lg font-semibold transition-colors text-base xs:text-lg"
                          >
                            Skip Puzzle
                          </button>
                        </div>

                        {/* Hint Display */}
                        {hintVisible && currentLichessPuzzle && (
                          <div className="bg-[#475569] rounded-lg p-4 xs:p-6">
                            <h4 className="text-white font-semibold mb-3 xs:mb-4 text-base xs:text-lg">Hint:</h4>
                            <p className="text-[#97a1c4] text-sm xs:text-base">{currentLichessPuzzle.hint}</p>
                          </div>
                        )}

                        {/* Solution Display */}
                        {solutionVisible && currentLichessPuzzle && (
                          <div className="bg-[#475569] rounded-lg p-4 xs:p-6">
                            <h4 className="text-white font-semibold mb-3 xs:mb-4 text-base xs:text-lg">Solution:</h4>
                            <div className="flex flex-wrap gap-2 xs:gap-3">
                              {currentLichessPuzzle.moves.map((move, index) => (
                                <span key={index} className="bg-blue-800 text-white px-3 xs:px-4 py-2 rounded text-sm xs:text-base font-medium">
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

            {/* Header Section - Fluid Layout */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-8 mb-6 lg:mb-8 bg-[#121621]">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight mb-3 lg:mb-4">Chess Puzzles</h1>
                <p className="text-[#97a1c4] text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">Sharpen your tactical skills with our collection of chess puzzles</p>
              </div>
            </div>

            {/* User Statistics Cards - Responsive Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8 mb-6 sm:mb-8 bg-[#121621]">
              <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-lg xs:rounded-xl p-3 sm:p-4 lg:p-6 border border-[#475569]">
                <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-base sm:text-lg lg:text-xl">🧩</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[#97a1c4] text-xs sm:text-sm lg:text-base">Puzzles Solved</p>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">{userStats.puzzlesSolved.toLocaleString()}</p>
                  </div>
                </div>
                <p className="text-green-400 text-xs sm:text-sm">+{userStats.improvementThisMonth} this month</p>
              </div>

              <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-lg xs:rounded-xl p-3 sm:p-4 lg:p-6 border border-[#475569]">
                <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-base sm:text-lg lg:text-xl">⭐</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[#97a1c4] text-xs sm:text-sm lg:text-base">Puzzle Rating</p>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">{userStats.puzzleRating}</p>
                  </div>
                </div>
                <p className="text-purple-400 text-xs sm:text-sm">Top 15% globally</p>
              </div>

              <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-lg xs:rounded-xl p-3 sm:p-4 lg:p-6 border border-[#475569]">
                <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-base sm:text-lg lg:text-xl">🔥</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[#97a1c4] text-xs sm:text-sm lg:text-base">Best Streak</p>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">{userStats.bestStreak}</p>
                  </div>
                </div>
                <p className="text-orange-400 text-xs sm:text-sm">Current: {userStats.currentStreak}</p>
              </div>

              <div className="bg-gradient-to-br from-[#1e293b] to-[#334155] rounded-lg xs:rounded-xl p-3 sm:p-4 lg:p-6 border border-[#475569]">
                <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-base sm:text-lg lg:text-xl">🎯</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[#97a1c4] text-xs sm:text-sm lg:text-base">Accuracy Rate</p>
                    <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-white">{userStats.accuracyRate}%</p>
                  </div>
                </div>
                <p className="text-green-400 text-xs sm:text-sm">Avg time: {userStats.averageTime}s</p>
              </div>
            </div>

            {/* Daily Challenge Section - Responsive Layout */}
            <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] rounded-xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-[#475569]">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl xs:text-2xl sm:text-3xl">👑</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">{dailyChallenge.title}</h2>
                  <p className="text-[#97a1c4] text-sm xs:text-base lg:text-lg break-words">{dailyChallenge.theme} • Rating: {dailyChallenge.rating}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Chess Board */}
                <div className="bg-[#334155] rounded-lg xs:rounded-xl p-3 sm:p-4 lg:p-6 order-2 lg:order-1">
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <ChessGame
                      isModalMode={true}
                      position={dailyChallenge.fen}
                      onMove={handleDailyPuzzleMove}
                      interactive={!dailyPuzzleCompleted}
                      showNotation={false}
                      engineEnabled={false}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-[#97a1c4] text-sm xs:text-base mb-3 xs:mb-4 leading-relaxed">{dailyChallenge.description}</p>
                    {!dailyPuzzleCompleted ? (
                      <p className="text-blue-400 text-sm xs:text-base font-medium">
                        Make your move on the board above
                      </p>
                    ) : (
                      <div className="bg-green-600 text-white p-3 xs:p-4 rounded-lg">
                        <p className="font-semibold text-sm xs:text-base lg:text-lg">✓ Completed!</p>
                        <p className="text-xs xs:text-sm opacity-90">+25 rating points earned</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Challenge Stats */}
                <div className="space-y-4 xs:space-y-6 order-1 lg:order-2">
                  <div className="bg-[#374162] rounded-lg xs:rounded-xl p-4 xs:p-6">
                    <h4 className="text-white font-semibold mb-4 xs:mb-6 text-base xs:text-lg lg:text-xl">Challenge Statistics</h4>
                    <div className="grid grid-cols-2 gap-3 xs:gap-4 sm:gap-6">
                      <div>
                        <p className="text-[#97a1c4] text-xs sm:text-sm lg:text-base">Average Time</p>
                        <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-blue-400">{dailyChallenge.averageTime}s</p>
                      </div>
                      <div>
                        <p className="text-[#97a1c4] text-xs sm:text-sm lg:text-base">Success Rate</p>
                        <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-green-400">{dailyChallenge.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-[#97a1c4] text-xs sm:text-sm lg:text-base">Solved By</p>
                        <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-purple-400">{dailyChallenge.solveCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[#97a1c4] text-xs sm:text-sm lg:text-base">Attempts</p>
                        <p className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold text-orange-400">{dailyChallenge.attempts.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#374162] rounded-lg xs:rounded-xl p-4 xs:p-6">
                    <h4 className="text-white font-semibold mb-4 xs:mb-6 text-base xs:text-lg lg:text-xl">Puzzle Details</h4>
                    <div className="space-y-3 xs:space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[#97a1c4] text-sm xs:text-base">Theme:</span>
                        <span className="text-white font-medium text-sm xs:text-base break-words text-right">{dailyChallenge.theme}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#97a1c4] text-sm xs:text-base">Moves to solve:</span>
                        <span className="text-white font-medium text-sm xs:text-base">{dailyChallenge.movesToMate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#97a1c4] text-sm xs:text-base">Rating:</span>
                        <span className="text-white font-medium text-sm xs:text-base">{dailyChallenge.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs - Responsive with Scroll */}
            <div className="pb-3 xs:pb-4 mb-4 xs:mb-6 sm:mb-8">
              <div className="flex border-b border-[#374162] gap-4 sm:gap-6 lg:gap-8 xl:gap-12 overflow-x-auto scrollbar-hide">
                {['All', 'Daily', 'Custom', 'Saved'].map((tab) => (
                  <button
                    key={tab}
                    className={`flex flex-col items-center justify-center border-b-[3px] pb-3 xs:pb-4 pt-3 xs:pt-4 whitespace-nowrap min-w-0 ${
                      activeTab === tab 
                        ? 'border-b-blue-800 text-white' 
                        : 'border-b-transparent text-[#97a1c4] hover:text-white'
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    <p className="text-sm sm:text-base lg:text-lg font-bold leading-normal tracking-[0.015em]">{tab}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured Puzzles Section - Responsive Layout */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white">Featured Puzzles</h2>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Easy', 'Medium', 'Hard', 'Expert'].map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className={`px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
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

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {featuredPuzzles.map((puzzle) => (
                  <div key={puzzle.id} className="bg-gradient-to-br from-[#272e45] to-[#374162] rounded-xl overflow-hidden border border-[#374162] hover:border-blue-600 transition-all duration-300 hover:transform hover:scale-105">
                    {/* Chess Board for Puzzle */}
                    <div className="p-3 sm:p-4 lg:p-6 bg-[#374162]">
                      <div className="flex justify-center">
                        <ChessGame
                          isModalMode={true}
                          position={puzzle.fen}
                          onMove={(moveObj) => handlePuzzleMove(moveObj, null)}
                          interactive={false}
                          showNotation={false}
                          engineEnabled={false}
                        />
                      </div>
                      
                      {/* Rating badge overlay */}
                      <div className="flex justify-between items-center mt-3 sm:mt-4">
                        <span className="bg-black/30 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-white text-xs sm:text-sm font-medium">
                          {puzzle.rating}
                        </span>
                        <span className="bg-black/30 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-white text-xs sm:text-sm font-medium">
                          {puzzle.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 lg:p-8">
                      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-2 sm:mb-3 leading-tight">{puzzle.title}</h3>
                      <p className="text-[#97a1c4] text-sm sm:text-base mb-3 sm:mb-4 leading-relaxed">{puzzle.description}</p>
                      
                      {/* Theme badge */}
                      <div className="flex justify-center mb-3 sm:mb-4">
                        <span className="bg-blue-800/20 text-blue-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                          {puzzle.theme}
                        </span>
                      </div>
                      
                      {/* Tactical themes */}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                        {puzzle.subThemes.map((theme, index) => (
                          <span key={index} className="bg-blue-800/20 text-blue-400 px-2 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium">
                            {theme}
                          </span>
                        ))}
                      </div>

                      {/* Puzzle stats */}
                      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 text-sm sm:text-base">
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
                        className="w-full bg-blue-800 hover:bg-blue-700 text-white py-2.5 sm:py-3 lg:py-4 rounded-lg font-semibold transition-colors block text-center text-sm sm:text-base lg:text-lg"
                      >
                        Solve Puzzle
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Analytics - Responsive Grid */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-4 sm:mb-6 lg:mb-8">Performance Analytics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Weekly Progress Chart */}
                <div className="bg-[#272e45] rounded-lg xs:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 border border-[#374162]">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-4 sm:mb-6 lg:mb-8">This Week's Progress</h3>
                  <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    {performanceData.weeklyProgress.map((day, index) => (
                      <div key={index} className="flex items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <span className="text-[#97a1c4] text-sm sm:text-base w-8 sm:w-10 flex-shrink-0">{day.day}</span>
                          <div className="flex-1 bg-[#374162] rounded-full h-2 sm:h-2.5 lg:h-3 min-w-0">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 sm:h-2.5 lg:h-3 rounded-full transition-all duration-300"
                              style={{ width: `${(day.solved / 25) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-white font-semibold text-sm sm:text-base lg:text-lg">{day.solved}</p>
                          <p className="text-[#97a1c4] text-xs sm:text-sm">{day.accuracy}% acc</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Theme Performance */}
                <div className="bg-[#272e45] rounded-lg xs:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 border border-[#374162]">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-4 sm:mb-6 lg:mb-8">Theme Performance</h3>
                  <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                    {performanceData.themePerformance.map((theme, index) => (
                      <div key={index} className="flex items-center justify-between p-3 sm:p-4 lg:p-5 bg-[#374162] rounded-lg lg:rounded-xl gap-3 sm:gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-sm sm:text-base lg:text-lg leading-tight">{theme.theme}</p>
                          <p className="text-[#97a1c4] text-xs sm:text-sm lg:text-base">{theme.solved} solved</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-white font-bold text-sm sm:text-base lg:text-lg">{theme.rating}</p>
                          <p className="text-green-400 text-xs sm:text-sm lg:text-base">{theme.accuracy}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rating History - Full Width */}
              <div className="bg-[#272e45] rounded-lg xs:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 border border-[#374162] mt-4 sm:mt-6 lg:mt-8">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white mb-4 sm:mb-6 lg:mb-8">Rating History</h3>
                <div className="flex items-end gap-2 sm:gap-4 lg:gap-6 h-24 sm:h-32 lg:h-40 px-2 sm:px-4">
                  {performanceData.ratingHistory.map((month, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center min-w-0">
                      <div 
                        className="bg-gradient-to-t from-blue-600 to-purple-600 w-full rounded-t-lg lg:rounded-t-xl transition-all duration-300"
                        style={{ height: `${((month.rating - 1500) / 200) * 100}%` }}
                      ></div>
                      <p className="text-[#97a1c4] text-xs sm:text-sm lg:text-base mt-2 sm:mt-3 truncate w-full text-center">{month.month}</p>
                      <p className="text-white text-xs sm:text-sm lg:text-base font-semibold">{month.rating}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Latest Achievements - Responsive Grid */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-4 sm:mb-6 lg:mb-8">Latest Puzzle Achievements</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`bg-gradient-to-br from-[#272e45] to-[#374162] rounded-lg xs:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 border transition-all duration-300 hover:scale-105 ${
                    achievement.unlocked 
                      ? achievement.rarity === 'Legendary' ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' 
                        : achievement.rarity === 'Epic' ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                        : 'border-blue-500 shadow-lg shadow-blue-500/20'
                      : 'border-[#374162] opacity-75'
                  }`}>
                    <div className="text-center">
                      <div className={`text-2xl sm:text-3xl lg:text-4xl xl:text-5xl mb-3 sm:mb-4 lg:mb-6 ${achievement.unlocked ? '' : 'grayscale'}`}>
                        {achievement.icon}
                      </div>
                      <h4 className={`font-bold text-sm sm:text-base lg:text-lg xl:text-xl mb-2 sm:mb-3 lg:mb-4 leading-tight ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                        {achievement.title}
                      </h4>
                      <p className="text-[#97a1c4] text-xs sm:text-sm lg:text-base mb-3 sm:mb-4 lg:mb-6 leading-relaxed">{achievement.description}</p>
                      
                      {achievement.unlocked ? (
                        <div>
                          <span className={`inline-block px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded text-xs sm:text-sm lg:text-base font-medium ${
                            achievement.rarity === 'Legendary' ? 'bg-yellow-600 text-white' :
                            achievement.rarity === 'Epic' ? 'bg-purple-600 text-white' :
                            'bg-blue-600 text-white'
                          }`}>
                            {achievement.rarity}
                          </span>
                          <p className="text-green-400 text-xs sm:text-sm lg:text-base mt-2 sm:mt-3">Unlocked {achievement.date}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-gray-500 text-xs sm:text-sm lg:text-base mb-2 sm:mb-3">Progress: {achievement.progress}/100</p>
                          <div className="w-full bg-gray-700 rounded-full h-1.5 sm:h-2 lg:h-2.5">
                            <div className="bg-blue-600 h-1.5 sm:h-2 lg:h-2.5 rounded-full transition-all duration-300" style={{width: `${achievement.progress}%`}}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard - Responsive Table */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-4 sm:mb-6 lg:mb-8">Puzzle Rating Leaderboard</h2>
              <div className="bg-[#272e45] rounded-lg xs:rounded-xl lg:rounded-2xl border border-[#374162] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="bg-[#374162] border-b border-[#455173]">
                        <th className="px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6 text-left text-white text-sm sm:text-base lg:text-lg font-semibold">Rank</th>
                        <th className="px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6 text-left text-white text-sm sm:text-base lg:text-lg font-semibold">Player</th>
                        <th className="px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6 text-left text-white text-sm sm:text-base lg:text-lg font-semibold">Rating</th>
                        <th className="px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6 text-left text-white text-sm sm:text-base lg:text-lg font-semibold">Solved</th>
                        <th className="px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6 text-left text-white text-sm sm:text-base lg:text-lg font-semibold">Country</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((player, index) => (
                        <tr key={index} className={`border-b border-[#374162] transition-colors duration-200 ${
                          player.highlight 
                            ? 'bg-blue-800/20 border-blue-600' 
                            : 'hover:bg-[#374162]/50'
                        }`}>
                          <td className="px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6">
                            <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                              {player.rank <= 3 && (
                                <span className="text-base sm:text-lg lg:text-xl">
                                  {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                                </span>
                              )}
                              <span className={`font-bold text-sm sm:text-base lg:text-lg ${player.highlight ? 'text-blue-400' : 'text-white'}`}>
                                #{player.rank}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6">
                            <span className={`font-medium text-sm sm:text-base lg:text-lg ${player.highlight ? 'text-blue-400' : 'text-white'} truncate block max-w-[150px] lg:max-w-[200px]`}>
                              {player.username}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6">
                            <span className={`font-bold text-sm sm:text-base lg:text-lg xl:text-xl ${
                              player.rating >= 2500 ? 'text-yellow-400' :
                              player.rating >= 2000 ? 'text-purple-400' :
                              player.rating >= 1500 ? 'text-blue-400' :
                              'text-green-400'
                            }`}>
                              {player.rating}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6 text-[#97a1c4] text-sm sm:text-base lg:text-lg">
                            {player.solved.toLocaleString()}
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6">
                            <span className="text-base sm:text-lg lg:text-xl xl:text-2xl">{player.country}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Puzzle Categories - Responsive Grid */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-4 sm:mb-6 lg:mb-8">Practice by Theme</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 xl:gap-8">
                {puzzleThemes.map((theme, index) => (
                  <Link 
                    key={index} 
                    to={`/puzzle-solver?theme=${theme.name}`}
                    className="bg-[#272e45] hover:bg-[#374162] rounded-lg xs:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 border border-[#374162] hover:border-blue-600 transition-all duration-300 hover:scale-105 text-left block"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 mb-3 sm:mb-4 lg:mb-6">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 ${theme.color} rounded-lg xl:rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" className="sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-white" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M136,100a12,12,0,1,1-12-12A12,12,0,0,1,136,100Zm96,29.48A104.29,104.29,0,0,1,130.1,232l-2.17,0a103.32,103.32,0,0,1-69.26-26A8,8,0,1,1,69.34,194a84.71,84.71,0,0,0,20.1,13.37L116,170.84c-22.78-9.83-47.47-5.65-61.4-3.29A31.84,31.84,0,0,1,23.3,154.72l-.3-.43-13.78-22a8,8,0,0,1,2.59-11.05L112,59.53V32a8,8,0,0,1,8-8h8A104,104,0,0,1,232,129.48Zm-16-.22A88,88,0,0,0,128,40V64a8,8,0,0,1-3.81,6.81L27.06,130.59l9.36,15A15.92,15.92,0,0,0,52,151.77c16-2.7,48.77-8.24,78.07,8.18A40.06,40.06,0,0,0,168,120a8,8,0,0,1,16,0,56.07,56.07,0,0,1-51.8,55.83l-27.11,37.28A90.89,90.89,0,0,0,129.78,216A88.29,88.29,0,0,0,216,129.26Z"></path>
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg xl:text-xl leading-tight">{theme.name}</h3>
                        <p className="text-[#97a1c4] text-xs sm:text-sm lg:text-base">{theme.difficulty}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[#97a1c4] text-xs sm:text-sm lg:text-base">{theme.count} puzzles</p>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Search and Filter Bar - Responsive */}
            <div className="bg-[#272e45] rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 border border-[#374162] mb-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-white mb-4 sm:mb-6 lg:mb-8">Find Specific Puzzles</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                <div>
                  <label className="block text-[#97a1c4] text-sm sm:text-base lg:text-lg mb-2 sm:mb-3">Search puzzles</label>
                  <input
                    type="text"
                    placeholder="Enter keywords..."
                    className="w-full px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-4 bg-[#374162] border border-[#455173] rounded-lg lg:rounded-xl text-white placeholder-[#97a1c4] focus:outline-none focus:border-blue-600 text-sm sm:text-base lg:text-lg"
                  />
                </div>
                <div>
                  <label className="block text-[#97a1c4] text-sm sm:text-base lg:text-lg mb-2 sm:mb-3">Rating range</label>
                  <select className="w-full px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-4 bg-[#374162] border border-[#455173] rounded-lg lg:rounded-xl text-white focus:outline-none focus:border-blue-600 text-sm sm:text-base lg:text-lg">
                    <option>All ratings</option>
                    <option>1000-1400</option>
                    <option>1400-1800</option>
                    <option>1800+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#97a1c4] text-sm sm:text-base lg:text-lg mb-2 sm:mb-3">Theme</label>
                  <select className="w-full px-3 sm:px-4 lg:px-5 py-2.5 sm:py-3 lg:py-4 bg-[#374162] border border-[#455173] rounded-lg lg:rounded-xl text-white focus:outline-none focus:border-blue-600 text-sm sm:text-base lg:text-lg">
                    <option>All themes</option>
                    <option>Pin</option>
                    <option>Fork</option>
                    <option>Skewer</option>
                    <option>Back Rank</option>
                    <option>Deflection</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 sm:mt-6 lg:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6">
                <Link 
                  to="/puzzle-solver"
                  className="flex-1 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-blue-800 hover:bg-blue-700 text-white font-semibold rounded-lg lg:rounded-xl transition-colors text-center text-sm sm:text-base lg:text-lg xl:text-xl"
                >
                  Start Solving Puzzles
                </Link>
                <Link
                  to="/puzzle-training"
                  className="flex-1 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-green-700 hover:bg-green-800 text-white font-semibold rounded-lg lg:rounded-xl transition-colors text-center text-sm sm:text-base lg:text-lg xl:text-xl"
                >
                  Puzzle Training
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Puzzles;
