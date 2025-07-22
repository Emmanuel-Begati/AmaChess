import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import LichessProgressStats from '../components/LichessProgressStats';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [puzzleCompleted, setPuzzleCompleted] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [lichessStats, setLichessStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Handle analyze game button click
  const handleAnalyzeGame = (game: any) => {
    // Navigate to Learn page with game data for analysis
    navigate('/learn', { 
      state: { 
        analyzeGame: true,
        gameData: {
          id: game.id,
          platform: game.platform,
          url: game.url,
          opponent: game.opponent,
          result: game.result,
          timeControl: game.timeControl,
          opening: game.opening,
          date: game.date
        }
      }
    });
  };

  // Fetch protected dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/user/dashboard');
        setDashboardData(response.data.data);
        
        // Set Lichess stats from dashboard response if available
        if (response.data.data.lichessStats) {
          setLichessStats(response.data.data.lichessStats);
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Remove the separate Lichess API call since it's now handled in the dashboard endpoint
  // This effect is now commented out since we get Lichess data from the dashboard

  // Use backend data if available, fallback to static data
  const playerStats = dashboardData?.stats || {
    gamesPlayed: 235,
    winRate: 68,
    currentRating: 1650,
    favoriteOpening: 'Sicilian Defense'
  };

  // Process analytics data from API response
  const processLichessAnalytics = (analytics: any) => {
    if (!analytics) return { change30Days: 0, peakRating: 'N/A', percentile: 'N/A' };
    
    // Find the most relevant performance data (prioritize rapid, then blitz, then bullet)
    const perfTypes = ['rapid', 'blitz', 'bullet', 'classical'];
    let selectedPerf = null;
    
    for (const perf of perfTypes) {
      if (analytics.peakRatings?.[perf] || analytics.thirtyDayChanges?.[perf] !== undefined || analytics.percentiles?.[perf]) {
        selectedPerf = perf;
        break;
      }
    }
    
    return {
      change30Days: selectedPerf ? (analytics.thirtyDayChanges?.[selectedPerf] || 0) : 0,
      peakRating: selectedPerf ? (analytics.peakRatings?.[selectedPerf] || 'N/A') : 'N/A',
      percentile: selectedPerf ? (analytics.percentiles?.[selectedPerf] || 'N/A') : 'N/A'
    };
  };

  // Use analytics data from API if available, fallback to static data
  const lichessAnalytics = processLichessAnalytics(dashboardData?.lichessAnalytics);

  const achievements = [
    { 
      title: 'Tactical Master', 
      description: 'Solved 100 puzzles this month',
      icon: '🧩',
      unlocked: true,
      date: '2024-01-15'
    },
    { 
      title: 'Endgame Expert', 
      description: 'Won 10 endgames in a row',
      icon: '♔',
      unlocked: true,
      date: '2024-01-12'
    },
    { 
      title: 'Opening Specialist', 
      description: 'Master 5 different openings',
      icon: '📚',
      unlocked: false,
      progress: 3
    }
  ];

  const currentBooks = [
    {
      title: 'My System by Aron Nimzowitsch',
      progress: 65,
      currentChapter: 'Chapter 8: The Passed Pawn',
      totalChapters: 12,
      image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop'
    },
    {
      title: 'Think Like a Grandmaster',
      progress: 30,
      currentChapter: 'Chapter 4: Candidate Moves',
      totalChapters: 15,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop'
    }
  ];

  // Use recentGames from API if available, fallback to default message
  const recentGames = dashboardData?.recentGames || [
    { 
      id: 'demo',
      platform: 'demo',
      opponent: 'Connect your accounts', 
      result: 'draw', 
      ratingChange: '0',
      timeControl: 'N/A',
      opening: 'to see recent games',
      date: new Date().toISOString().split('T')[0],
      accuracy: null
    }
  ];

  const dailyPuzzle = {
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 4',
    solution: 'Nxe5',
    theme: 'Fork',
    rating: 1500,
    moves: 3
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0f1c] via-[#111827] to-[#0a0f1c] text-white">
      <Header />
      
      <main className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
              <span className="text-gray-400">Loading dashboard data...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-600/20 border border-red-600/50 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* User Info Display */}
          {user && (
            <div className="mb-6 p-4 bg-blue-600/20 border border-blue-600/50 rounded-lg">
              <p className="text-blue-400">
                ✅ <strong>Authentication Status:</strong> Logged in as {user.email}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                User ID: {user.id} | Member since: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Stats Summary */}
          {dashboardData && (
            <div className="mb-6 p-4 bg-green-600/20 border border-green-600/50 rounded-lg">
              <p className="text-green-400">
                🔒 <strong>Protected Data Loaded:</strong> Welcome back! You have {dashboardData.stats?.gamesPlayed || 0} games played with a {dashboardData.stats?.winRate || 0}% win rate.
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Current Rating: {dashboardData.stats?.currentRating || 0} | Favorite Opening: {dashboardData.stats?.favoriteOpening || 'None'}
              </p>
            </div>
          )}
          {/* Hero Section */}
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Welcome back, {user?.email?.split('@')[0] || 'Chess Player'}
                </h1>
                <p className="text-gray-400 text-lg">{currentDate}</p>
              </div>
              <div className="mt-6 lg:mt-0 flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#115fd4] to-[#4a90e2] rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">A</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">Level 15 Player</p>
                  <p className="text-gray-400">5-day streak 🔥</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-[#1e293b]/50 to-[#334155]/30 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
              <p className="text-gray-300 text-lg italic leading-relaxed">
                "Chess is the struggle against the error." - Johannes Zukertort
              </p>
            </div>
          </div>

          {/* Rating Overview Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Lichess Stats */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Lichess</h3>
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-lg">L</span>
                </div>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                  <span className="text-gray-400">Loading Lichess stats...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-400 mb-2">{error}</p>
                  <p className="text-gray-400 text-sm">Please check your Lichess username or try again later</p>
                </div>
              ) : !user?.lichessUsername ? (
                <div className="text-center py-8">
                  <p className="text-red-400 mb-2">No Lichess username found</p>
                  <p className="text-gray-400 text-sm">Add your Lichess username in your profile to see your stats</p>
                </div>
              ) : lichessStats ? (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Current Rating</p>
                    <p className="text-3xl font-bold text-white">
                      {lichessStats.rating?.rapid || lichessStats.rating?.blitz || lichessStats.rating?.bullet || 'N/A'}
                    </p>
                    <p className="text-green-400 text-sm">
                      {lichessStats.rating?.rapid ? 'Rapid' : lichessStats.rating?.blitz ? 'Blitz' : lichessStats.rating?.bullet ? 'Bullet' : 'Unrated'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Games Played</p>
                    <p className="text-3xl font-bold text-white">{lichessStats.gameCount?.total || 0}</p>
                    <p className="text-gray-400 text-sm">{Math.round((lichessStats.winRate || 0) * 100)}% win rate</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Current Rating</p>
                    <p className="text-3xl font-bold text-white">{playerStats.currentRating || playerStats.lichess?.rating || 1650}</p>
                    <p className={`text-sm ${lichessAnalytics.change30Days >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {lichessAnalytics.change30Days !== 0 ? 
                        (lichessAnalytics.change30Days > 0 ? `+${lichessAnalytics.change30Days}` : lichessAnalytics.change30Days) : 
                        'No change'
                      } (30d)
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Games Played</p>
                    <p className="text-3xl font-bold text-white">{playerStats.gamesPlayed || playerStats.lichess?.gamesPlayed || 235}</p>
                    <p className="text-gray-400 text-sm">{playerStats.winRate || playerStats.lichess?.winRate || 68}% win rate</p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Lichess Progress Statistics */}
          {user?.lichessUsername && user.lichessUsername.trim().length > 0 && (
            <div className="mb-12">
              <LichessProgressStats username={user.lichessUsername.trim()} />
            </div>
          )}

          {/* Analytics & Daily Puzzle Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
            {/* Rating Analytics */}
            <div className="xl:col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-6">Rating Analytics</h3>
              
              {/* Lichess Analytics */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="text-2xl mr-2">♔</span>
                  Lichess
                  {loading && <span className="ml-2 text-sm text-gray-400">(Loading...)</span>}
                </h4>
                {!user?.lichessUsername ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm">Connect your Lichess account to see analytics</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">Peak Rating</p>
                      <p className="text-2xl font-bold text-yellow-400">
                        {lichessAnalytics.peakRating !== 'N/A' ? lichessAnalytics.peakRating : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">30-Day Change</p>
                      <p className={`text-2xl font-bold ${lichessAnalytics.change30Days >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {lichessAnalytics.change30Days !== 0 ? 
                          (lichessAnalytics.change30Days > 0 ? `+${lichessAnalytics.change30Days}` : lichessAnalytics.change30Days) : 
                          'N/A'
                        }
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-sm mb-2">Percentile</p>
                      <p className="text-2xl font-bold text-blue-400">
                        {lichessAnalytics.percentile !== 'N/A' ? `${lichessAnalytics.percentile}%` : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-[#115fd4]/10 to-[#4a90e2]/10 rounded-xl border border-[#115fd4]/20">
                <h4 className="text-lg font-semibold text-white mb-3">📈 Get Deep Insights</h4>
                <p className="text-gray-300 mb-4">Analyze your playing patterns, opening choices, and improvement areas with AI-powered insights.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="px-6 py-3 bg-gradient-to-r from-[#115fd4] to-[#4a90e2] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#115fd4]/25 transition-all duration-300">
                    Analyze All Games
                  </button>
                  <button className="px-6 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors duration-300">
                    Single Game Analysis
                  </button>
                </div>
              </div>
            </div>

            {/* Daily Puzzle */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-4">Daily Puzzle</h3>
              <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
                <div className="aspect-square bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-slate-800 text-4xl">♛</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-400">Theme: <span className="text-white">{dailyPuzzle.theme}</span></p>
                  <p className="text-gray-400">Rating: <span className="text-white">{dailyPuzzle.rating}</span></p>
                  <p className="text-gray-400">Moves: <span className="text-white">{dailyPuzzle.moves}</span></p>
                </div>
              </div>
              {!puzzleCompleted ? (
                <button 
                  onClick={() => setPuzzleCompleted(true)}
                  className="w-full py-3 bg-gradient-to-r from-[#115fd4] to-[#4a90e2] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#115fd4]/25 transition-all duration-300"
                >
                  Solve Puzzle
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-green-400 font-semibold mb-2">✓ Completed!</p>
                  <button className="text-[#115fd4] hover:text-[#4a90e2] font-medium">View Solution</button>
                </div>
              )}
            </div>
          </div>

          {/* Achievements */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">Recent Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <div key={index} className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border ${achievement.unlocked ? 'border-yellow-500/50' : 'border-slate-700/50'} backdrop-blur-sm`}>
                  <div className="flex items-start gap-4">
                    <div className={`text-3xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg mb-2 ${achievement.unlocked ? 'text-white' : 'text-gray-400'}`}>
                        {achievement.title}
                      </h4>
                      <p className="text-gray-400 text-sm mb-3">{achievement.description}</p>
                      {achievement.unlocked ? (
                        <p className="text-yellow-400 text-xs">Unlocked {achievement.date}</p>
                      ) : (
                        <div>
                          <p className="text-gray-500 text-xs mb-2">Progress: {achievement.progress || 0}/5</p>
                          <div className="w-full bg-slate-700 rounded-full h-1.5">
                            <div className="bg-[#115fd4] h-1.5 rounded-full" style={{width: `${((achievement.progress || 0)/5)*100}%`}}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Books */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Continue Reading</h3>
              <button className="mt-4 sm:mt-0 px-6 py-2 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors duration-300">
                Browse Library
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {currentBooks.map((book, index) => (
                <div key={index} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700/50 backdrop-blur-sm">
                  <div className="flex gap-6">
                    <div className="w-24 h-32 bg-cover bg-center rounded-lg flex-shrink-0" style={{backgroundImage: `url(${book.image})`}}></div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-2">{book.title}</h4>
                      <p className="text-gray-400 text-sm mb-4">{book.currentChapter}</p>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                          <span>Progress</span>
                          <span>{book.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div className="bg-gradient-to-r from-[#115fd4] to-[#4a90e2] h-2 rounded-full" style={{width: `${book.progress}%`}}></div>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-gradient-to-r from-[#115fd4] to-[#4a90e2] text-white font-semibold rounded-lg text-sm hover:shadow-lg hover:shadow-[#115fd4]/25 transition-all duration-300">
                        Continue Reading
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Games */}
          <div className="mb-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Recent Games</h3>
              <button className="mt-4 sm:mt-0 px-6 py-2 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors duration-300">
                View All Games
              </button>
            </div>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm overflow-hidden">
              {recentGames.length === 0 || recentGames[0]?.platform === 'demo' ? (
                <div className="p-8 text-center">
                  <p className="text-gray-400 mb-2">No recent rapid games found</p>
                  <p className="text-gray-500 text-sm">Connect your Lichess account to see your recent rapid games</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-800/50 border-b border-slate-700">
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Platform</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Opponent</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Result</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Time Control</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Opening</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Date</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentGames.map((game: any) => (
                        <tr key={game.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded ${game.platform === 'lichess' ? 'bg-white' : 'bg-green-600'} flex items-center justify-center`}>
                                <span className={`text-xs font-bold ${game.platform === 'lichess' ? 'text-black' : 'text-white'}`}>
                                  {game.platform === 'lichess' ? 'L' : '♛'}
                                </span>
                              </div>
                              <span className="text-gray-300 text-sm capitalize">{game.platform}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-white text-sm font-medium">{game.opponent}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                                game.result === 'win' ? 'bg-green-500/20 text-green-400' :
                                game.result === 'loss' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {game.result}
                              </span>
                              <span className={`text-sm ${
                                game.ratingChange.startsWith('+') ? 'text-green-400' : 
                                game.ratingChange === '0' ? 'text-gray-400' : 'text-red-400'
                              }`}>
                                {game.ratingChange !== '0' ? game.ratingChange : '±0'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-300 text-sm">{game.timeControl}</td>
                          <td className="px-6 py-4 text-gray-300 text-sm">{game.opening}</td>
                          <td className="px-6 py-4 text-gray-300 text-sm">{game.date}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {game.url && game.platform !== 'demo' ? (
                                <>
                                  <a 
                                    href={game.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 bg-[#115fd4] text-white text-xs font-medium rounded-lg hover:bg-[#4a90e2] transition-colors duration-200"
                                  >
                                    View Game
                                  </a>
                                  <button
                                    onClick={() => handleAnalyzeGame(game)}
                                    className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                                  >
                                    Analyze
                                  </button>
                                </>
                              ) : (
                                <button className="px-3 py-1 bg-slate-600 text-white text-xs font-medium rounded-lg cursor-not-allowed opacity-50">
                                  N/A
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🧩', label: 'More Puzzles', color: 'from-purple-500 to-purple-600' },
              { icon: '📚', label: 'Study Plans', color: 'from-blue-500 to-blue-600' },
              { icon: '🎯', label: 'Training', color: 'from-green-500 to-green-600' },
              { icon: '📊', label: 'Statistics', color: 'from-orange-500 to-orange-600' }
            ].map((action, index) => (
              <button
                key={index}
                className={`flex flex-col items-center justify-center p-6 bg-gradient-to-r ${action.color} text-white rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105 group`}
              >
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">
                  {action.icon}
                </div>
                <span className="text-sm font-semibold">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
