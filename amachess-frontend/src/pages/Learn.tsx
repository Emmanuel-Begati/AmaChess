import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import GameAnalysisModal from '../components/analysis/GameAnalysisModal';
import AICoachModal from '../components/ai/AICoachModal';
import GameChatModal from '../components/analysis/GameChatModal';

const Learn = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeInsightTab, setActiveInsightTab] = useState('Strengths');
  const [activeDashboardTab, setActiveDashboardTab] = useState('Rating Progress');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showAICoachModal, setShowAICoachModal] = useState(false);
  const [showGameChatModal, setShowGameChatModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isBulkAnalysis, setIsBulkAnalysis] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // New state for Lichess integration
  const [lichessUsername, setLichessUsername] = useState('');
  const [userGames, setUserGames] = useState([]);
  const [gameAnalysis, setGameAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle incoming game analysis from Dashboard
  useEffect(() => {
    if (location.state?.analyzeGame && location.state?.gameData) {
      const gameData = location.state.gameData;
      setSelectedGame(gameData);
      setShowAnalysisModal(true);
      // Clear the state to prevent re-triggering
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // Get user's lichess username from registration
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.lichessUsername) {
      setLichessUsername(userData.lichessUsername);
    }
  }, []);

  // Authentication check
  useEffect(() => {
    // In a real app, you'd check for actual authentication token/session
    // For this demo, we'll simulate checking if user is "logged in"
    const isAuthenticated = localStorage.getItem('userAuthenticated') === 'true' || 
                           window.location.pathname.includes('/dashboard') ||
                           document.referrer.includes('/dashboard');
    
    if (!isAuthenticated) {
      // Redirect to homepage if not authenticated
      navigate('/');
    }
  }, [navigate]);

  // Lichess API integration functions
  const importFromLichess = async (username) => {
    if (!username) {
      setError('Please enter a Lichess username');
      return;
    }

    setIsImporting(true);
    setError('');
    setLoading(true);
    
    try {
      console.log('Importing games and analysis for:', username);
      const response = await fetch(`http://localhost:3001/api/import/lichess/${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maxGames: 20 })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Imported games and analysis:', data);
        
        if (data.success) {
          setUserGames(data.games || []);
          setGameAnalysis(data.analysis);
        } else {
          setError(data.error || 'Failed to import games');
        }
        
        // Store lichess username for future use
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.lichessUsername = username;
        localStorage.setItem('userData', JSON.stringify(userData));
        
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to import games');
      }
    } catch (error) {
      console.error('Error importing from Lichess:', error);
      setError('Failed to connect to server. Please try again.');
    } finally {
      setIsImporting(false);
      setLoading(false);
    }
  };

  const analyzeGame = async (game) => {
    if (!game.pgn && !game.moves) {
      setError('No game data available for analysis');
      return;
    }

    setLoading(true);
    try {
      // First get the PGN if we only have moves
      let pgnData = game.pgn;
      if (!pgnData && game.moves) {
        // Convert moves to PGN format
        pgnData = `[Event "Lichess game"]
[Site "${game.url}"]
[Date "${game.date}"]
[White "${game.opponent}"]
[Black "You"]
[Result "*"]

${game.moves}`;
      }

      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pgn: pgnData,
          username: lichessUsername,
          depth: 15,
          timePerMove: 2000,
          enableCache: true
        })
      });

      if (response.ok) {
        const analysisData = await response.json();
        console.log('Game analysis completed:', analysisData);
        
        // Update the game with analysis data
        const updatedGame = {
          ...game,
          analysis: analysisData.analysis
        };
        
        setSelectedGame(updatedGame);
        setIsBulkAnalysis(false);
        setShowAnalysisModal(true);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to analyze game');
      }
    } catch (error) {
      console.error('Error analyzing game:', error);
      setError('Failed to analyze game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAnalysis = () => {
    if (gameAnalysis) {
      setIsBulkAnalysis(true);
      setShowAnalysisModal(true);
    } else {
      setError('Please import games first to perform bulk analysis');
    }
  };

  const handleGameAnalysis = async (game) => {
    await analyzeGame(game);
  };

  const handleSingleGameUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.pgn')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const pgnContent = e.target.result;
        try {
          const response = await fetch('http://localhost:3001/api/analyze', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pgn: pgnContent,
              username: lichessUsername,
              depth: 15,
              timePerMove: 2000,
              enableCache: true
            })
          });

          if (response.ok) {
            const analysisData = await response.json();
            console.log('Single game analysis completed:', analysisData);
            
            const gameData = {
              id: Date.now(),
              analysis: analysisData.analysis,
              source: 'upload'
            };
            
            setSelectedGame(gameData);
            setIsBulkAnalysis(false);
            setShowAnalysisModal(true);
          } else {
            const errorData = await response.json();
            setError(errorData.message || 'Failed to analyze uploaded game');
          }
        } catch (error) {
          console.error('Error analyzing uploaded game:', error);
          setError('Failed to analyze uploaded game. Please try again.');
        }
      };
      reader.readAsText(file);
    } else {
      setError('Please upload a valid PGN file');
    }
  };

  const sampleAnalysis = {
    accuracy: 87.5,
    blunders: 2,
    mistakes: 4,
    inaccuracies: 8,
    openingName: "Sicilian Defense: Najdorf Variation",
    openingEval: "+0.3",
    middlegameEval: "-1.2",
    endgameEval: "+2.1",
    timeManagement: "Good",
    tacticalThemes: ["Pin", "Fork", "Discovered Attack"],
    weaknesses: ["Endgame technique", "Time pressure decisions"],
    improvements: ["Study rook endgames", "Practice tactical patterns"]
  };

  const puzzlesToPractice = [
    { id: 1, theme: "Pin", difficulty: "Intermediate", rating: 1600 },
    { id: 2, theme: "Fork", difficulty: "Advanced", rating: 1800 },
    { id: 3, theme: "Endgame", difficulty: "Expert", rating: 2000 }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0f1c] via-[#111827] to-[#0a0f1c] text-white">
      <Header />
      
      <main className="w-full">
        <div className="flex flex-1 justify-center py-3 sm:py-5 px-3 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 max-w-7xl w-full">
            {/* Left Column - Game Library & Upload */}
            <div className="w-full lg:w-80 xl:w-96 flex flex-col order-2 lg:order-1">
              {/* Header Section */}
              <div className="flex flex-wrap justify-between gap-3 p-3 sm:p-4">
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-3">
                  <p className="text-white tracking-light text-xl sm:text-2xl lg:text-[32px] font-bold leading-tight">Learn From Your Games</p>
                  <p className="text-[#97a1c4] text-xs sm:text-sm font-normal leading-normal">Transform your playing experience into personalized chess education</p>
                </div>
              </div>

              {/* Single Game Upload */}
              <div className="bg-[#272e45] rounded-xl p-4 sm:p-6 mx-3 sm:mx-4 mb-3 sm:mb-4">
                <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Analyze Single Game</h3>
                <div className="border-2 border-dashed border-[#374162] rounded-lg p-4 sm:p-6 text-center">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-[#97a1c4] mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-[#97a1c4] text-xs sm:text-sm mb-2 sm:mb-3">Drop PGN file or paste game</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    id="single-game" 
                    accept=".pgn" 
                    onChange={handleSingleGameUpload}
                  />
                  <label htmlFor="single-game" className="cursor-pointer bg-blue-800 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm transition-colors inline-block">
                    Upload PGN
                  </label>
                </div>
              </div>

              {/* Bulk Game Upload */}
              <div className="bg-[#272e45] rounded-xl p-4 sm:p-6 mx-3 sm:mx-4 mb-3 sm:mb-4">
                <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Bulk Analysis</h3>
                <button 
                  onClick={handleBulkAnalysis}
                  className="w-full bg-[#374162] hover:bg-[#455173] text-white px-4 py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  disabled={isImporting || !gameAnalysis}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="truncate">
                    {isImporting ? 'Analyzing...' : 
                     gameAnalysis ? 'Analyze Imported Games' : 'Import Games First'}
                  </span>
                </button>
              </div>

              {/* Lichess Import Section */}
              <div className="bg-[#272e45] rounded-xl p-4 sm:p-6 mx-3 sm:mx-4 mb-3 sm:mb-4">
                <h3 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Import from Lichess</h3>
                {error && (
                  <div className="mb-3 p-2 bg-red-600/20 border border-red-600/50 rounded text-red-400 text-xs">
                    {error}
                    <button 
                      onClick={() => setError('')}
                      className="ml-2 text-red-300 hover:text-red-100"
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Enter your Lichess username"
                    value={lichessUsername}
                    onChange={(e) => setLichessUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-[#374162] border border-[#455173] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button 
                    onClick={() => importFromLichess(lichessUsername)}
                    disabled={isImporting || !lichessUsername.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {isImporting ? 'Importing Games...' : 'Import Recent Games'}
                  </button>
                </div>
              </div>
              
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4">
                <div className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 border border-[#374162]">
                  <p className="text-white text-sm sm:text-base font-medium leading-normal">Total Games Imported</p>
                  <p className="text-white tracking-light text-xl sm:text-2xl font-bold leading-tight">
                    {userGames.length || 0}
                  </p>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 border border-[#374162]">
                  <p className="text-white text-sm sm:text-base font-medium leading-normal">Average Accuracy</p>
                  <p className="text-white tracking-light text-xl sm:text-2xl font-bold leading-tight">
                    {gameAnalysis ? `${Math.round(gameAnalysis.overallAccuracy)}%` : '0%'}
                  </p>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 border border-[#374162] sm:col-span-2 lg:col-span-1 xl:col-span-2">
                  <p className="text-white text-sm sm:text-base font-medium leading-normal">Current Rating</p>
                  <p className="text-white tracking-light text-xl sm:text-2xl font-bold leading-tight">
                    {gameAnalysis ? gameAnalysis.averageRating : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Game Library Header */}
              <h2 className="text-white text-lg sm:text-[22px] font-bold leading-tight tracking-[-0.015em] px-3 sm:px-4 pb-2 sm:pb-3 pt-3 sm:pt-5">Game Library</h2>
              
              {/* Search Bar */}
              <div className="px-3 sm:px-4 py-2 sm:py-3">
                <label className="flex flex-col min-w-40 h-10 sm:h-12 w-full">
                  <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                    <div className="text-[#97a1c4] flex border-none bg-[#272e45] items-center justify-center pl-3 sm:pl-4 rounded-l-xl border-r-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" className="sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                      </svg>
                    </div>
                    <input
                      placeholder="Search games..."
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-0 border-none bg-[#272e45] focus:border-none h-full placeholder:text-[#97a1c4] px-3 sm:px-4 rounded-l-none border-l-0 pl-2 text-sm sm:text-base font-normal leading-normal"
                    />
                  </div>
                </label>
              </div>

              {/* Filter Tags */}
              <div className="flex gap-2 sm:gap-3 p-2 sm:p-3 flex-wrap pr-3 sm:pr-4 overflow-x-auto scrollbar-hide">
                {['Opening', 'Result', 'Date', 'Opponent', 'Time Control', 'Rating Range', 'Color Played'].map((filter) => (
                  <div key={filter} className="flex h-7 sm:h-8 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#272e45] pl-3 pr-3 sm:pl-4 sm:pr-4 whitespace-nowrap">
                    <p className="text-white text-xs sm:text-sm font-medium leading-normal">{filter}</p>
                  </div>
                ))}
              </div>

              {/* Game List */}
              <div className="space-y-1 sm:space-y-0">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : userGames.length > 0 ? (
                  userGames.map((game, index) => (
                    <div key={game.id || index} className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-[#121621] px-3 sm:px-4 py-3 justify-between">
                      <div className="flex flex-1 flex-col justify-center min-w-0">
                        <p className="text-white text-sm sm:text-base font-medium leading-normal truncate">
                          Your Rating: {game.rating} ({game.ratingChange > 0 ? '+' : ''}{game.ratingChange})
                        </p>
                        <p className="text-[#97a1c4] text-xs sm:text-sm font-normal leading-normal truncate">
                          Result: {game.result}, Date: {game.date}, Time Control: {game.timeControl}
                        </p>
                        <p className="text-[#97a1c4] text-xs sm:text-sm font-normal leading-normal truncate">
                          vs. {game.opponent} ({game.opponentRating}) - {game.opening}
                        </p>
                        {game.accuracy && (
                          <p className="text-green-400 text-xs sm:text-sm font-normal leading-normal">
                            Accuracy: {Math.round(game.accuracy)}%
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 flex flex-row sm:flex-col gap-3 sm:gap-1 justify-end sm:justify-center">
                        <button 
                          onClick={() => handleGameAnalysis(game)}
                          className="text-sm sm:text-base font-medium leading-normal text-blue-400 hover:text-blue-300 px-2 py-1 sm:px-0 sm:py-0"
                          disabled={loading}
                        >
                          {loading ? 'Analyzing...' : 'Analyze'}
                        </button>
                        <button 
                          onClick={() => {setSelectedGame(game); setShowGameChatModal(true);}}
                          className="text-xs sm:text-sm font-medium leading-normal text-green-400 hover:text-green-300 px-2 py-1 sm:px-0 sm:py-0"
                        >
                          Chat
                        </button>
                        <a
                          href={game.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm font-medium leading-normal text-purple-400 hover:text-purple-300 px-2 py-1 sm:px-0 sm:py-0"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[#97a1c4] text-sm">
                      {lichessUsername 
                        ? 'Import your games from Lichess to see them here' 
                        : 'Enter your Lichess username to import games'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Analysis & AI Coach */}
            <div className="flex flex-col flex-1 min-w-0 order-1 lg:order-2">
              <div className="flex flex-wrap justify-between gap-3 p-3 sm:p-4">
                <p className="text-white tracking-light text-xl sm:text-2xl lg:text-[32px] font-bold leading-tight min-w-0">AI Chess Coach</p>
              </div>
              
              {/* AI Coach Section */}
              <div className="bg-gradient-to-r from-[#272e45] to-[#374162] rounded-xl p-4 sm:p-6 mx-3 sm:mx-4 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-white">Personal Chess Coach</h3>
                    <p className="text-blue-100 text-sm sm:text-base">Get personalized instruction and play training games</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <button 
                    onClick={() => setShowAICoachModal(true)}
                    className="bg-blue-800 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="hidden sm:inline">Start Instructive Game</span>
                    <span className="sm:hidden">Start Game</span>
                  </button>
                  
                  <button 
                    onClick={() => setShowGameChatModal(true)}
                    className="bg-green-800 hover:bg-green-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="hidden sm:inline">Ask Chess Questions</span>
                    <span className="sm:hidden">Ask Questions</span>
                  </button>
                </div>
              </div>

              {/* Puzzles to Practice */}
              <div className="bg-[#272e45] rounded-xl p-4 sm:p-6 mx-3 sm:mx-4 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-white">Recommended Puzzles</h3>
                  <p className="text-[#97a1c4] text-xs sm:text-sm">Based on your game analysis</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
                  {puzzlesToPractice.map((puzzle) => (
                    <div key={puzzle.id} className="bg-[#374162] rounded-lg p-3 sm:p-4 flex flex-col gap-2 sm:gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium text-sm">{puzzle.theme}</span>
                        <span className="text-[#97a1c4] text-xs">{puzzle.rating}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#97a1c4] text-xs">{puzzle.difficulty}</span>
                      </div>
                      <a
                        href={`/puzzles?theme=${puzzle.theme}&rating=${puzzle.rating}`}
                        className="w-full bg-blue-800 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm transition-colors block text-center"
                      >
                        Practice Now
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insights Section */}
              <h2 className="text-white text-lg sm:text-[22px] font-bold leading-tight tracking-[-0.015em] px-3 sm:px-4 pb-2 sm:pb-3 pt-3 sm:pt-5">AI Insights</h2>
              <div className="pb-3">
                <div className="flex border-b border-[#374162] px-3 sm:px-4 gap-4 sm:gap-8 overflow-x-auto scrollbar-hide">
                  {['Strengths', 'Learning Opportunities', 'Pattern Recognition', 'Study Recommendations'].map((tab) => (
                    <a
                      key={tab}
                      className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 cursor-pointer whitespace-nowrap ${
                        activeInsightTab === tab 
                          ? 'border-b-blue-800 text-white' 
                          : 'border-b-transparent text-[#97a1c4]'
                      }`}
                      onClick={() => setActiveInsightTab(tab)}
                    >
                      <p className="text-xs sm:text-sm font-bold leading-normal tracking-[0.015em]">{tab}</p>
                    </a>
                  ))}
                </div>
              </div>
              <p className="text-white text-sm sm:text-base font-normal leading-normal pb-3 pt-1 px-3 sm:px-4">
                {gameAnalysis ? (
                  activeInsightTab === 'Strengths' ? 
                    `Your strengths include solid opening principles with average accuracy of ${Math.round(gameAnalysis.overallAccuracy)}%. Continue to reinforce these areas through practice and analysis.` :
                  activeInsightTab === 'Learning Opportunities' ?
                    `Focus on reducing blunders (${gameAnalysis.totalBlunders || 0} in recent games) and mistakes (${gameAnalysis.totalMistakes || 0}). Practice tactical puzzles daily.` :
                  activeInsightTab === 'Pattern Recognition' ?
                    'Work on recognizing common tactical patterns like pins, forks, and discovered attacks. Your tactical awareness can be improved through focused practice.' :
                    'Study endgame fundamentals and time management. Consider reviewing games where you lost on time or missed winning endgames.'
                ) : (
                  'Import games from Lichess to get personalized AI insights based on your playing style and performance patterns.'
                )}
              </p>

              {/* Learning Dashboard */}
              <h2 className="text-white text-lg sm:text-[22px] font-bold leading-tight tracking-[-0.015em] px-3 sm:px-4 pb-2 sm:pb-3 pt-3 sm:pt-5">Learning Dashboard</h2>
              <div className="pb-3">
                <div className="flex border-b border-[#374162] px-3 sm:px-4 gap-4 sm:gap-8 overflow-x-auto scrollbar-hide">
                  {['Rating Progress', 'Weak Areas', 'Learning Streaks', 'Mastery Progress'].map((tab) => (
                    <a
                      key={tab}
                      className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 cursor-pointer whitespace-nowrap ${
                        activeDashboardTab === tab 
                          ? 'border-b-blue-800 text-white' 
                          : 'border-b-transparent text-[#97a1c4]'
                      }`}
                      onClick={() => setActiveDashboardTab(tab)}
                    >
                      <p className="text-xs sm:text-sm font-bold leading-normal tracking-[0.015em]">{tab}</p>
                    </a>
                  ))}
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="px-3 sm:px-4 pb-3">
                <div className="bg-[#272e45] rounded-xl p-4 sm:p-6">
                  {activeDashboardTab === 'Rating Progress' && (
                    <div>
                      <h3 className="text-white font-semibold mb-4">Rating Progress</h3>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-2xl font-bold text-white">
                            {gameAnalysis ? Math.round(gameAnalysis.averageRating) : 'N/A'}
                          </p>
                          <p className="text-[#97a1c4] text-sm">Current Rating</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 text-sm font-medium">
                            {gameAnalysis && gameAnalysis.ratingProgress ? '+5%' : 'Import games to see progress'}
                          </p>
                        </div>
                      </div>
                      {gameAnalysis && (
                        <div className="space-y-2">
                          <p className="text-white font-medium">Recent Performance:</p>
                          <p className="text-[#97a1c4] text-sm">
                            Win Rate: {Math.round((gameAnalysis.winRate || 0) * 100)}% | 
                            Draw Rate: {Math.round((gameAnalysis.drawRate || 0) * 100)}% | 
                            Loss Rate: {Math.round((gameAnalysis.lossRate || 0) * 100)}%
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeDashboardTab === 'Weak Areas' && (
                    <div>
                      <h3 className="text-white font-semibold mb-4">Areas for Improvement</h3>
                      {gameAnalysis ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3 bg-[#374162] rounded">
                            <span className="text-white">Tactical Awareness</span>
                            <span className="text-yellow-400">Priority: High</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-[#374162] rounded">
                            <span className="text-white">Endgame Technique</span>
                            <span className="text-orange-400">Priority: Medium</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-[#374162] rounded">
                            <span className="text-white">Time Management</span>
                            <span className="text-green-400">Priority: Low</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[#97a1c4]">Import games to see personalized weak areas</p>
                      )}
                    </div>
                  )}

                  {activeDashboardTab === 'Learning Streaks' && (
                    <div>
                      <h3 className="text-white font-semibold mb-4">Learning Activity</h3>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-2">
                          {userGames.length > 0 ? '🔥' : '💤'}
                        </div>
                        <p className="text-white font-medium">
                          {userGames.length > 0 ? `${userGames.length} games analyzed` : 'Start your learning streak!'}
                        </p>
                        <p className="text-[#97a1c4] text-sm mt-1">
                          {userGames.length > 0 ? 'Keep analyzing games to maintain your streak' : 'Import and analyze games to begin'}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeDashboardTab === 'Mastery Progress' && (
                    <div>
                      <h3 className="text-white font-semibold mb-4">Skill Mastery</h3>
                      {gameAnalysis ? (
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-white text-sm">Opening Knowledge</span>
                              <span className="text-[#97a1c4] text-sm">
                                {Math.round((gameAnalysis.overallAccuracy || 0) / 100 * 85)}%
                              </span>
                            </div>
                            <div className="w-full bg-[#374162] rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.round((gameAnalysis.overallAccuracy || 0) / 100 * 85)}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-white text-sm">Tactical Calculation</span>
                              <span className="text-[#97a1c4] text-sm">72%</span>
                            </div>
                            <div className="w-full bg-[#374162] rounded-full h-2">
                              <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-white text-sm">Endgame Technique</span>
                              <span className="text-[#97a1c4] text-sm">68%</span>
                            </div>
                            <div className="w-full bg-[#374162] rounded-full h-2">
                              <div className="bg-orange-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[#97a1c4]">Import games to track your skill mastery</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Learning Coach Section */}
              <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">AI Learning Coach</h2>
              <p className="text-white text-base font-normal leading-normal pb-3 pt-1 px-4">
                Your AI Learning Coach provides personalized insights based on your game analysis. It identifies key areas for improvement, suggests smart recommendations, tracks
                your progress, and offers custom training options to enhance your chess skills.
              </p>

              {/* Action Buttons */}
              <div className="flex justify-end overflow-hidden px-5 pb-5">
                <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-blue-800 text-white text-base font-bold leading-normal tracking-[0.015em] min-w-0 gap-4 pl-4 pr-6">
                  <div className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                    </svg>
                  </div>
                  <span className="truncate">Analyze New Game</span>
                </button>
              </div>
              <div className="flex justify-end overflow-hidden px-5 pb-5">
                <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-blue-800 text-white text-base font-bold leading-normal tracking-[0.015em] min-w-0 gap-4 pl-4 pr-6">
                  <div className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M224,48H160a40,40,0,0,0-32,16A40,40,0,0,0,96,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H96a24,24,0,0,1,24,24,8,8,0,0,0,16,0,24,24,0,0,1,24-24h64a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48ZM96,192H32V64H96a24,24,0,0,1,24,24V200A39.81,39.81,0,0,0,96,192Zm128,0H160a39.81,39.81,0,0,0-24,8V88a24,24,0,0,1,24-24h64Z"></path>
                    </svg>
                  </div>
                  <span className="truncate">Schedule Review</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      {showAnalysisModal && (
        <GameAnalysisModal 
          isOpen={showAnalysisModal}
          onClose={() => {
            setShowAnalysisModal(false);
            setIsBulkAnalysis(false);
          }}
          gameData={selectedGame}
          analysis={isBulkAnalysis ? gameAnalysis : selectedGame?.analysis}
          isBulkAnalysis={isBulkAnalysis}
        />
      )}

      {showAICoachModal && (
        <AICoachModal 
          isOpen={showAICoachModal}
          onClose={() => setShowAICoachModal(false)}
        />
      )}

      {showGameChatModal && (
        <GameChatModal 
          isOpen={showGameChatModal}
          onClose={() => setShowGameChatModal(false)}
          game={selectedGame}
        />
      )}

    </div>
  );
};

export default Learn;
