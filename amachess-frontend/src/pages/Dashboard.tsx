import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import ChessGame from '../components/chess/ChessGame';
import DashboardInsights from '../components/dashboard/DashboardInsights';
import { useAuth } from '../contexts/AuthContext';
import { puzzleService } from '../services/puzzleService';
import { dailyPuzzleService } from '../services/dailyPuzzleService';
import axios from 'axios';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [lichessStats, setLichessStats] = useState<any>(null);
  const [puzzleStats, setPuzzleStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dailyPuzzle, setDailyPuzzle] = useState<any>(null);
  const [dailyPuzzleLoading, setDailyPuzzleLoading] = useState(true);

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Handle analyze game button click
  const handleAnalyzeGame = (game: any) => {
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

  // Fetch all dashboard data in parallel
  useEffect(() => {
    const fetchAllDashboardData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        const [dashboardResult, statsResult, leaderboardResult] = await Promise.allSettled([
          axios.get('/user/dashboard'),
          puzzleService.getUserStats(user.id),
          puzzleService.getLeaderboard(10)
        ]);

        if (dashboardResult.status === 'fulfilled') {
          setDashboardData(dashboardResult.value.data.data);
          if (dashboardResult.value.data.data.lichessStats) {
            setLichessStats(dashboardResult.value.data.data.lichessStats);
          }
        } else {
          console.error('Failed to fetch dashboard data:', dashboardResult.reason);
          setError('Failed to load dashboard data. Please try again.');
        }

        if (statsResult.status === 'fulfilled') {
          setPuzzleStats(statsResult.value);
        } else {
          console.error('Failed to fetch puzzle stats:', statsResult.reason);
        }

        if (leaderboardResult.status === 'fulfilled') {
          setLeaderboard(leaderboardResult.value);
        } else {
          console.error('Failed to fetch leaderboard:', leaderboardResult.reason);
        }
        
        setError(null);
      } catch (err) {
        console.error('Unexpected error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllDashboardData();
  }, [user?.id]);

  // Use recentGames from API if available
  const recentGames = dashboardData?.recentGames || [];

  // Load daily puzzle
  useEffect(() => {
    const loadDailyPuzzle = async () => {
      try {
        setDailyPuzzleLoading(true);
        const puzzleId = 'lichess-01av5';
        const puzzle = await dailyPuzzleService.getDailyPuzzle(puzzleId);
        setDailyPuzzle(puzzle);
      } catch (error) {
        console.error('Failed to load daily puzzle:', error);
      } finally {
        setDailyPuzzleLoading(false);
      }
    };
    loadDailyPuzzle();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0f1c] via-[#111827] to-[#0a0f1c] text-white">
      <Header />
      
      <main className="w-full pt-16 sm:pt-20">
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

          {/* Hero Section */}
          <div className="mb-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Welcome back, {user?.email?.split('@')[0] || 'Chess Player'}
                </h1>
                <p className="text-gray-400 text-lg">{currentDate}</p>
              </div>
            </div>
          </div>

          {/* Stats Overview — Lichess + Puzzle Stats in single row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
            {/* Lichess Rating */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-2xl border border-slate-700/40 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                  <span className="text-black font-bold text-xs">L</span>
                </div>
                <span className="text-gray-400 text-xs font-medium">Lichess Rating</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {lichessStats?.rating?.rapid || lichessStats?.rating?.blitz || lichessStats?.rating?.bullet || '—'}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                {lichessStats?.rating?.rapid ? 'Rapid' : lichessStats?.rating?.blitz ? 'Blitz' : lichessStats?.rating?.bullet ? 'Bullet' : user?.lichessUsername ? 'Loading...' : 'Not connected'}
              </p>
            </div>

            {/* Games Played */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-5 rounded-2xl border border-slate-700/40 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">♟️</span>
                <span className="text-gray-400 text-xs font-medium">Games Played</span>
              </div>
              <p className="text-2xl font-bold text-white">{lichessStats?.gameCount?.total || '—'}</p>
              <p className="text-gray-500 text-xs mt-1">
                {lichessStats ? `${Math.round((lichessStats.winRate || 0) * 100)}% win rate` : ''}
              </p>
            </div>

            {/* Puzzles Solved */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-5 rounded-2xl border border-blue-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">🧩</span>
                <span className="text-gray-400 text-xs font-medium">Puzzles Solved</span>
              </div>
              <p className="text-2xl font-bold text-white">{puzzleStats?.totalPuzzlesSolved || 0}</p>
              <p className="text-gray-500 text-xs mt-1">
                Rating: {puzzleStats?.currentPuzzleRating || 1200}
              </p>
            </div>

            {/* Puzzle Streak */}
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-5 rounded-2xl border border-purple-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">🔥</span>
                <span className="text-gray-400 text-xs font-medium">Current Streak</span>
              </div>
              <p className="text-2xl font-bold text-white">{puzzleStats?.currentStreak || 0}</p>
              <p className="text-gray-500 text-xs mt-1">days</p>
            </div>

            {/* Puzzle Accuracy */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 p-5 rounded-2xl border border-green-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">🎯</span>
                <span className="text-gray-400 text-xs font-medium">Puzzle Accuracy</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {puzzleStats?.averageAccuracy ? `${Math.round(puzzleStats.averageAccuracy)}%` : '—'}
              </p>
              <p className="text-gray-500 text-xs mt-1">overall</p>
            </div>
          </div>

          {/* AI Coaching Insights */}
          {user?.lichessUsername && user.lichessUsername.trim().length > 0 && (
            <div className="mb-10">
              <DashboardInsights />
            </div>
          )}

          {/* Daily Challenge & Leaderboard Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
            {/* Daily Puzzle */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-4">Daily Challenge</h3>
              <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
                <div className="aspect-square bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg mb-4 flex items-center justify-center">
                  {dailyPuzzleLoading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800"></div>
                  ) : dailyPuzzle ? (
                    <div className="relative w-full h-full">
                      <ChessGame
                        isModalMode={true}
                        position={dailyPuzzle.fen}
                        onMove={() => {}}
                        interactive={false}
                        showNotation={false}
                        engineEnabled={false}
                      />
                      <div className="absolute inset-0 bg-black/10 rounded-lg flex items-center justify-center">
                        <div className="bg-white/90 text-slate-800 px-2 py-1 rounded text-xs font-semibold">
                          Preview
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-800 text-4xl">♛</span>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Theme: <span className="text-white">{dailyPuzzle?.themes?.[0] || 'Tactical'}</span></span>
                  <span className="text-gray-400">Rating: <span className="text-white">{dailyPuzzle?.rating || 1500}</span></span>
                </div>
              </div>
              <button 
                onClick={() => navigate(dailyPuzzleService.getPuzzleSolverUrl(dailyPuzzle || undefined))}
                className="w-full py-3 bg-gradient-to-r from-[#115fd4] to-[#4a90e2] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#115fd4]/25 transition-all duration-300"
                disabled={dailyPuzzleLoading}
              >
                🎯 Take Daily Challenge
              </button>
            </div>

            {/* Leaderboard */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-6">Puzzle Leaderboard</h3>
              {leaderboard && leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((player: any, index: number) => (
                    <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${
                      player.userId === user?.id ? 'bg-blue-600/20 border border-blue-600/50' : 'bg-slate-700/50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          'bg-slate-600 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm">
                            {player.userId === user?.id ? 'You' : `Player ${player.userId.slice(0, 8)}`}
                          </div>
                          <div className="text-xs text-gray-400">{player.totalPuzzlesSolved} solved</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{player.currentPuzzleRating}</div>
                        <div className="text-xs text-gray-400">rating</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No leaderboard data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Games */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-white mb-6">Recent Games</h3>
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm overflow-hidden">
              {recentGames.length === 0 || recentGames[0]?.platform === 'demo' ? (
                <div className="p-8 text-center">
                  <p className="text-gray-400 mb-2">No recent games found</p>
                  <p className="text-gray-500 text-sm">Connect your Lichess account to see your recent games</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-800/50 border-b border-slate-700">
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Opponent</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Result</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Time</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Opening</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Date</th>
                        <th className="px-6 py-4 text-left text-white text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentGames.map((game: any) => (
                        <tr key={game.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors duration-200">
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
                                game.ratingChange?.startsWith?.('+') ? 'text-green-400' : 
                                game.ratingChange === '0' ? 'text-gray-400' : 'text-red-400'
                              }`}>
                                {game.ratingChange && game.ratingChange !== '0' ? game.ratingChange : '±0'}
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
                                    View
                                  </a>
                                  <button
                                    onClick={() => handleAnalyzeGame(game)}
                                    className="px-3 py-1 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors duration-200"
                                  >
                                    Analyze
                                  </button>
                                </>
                              ) : (
                                <span className="text-gray-500 text-xs">—</span>
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
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
