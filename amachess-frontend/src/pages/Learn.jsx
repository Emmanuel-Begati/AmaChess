import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GameAnalysisModal from '../components/GameAnalysisModal';
import AICoachModal from '../components/AICoachModal';
import GameChatModal from '../components/GameChatModal';

const Learn = () => {
  const navigate = useNavigate();
  const [activeInsightTab, setActiveInsightTab] = useState('Strengths');
  const [activeDashboardTab, setActiveDashboardTab] = useState('Rating Progress');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showAICoachModal, setShowAICoachModal] = useState(false);
  const [showGameChatModal, setShowGameChatModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isBulkAnalysis, setIsBulkAnalysis] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

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
    setIsImporting(true);
    try {
      // This would connect to your backend which then calls Lichess API
      const response = await fetch(`/api/import/lichess/${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Imported games:', data);
        // Refresh the game library
      } else {
        console.error('Import failed');
      }
    } catch (error) {
      console.error('Error importing from Lichess:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const importFromChessCom = async (username) => {
    setIsImporting(true);
    try {
      // Similar to Lichess import but for Chess.com
      const response = await fetch(`/api/import/chesscom/${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Imported games:', data);
      } else {
        console.error('Import failed');
      }
    } catch (error) {
      console.error('Error importing from Chess.com:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleBulkAnalysis = () => {
    setIsBulkAnalysis(true);
    setShowAnalysisModal(true);
  };

  const handleGameAnalysis = (game) => {
    setSelectedGame(game);
    setIsBulkAnalysis(false);
    setShowAnalysisModal(true);
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
                  <input type="file" className="hidden" id="single-game" accept=".pgn" />
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
                  disabled={isImporting}
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="truncate">{isImporting ? 'Analyzing...' : 'Analyze Last 50 Games'}</span>
                </button>
              </div>

              {/* Import Buttons */}
              <div className="flex justify-stretch">
                <div className="flex flex-1 gap-2 sm:gap-3 flex-wrap px-3 sm:px-4 py-2 sm:py-3 justify-start">
                  <button 
                    onClick={() => importFromLichess('username')}
                    disabled={isImporting}
                    className="flex min-w-0 flex-1 sm:min-w-[84px] sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 sm:h-10 px-2 sm:px-4 bg-[#272e45] text-white text-xs sm:text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50"
                  >
                    <span className="truncate">
                      {isImporting ? 'Importing...' : 'Import from Lichess'}
                    </span>
                  </button>
                  <button 
                    onClick={() => importFromChessCom('username')}
                    disabled={isImporting}
                    className="flex min-w-0 flex-1 sm:min-w-[84px] sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-8 sm:h-10 px-2 sm:px-4 bg-[#272e45] text-white text-xs sm:text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50"
                  >
                    <span className="truncate">
                      {isImporting ? 'Importing...' : 'Import from Chess.com'}
                    </span>
                  </button>
                </div>
              </div>
              
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4">
                <div className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 border border-[#374162]">
                  <p className="text-white text-sm sm:text-base font-medium leading-normal">Total Games Imported</p>
                  <p className="text-white tracking-light text-xl sm:text-2xl font-bold leading-tight">234</p>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 border border-[#374162]">
                  <p className="text-white text-sm sm:text-base font-medium leading-normal">Games Analyzed</p>
                  <p className="text-white tracking-light text-xl sm:text-2xl font-bold leading-tight">187</p>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 border border-[#374162] sm:col-span-2 lg:col-span-1 xl:col-span-2">
                  <p className="text-white text-sm sm:text-base font-medium leading-normal">Learning Points</p>
                  <p className="text-white tracking-light text-xl sm:text-2xl font-bold leading-tight">456</p>
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
                      placeholder="Search"
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
                {/*
                  { rating: "1500 (+15)", result: "Win", date: "2024-01-15", timeControl: "10+0", opponent: "Opponent 1 (1650)" },
                  { rating: "1515 (-10)", result: "Loss", date: "2024-01-10", timeControl: "5+0", opponent: "Opponent 2 (1800)" },
                  { rating: "1505 (+5)", result: "Draw", date: "2024-01-05", timeControl: "15+10", opponent: "Opponent 3 (1700)" }
                ].map((game, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-[#121621] px-3 sm:px-4 py-3 justify-between">
                    <div className="flex flex-1 flex-col justify-center min-w-0">
                      <p className="text-white text-sm sm:text-base font-medium leading-normal truncate">Your Rating: {game.rating}</p>
                      <p className="text-[#97a1c4] text-xs sm:text-sm font-normal leading-normal truncate">Result: {game.result}, Date: {game.date}, Time Control: {game.timeControl}</p>
                      <p className="text-[#97a1c4] text-xs sm:text-sm font-normal leading-normal truncate">vs. {game.opponent}</p>
                    </div>
                    <div className="shrink-0 flex flex-row sm:flex-col gap-3 sm:gap-1 justify-end sm:justify-center">
                      <button 
                        onClick={() => handleGameAnalysis(game)}
                        className="text-sm sm:text-base font-medium leading-normal text-blue-400 hover:text-blue-300 px-2 py-1 sm:px-0 sm:py-0"
                      >
                        Analyze
                      </button>
                      <button 
                        onClick={() => {setSelectedGame(game); setShowGameChatModal(true);}}
                        className="text-xs sm:text-sm font-medium leading-normal text-green-400 hover:text-green-300 px-2 py-1 sm:px-0 sm:py-0"
                      >
                        Chat
                      </button>
                    </div>
                  </div>
                ))}
                */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-[#121621] px-3 sm:px-4 py-3 justify-between">
                  <div className="flex flex-1 flex-col justify-center min-w-0">
                    <p className="text-white text-sm sm:text-base font-medium leading-normal truncate">Your Rating: 1500 (+15)</p>
                    <p className="text-[#97a1c4] text-xs sm:text-sm font-normal leading-normal truncate">Result: Win, Date: 2024-01-15, Time Control: 10+0</p>
                    <p className="text-[#97a1c4] text-xs sm:text-sm font-normal leading-normal truncate">vs. Opponent 1 (1650)</p>
                  </div>
                  <div className="shrink-0 flex flex-row sm:flex-col gap-3 sm:gap-1 justify-end sm:justify-center">
                    <button 
                      onClick={() => handleGameAnalysis({ rating: "1500 (+15)", result: "Win", date: "2024-01-15", timeControl: "10+0", opponent: "Opponent 1 (1650)" })}
                      className="text-sm sm:text-base font-medium leading-normal text-blue-400 hover:text-blue-300 px-2 py-1 sm:px-0 sm:py-0"
                    >
                      Analyze
                    </button>
                    <button 
                      onClick={() => {setSelectedGame({ rating: "1500 (+15)", result: "Win", date: "2024-01-15", timeControl: "10+0", opponent: "Opponent 1 (1650)" }); setShowGameChatModal(true);}}
                      className="text-xs sm:text-sm font-medium leading-normal text-green-400 hover:text-green-300 px-2 py-1 sm:px-0 sm:py-0"
                    >
                      Chat
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-[#121621] px-3 sm:px-4 py-3 justify-between">
                  <div className="flex flex-1 flex-col justify-center min-w-0">
                    <p className="text-white text-sm sm:text-base font-medium leading-normal truncate">Your Rating: 1515 (-10)</p>
                    <p className="text-[#97a1c4] text-xs sm:text-sm font-normal leading-normal truncate">Result: Loss, Date: 2024-01-10, Time Control: 5+0</p>
                    <p className="text-[#97a1c4] text-xs sm:text-sm font-normal leading-normal truncate">vs. Opponent 2 (1800)</p>
                  </div>
                  <div className="shrink-0 flex flex-row sm:flex-col gap-3 sm:gap-1 justify-end sm:justify-center">
                    <button 
                      onClick={() => handleGameAnalysis({ rating: "1515 (-10)", result: "Loss", date: "2024-01-10", timeControl: "5+0", opponent: "Opponent 2 (1800)" })}
                      className="text-sm sm:text-base font-medium leading-normal text-blue-400 hover:text-blue-300 px-2 py-1 sm:px-0 sm:py-0"
                    >
                      Analyze
                    </button>
                    <button 
                      onClick={() => {setSelectedGame({ rating: "1515 (-10)", result: "Loss", date: "2024-01-10", timeControl: "5+0", opponent: "Opponent 2 (1800)" }); setShowGameChatModal(true);}}
                      className="text-xs sm:text-sm font-medium leading-normal text-green-400 hover:text-green-300 px-2 py-1 sm:px-0 sm:py-0"
                    >
                      Chat
                    </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-[#121621] px-3 sm:px-4 py-3 justify-between">
                  <div className="flex flex-1 flex-col justify-center min-w-0">
                    <p className="text-white text-sm sm:text-base font-medium leading-normal truncate">Your Rating: 1505 (+5)</p>
                    <p className="text-[#97a1c4] text-xs sm:text-sm font-normal leading-normal truncate">Result: Draw, Date: 2024-01-05, Time Control: 15+10</p>
                    <p className="text-[#97a1c4] text-xs sm:text-sm font-normal leading-normal truncate">vs. Opponent 3 (1700)</p>
                  </div>
                  <div className="shrink-0 flex flex-row sm:flex-col gap-3 sm:gap-1 justify-end sm:justify-center">
                    <button 
                      onClick={() => handleGameAnalysis({ rating: "1505 (+5)", result: "Draw", date: "2024-01-05", timeControl: "15+10", opponent: "Opponent 3 (1700)" })}
                      className="text-sm sm:text-base font-medium leading-normal text-blue-400 hover:text-blue-300 px-2 py-1 sm:px-0 sm:py-0"
                    >
                      Analyze
                    </button>
                    <button 
                      onClick={() => {setSelectedGame({ rating: "1505 (+5)", result: "Draw", date: "2024-01-05", timeControl: "15+10", opponent: "Opponent 3 (1700)" }); setShowGameChatModal(true);}}
                      className="text-xs sm:text-sm font-medium leading-normal text-green-400 hover:text-green-300 px-2 py-1 sm:px-0 sm:py-0"
                    >
                      Chat
                    </button>
                  </div>
                </div>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-white">Your Personal AI Coach</h3>
                    <p className="text-[#97a1c4] text-sm sm:text-base">Get personalized instruction and play training games</p>
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
                    <span className="hidden sm:inline">Chat with AI Coach</span>
                    <span className="sm:hidden">Chat AI</span>
                  </button>
                </div>
              </div>

              {/* Puzzles to Practice */}
              <div className="bg-[#272e45] rounded-xl p-4 sm:p-6 mx-3 sm:mx-4 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-white">Recommended Puzzles</h3>
                  <a href="/puzzles" className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium whitespace-nowrap">View All Puzzles →</a>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {puzzlesToPractice.map((puzzle) => (
                    <div key={puzzle.id} className="bg-[#374162] rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium text-[#97a1c4]">{puzzle.theme}</span>
                        <span className="text-xs bg-blue-800 text-white px-2 py-1 rounded">{puzzle.rating}</span>
                      </div>
                      <p className="text-white font-medium mb-3 text-sm sm:text-base">{puzzle.difficulty}</p>
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
                Your strengths include solid opening principles and tactical awareness in the middlegame. Continue to reinforce these areas through practice and analysis.
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

              {/* Rating Chart */}
              <div className="flex flex-wrap gap-4 px-3 sm:px-4 py-4 sm:py-6">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="text-white text-sm sm:text-base font-medium leading-normal">Rating Over Time</p>
                  <p className="text-white tracking-light text-2xl sm:text-[32px] font-bold leading-tight truncate">1510</p>
                  <div className="flex gap-1">
                    <p className="text-[#97a1c4] text-sm sm:text-base font-normal leading-normal">Last 30 Days</p>
                    <p className="text-[#0bda62] text-sm sm:text-base font-medium leading-normal">+5%</p>
                  </div>
                  <div className="flex min-h-[120px] sm:min-h-[180px] flex-1 flex-col gap-4 sm:gap-8 py-4">
                    <svg width="100%" height="120" className="sm:h-[148px]" viewBox="-3 0 478 150" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                      <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z" fill="url(#paint0_linear_1131_5935)"></path>
                      <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="#97a1c4" strokeWidth="3" strokeLinecap="round"></path>
                      <defs>
                        <linearGradient id="paint0_linear_1131_5935" x1="236" y1="1" x2="236" y2="149" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#0066ff" stopOpacity="0.3"/>
                          <stop offset="1" stopColor="#0066ff" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="flex justify-around">
                      <p className="text-[#97a1c4] text-[13px] font-bold leading-normal tracking-[0.015em]">Jan 1</p>
                      <p className="text-[#97a1c4] text-[13px] font-bold leading-normal tracking-[0.015em]">Jan 8</p>
                      <p className="text-[#97a1c4] text-[13px] font-bold leading-normal tracking-[0.015em]">Jan 15</p>
                      <p className="text-[#97a1c4] text-[13px] font-bold leading-normal tracking-[0.015em]">Jan 22</p>
                      <p className="text-[#97a1c4] text-[13px] font-bold leading-normal tracking-[0.015em]">Jan 29</p>
                    </div>
                  </div>
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
                  <span className="truncate">Create Study Plan</span>
                </button>
              </div>
              <div className="flex justify-end overflow-hidden px-5 pb-5">
                <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-blue-800 text-white text-base font-bold leading-normal tracking-[0.015em] min-w-0 gap-4 pl-4 pr-6">
                  <div className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"></path>
                    </svg>
                  </div>
                  <span className="truncate">Export Report</span>
                </button>
              </div>
              <div className="flex justify-end overflow-hidden px-5 pb-5">
                <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-5 bg-blue-800 text-white text-base font-bold leading-normal tracking-[0.015em] min-w-0 gap-4 pl-4 pr-6">
                  <div className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-96-88v64a8,8,0,0,1-16,0V132.94l-4.42,2.22a8,8,0,0,1-7.16-14.32l16-8A8,8,0,0,1,112,120Zm59.16,30.45L152,176h16a8,8,0,0,1,0,16H136a8,8,0,0,1-6.4-12.8l28.78-38.37A8,8,0,1,0,145.07,132a8,8,0,1,1-13.85-8A24,24,0,0,1,176,136,23.76,23.76,0,0,1,171.16,150.45Z"></path>
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
          analysis={sampleAnalysis}
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
