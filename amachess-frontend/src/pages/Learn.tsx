import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import GameAnalysisModal from '../components/analysis/GameAnalysisModal';
import AICoachModal from '../components/ai/AICoachModal';
import GameChatModal from '../components/analysis/GameChatModal';

const Learn = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const isAuthenticated = localStorage.getItem('userAuthenticated') === 'true' || 
                           window.location.pathname.includes('/dashboard') ||
                           document.referrer.includes('/dashboard');
    
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  // Lichess API integration functions
  const importFromLichess = async (username: string) => {
    if (!username) {
      setError('Please enter a Lichess username');
      return;
    }

    setIsImporting(true);
    setError('');
    setLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/import/lichess/${username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maxGames: 20 })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setUserGames(data.games || []);
          setGameAnalysis(data.analysis);
        } else {
          setError(data.error || 'Failed to import games');
        }
        
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

  const analyzeGame = async (game: any) => {
    if (!game.pgn && !game.moves) {
      setError('No game data available for analysis');
      return;
    }

    setLoading(true);
    try {
      let pgnData = game.pgn;
      if (!pgnData && game.moves) {
        pgnData = `[Event "Lichess game"]
[Site "${game.url}"]
[Date "${game.date}"]
[White "${game.opponent}"]
[Black "You"]
[Result "*"]

${game.moves}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/analyze`, {
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

  const handleGameAnalysis = async (game: any) => {
    await analyzeGame(game);
  };

  const handleSingleGameUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.pgn')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const pgnContent = e.target?.result;
        try {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || '/api'}/analyze`, {
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
            const gameData = {
              id: Date.now(),
              analysis: analysisData.analysis,
              source: 'upload'
            };
            setSelectedGame(gameData as any);
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

  const filters = ['All', 'Wins', 'Losses', 'Draws', 'Rapid', 'Blitz', 'Bullet'];

  const filteredGames = userGames.filter((game: any) => {
    const matchesSearch = !searchQuery || 
      game.opponent?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.opening?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'All') return matchesSearch;
    if (activeFilter === 'Wins') return matchesSearch && game.result === 'win';
    if (activeFilter === 'Losses') return matchesSearch && game.result === 'loss';
    if (activeFilter === 'Draws') return matchesSearch && game.result === 'draw';
    if (['Rapid', 'Blitz', 'Bullet'].includes(activeFilter)) {
      return matchesSearch && game.timeControl?.toLowerCase().includes(activeFilter.toLowerCase());
    }
    return matchesSearch;
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0f1c] via-[#111827] to-[#0a0f1c] text-white">
      <Header />
      
      <main className="w-full pt-16 sm:pt-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-xl flex items-center justify-between animate-fade-in">
              <p className="text-red-400 text-sm">{error}</p>
              <button 
                onClick={() => setError('')}
                className="text-red-300 hover:text-red-100 ml-4 shrink-0 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Hero Section */}
          <div className="mb-6 sm:mb-10 animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }}>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Learn & Improve
            </h1>
            <p className="text-gray-400 text-sm sm:text-lg max-w-2xl">
              Transform your playing experience into personalized chess education with AI-powered analysis and coaching.
            </p>
          </div>

          {/* Feature Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-10 animate-fade-in-up opacity-0" style={{ animationDelay: '200ms' }}>
            
            {/* Play with AI Coach */}
            <button
              onClick={() => setShowAICoachModal(true)}
              id="learn-ai-coach-card"
              className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 sm:p-6 rounded-2xl border border-slate-700/40 backdrop-blur-sm text-left transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-[#115fd4] to-[#4a90e2] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-base sm:text-lg mb-1">Play with Coach B</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">Start an instructive training game with your AI coach</p>
              <div className="absolute top-4 right-4 text-gray-600 group-hover:text-blue-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Upload PGN */}
            <button
              onClick={() => fileInputRef.current?.click()}
              id="learn-upload-pgn-card"
              className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 sm:p-6 rounded-2xl border border-slate-700/40 backdrop-blur-sm text-left transition-all duration-300 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-base sm:text-lg mb-1">Upload PGN</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">Upload a PGN file to analyze your game moves</p>
              <div className="absolute top-4 right-4 text-gray-600 group-hover:text-emerald-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
                id="single-game-upload" 
                accept=".pgn" 
                onChange={handleSingleGameUpload}
              />
            </button>

            {/* Chat with Coach */}
            <button
              onClick={() => setShowGameChatModal(true)}
              id="learn-chat-coach-card"
              className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 sm:p-6 rounded-2xl border border-slate-700/40 backdrop-blur-sm text-left transition-all duration-300 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-base sm:text-lg mb-1">Chat with Coach</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">Ask questions or discuss strategies with AI</p>
              <div className="absolute top-4 right-4 text-gray-600 group-hover:text-purple-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Import from Lichess */}
            <div
              id="learn-lichess-import-card"
              className="group relative bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 sm:p-6 rounded-2xl border border-slate-700/40 backdrop-blur-sm text-left transition-all duration-300 hover:border-amber-500/40"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-white font-bold text-base sm:text-lg mb-3">Import from Lichess</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Username"
                  value={lichessUsername}
                  onChange={(e) => setLichessUsername(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && importFromLichess(lichessUsername)}
                  className="flex-1 min-w-0 px-3 py-2 bg-slate-900/80 border border-slate-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-sm transition-all"
                />
                <button 
                  onClick={() => importFromLichess(lichessUsername)}
                  disabled={isImporting || !lichessUsername.trim()}
                  className="px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all duration-200 shrink-0"
                >
                  {isImporting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-10 animate-fade-in-up opacity-0" style={{ animationDelay: '300ms' }}>
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-blue-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">📚</span>
                <span className="text-gray-400 text-xs font-medium">Games Imported</span>
              </div>
              <p className="text-2xl font-bold text-white">{userGames.length || 0}</p>
              <p className="text-gray-500 text-xs mt-1">from Lichess</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-emerald-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">🎯</span>
                <span className="text-gray-400 text-xs font-medium">Average Accuracy</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {gameAnalysis ? `${Math.round((gameAnalysis as any).overallAccuracy)}%` : '—'}
              </p>
              <p className="text-gray-500 text-xs mt-1">across all games</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-purple-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">⭐</span>
                <span className="text-gray-400 text-xs font-medium">Current Rating</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {gameAnalysis ? (gameAnalysis as any).averageRating : '—'}
              </p>
              <p className="text-gray-500 text-xs mt-1">Lichess rating</p>
            </div>
          </div>

          {/* Game Library Section */}
          <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '400ms' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-white">Game Library</h2>
              <button 
                onClick={handleBulkAnalysis}
                disabled={isImporting || !gameAnalysis}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#115fd4] to-[#4a90e2] hover:from-[#0e4fb3] hover:to-[#3a7fd4] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#115fd4]/25 self-start sm:self-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {isImporting ? 'Analyzing...' : gameAnalysis ? 'Bulk Analysis' : 'Import Games First'}
              </button>
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl sm:rounded-2xl border border-slate-700/50 backdrop-blur-sm overflow-hidden">
              {/* Search + Filters */}
              <div className="p-3 sm:p-4 border-b border-slate-700/50">
                <div className="flex items-center gap-3 bg-slate-900/60 rounded-xl px-4 py-2.5 mb-3">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    placeholder="Search by opponent or opening..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-gray-500 outline-none text-sm"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {filters.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                        activeFilter === filter
                          ? 'bg-[#115fd4] text-white shadow-md shadow-[#115fd4]/20'
                          : 'bg-slate-800/80 text-gray-400 hover:bg-slate-700/80 hover:text-gray-300'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game List */}
              <div className="divide-y divide-slate-700/30">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500/30 border-t-blue-500"></div>
                    <p className="text-gray-500 text-sm">Analyzing games...</p>
                  </div>
                ) : filteredGames.length > 0 ? (
                  filteredGames.map((game: any, index: number) => (
                    <div 
                      key={game.id || index} 
                      className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:px-6 sm:py-4 hover:bg-slate-800/30 transition-colors duration-200"
                    >
                      {/* Game Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-white font-semibold text-sm truncate">
                            vs. {game.opponent}
                          </span>
                          <span className="text-gray-500 text-xs">({game.opponentRating})</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            game.result === 'win' ? 'bg-green-500/20 text-green-400' :
                            game.result === 'loss' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {game.result}
                          </span>
                          {game.ratingChange !== undefined && (
                            <span className={`text-xs font-medium ${
                              game.ratingChange > 0 ? 'text-green-400' : 
                              game.ratingChange < 0 ? 'text-red-400' : 'text-gray-500'
                            }`}>
                              {game.ratingChange > 0 ? '+' : ''}{game.ratingChange}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                          <span>{game.opening}</span>
                          <span className="text-gray-700">•</span>
                          <span>{game.timeControl}</span>
                          <span className="text-gray-700">•</span>
                          <span>{game.date}</span>
                          {game.accuracy && (
                            <>
                              <span className="text-gray-700">•</span>
                              <span className="text-emerald-400">{Math.round(game.accuracy)}% accuracy</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => handleGameAnalysis(game)}
                          disabled={loading}
                          className="px-3 py-1.5 bg-[#115fd4]/20 text-[#4a90e2] text-xs font-medium rounded-lg hover:bg-[#115fd4]/30 transition-colors duration-200"
                        >
                          Analyze
                        </button>
                        <button 
                          onClick={() => {setSelectedGame(game); setShowGameChatModal(true);}}
                          className="px-3 py-1.5 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-lg hover:bg-purple-500/30 transition-colors duration-200"
                        >
                          Chat
                        </button>
                        {game.url && (
                          <a
                            href={game.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-slate-700/50 text-gray-300 text-xs font-medium rounded-lg hover:bg-slate-700/80 transition-colors duration-200"
                          >
                            View ↗
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 font-medium mb-1">No games yet</p>
                      <p className="text-gray-500 text-sm max-w-xs">
                        {lichessUsername 
                          ? 'Click "Import" to fetch your recent Lichess games' 
                          : 'Enter your Lichess username above to import games, or upload a PGN file'}
                      </p>
                    </div>
                  </div>
                )}
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
          analysis={isBulkAnalysis ? gameAnalysis : (selectedGame as any)?.analysis}
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
