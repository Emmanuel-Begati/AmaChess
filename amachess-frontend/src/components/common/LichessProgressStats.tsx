import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Trophy, AlertCircle, Clock, BarChart3 } from 'lucide-react';

interface TimeControlStats {
  wins: number;
  losses: number;
  draws: number;
  total: number;
  winRate: number;
  drawRate: number;
  currentRating: number | null;
}

interface LichessProgressData {
  totalGames: number;
  overallWinRate: number;
  timeControlBreakdown: {
    [key: string]: TimeControlStats;
  };
  strengthAreas: string[];
  improvementAreas: string[];
}

interface LichessProgressStatsProps {
  username: string;
}

const LichessProgressStats: React.FC<LichessProgressStatsProps> = ({ username }) => {
  const [progressData, setProgressData] = useState<LichessProgressData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgressData = async (retryCount = 0) => {
    if (!username || username.trim().length === 0) {
      setProgressData(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || '/api';
      const response = await fetch(`${apiBaseUrl}/lichess/${username}/progress`);
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
          errorMessage = `HTTP ${response.status}`;
        }

        if (response.status === 404) {
          throw new Error('User not found on Lichess');
        } else if (response.status === 500) {
          // For 500 errors, try retry once before failing
          if (retryCount < 1) {
            console.log(`Server error, retrying... (attempt ${retryCount + 1})`);
            setLoading(false);
            setTimeout(() => fetchProgressData(retryCount + 1), 2000);
            return;
          }
          throw new Error(`Server error: ${errorMessage}`);
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`Failed to fetch progress data: ${errorMessage}`);
        }
      }

      const data = await response.json();
      
      if (data.success && data.progressStats) {
        setProgressData(data.progressStats);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error fetching Lichess progress data:', err);
      
      // For network errors or temporary issues, suggest retry
      if (errorMessage.includes('fetch') || errorMessage.includes('Server error')) {
        setError(`${errorMessage}. Please try refreshing the page.`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we have a username
    if (username && username.trim().length > 0) {
      fetchProgressData();
    } else {
      setProgressData(null);
      setError(null);
      setLoading(false);
    }
  }, [username]);

  if (!username || username.trim().length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          <h3 className="text-2xl font-bold text-white">Lichess Progress Statistics</h3>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-lg font-medium text-gray-300 mb-2">No Lichess Username Configured</p>
          <p className="text-sm text-gray-400">Add your Lichess username to your profile to see your progress statistics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          <h3 className="text-2xl font-bold text-white">Lichess Progress Statistics</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-slate-700/50 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-slate-700/50 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          <h3 className="text-2xl font-bold text-white">Lichess Progress Statistics</h3>
        </div>
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
          <button
            onClick={() => fetchProgressData()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return null;
  }

  const formatWinRate = (rate: number) => (rate * 100).toFixed(1);

  const getTimeControlName = (timeControl: string) => {
    const names: { [key: string]: string } = {
      bullet: 'Bullet',
      blitz: 'Blitz',
      rapid: 'Rapid',
      classical: 'Classical'
    };
    return names[timeControl] || timeControl;
  };

  const getTimeControlColor = (timeControl: string) => {
    const colors: { [key: string]: string } = {
      bullet: 'bg-red-500/20 text-red-300 border border-red-500/30',
      blitz: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
      rapid: 'bg-green-500/20 text-green-300 border border-green-500/30',
      classical: 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
    };
    return colors[timeControl] || 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
      <div className="flex items-center space-x-3 mb-6">
        <TrendingUp className="w-6 h-6 text-purple-400" />
        <h3 className="text-2xl font-bold text-white">Lichess Progress Statistics</h3>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border border-purple-500/30 p-6 rounded-xl backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h4 className="font-medium text-gray-300">Total Games</h4>
          </div>
          <p className="text-3xl font-bold text-white">{progressData.totalGames.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 p-6 rounded-xl backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <Trophy className="w-5 h-5 text-green-400" />
            <h4 className="font-medium text-gray-300">Overall Win Rate</h4>
          </div>
          <p className="text-3xl font-bold text-white">{formatWinRate(progressData.overallWinRate)}%</p>
        </div>
      </div>

      {/* Time Control Breakdown */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-blue-400" />
          <h4 className="text-lg font-semibold text-white">Performance by Time Control</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(progressData.timeControlBreakdown).map(([timeControl, stats]) => (
            <div key={timeControl} className="bg-slate-700/30 border border-slate-600/50 p-5 rounded-xl backdrop-blur-sm hover:bg-slate-700/40 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTimeControlColor(timeControl)}`}>
                  {getTimeControlName(timeControl)}
                </span>
                {stats.currentRating && (
                  <span className="text-sm text-gray-300 font-medium">
                    Rating: <span className="text-white">{stats.currentRating}</span>
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Games:</span>
                  <span className="font-semibold text-white">{stats.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Win Rate:</span>
                  <span className="font-semibold text-green-400">{formatWinRate(stats.winRate)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Record:</span>
                  <span className="font-semibold text-white">
                    <span className="text-green-400">{stats.wins}W</span>-<span className="text-red-400">{stats.losses}L</span>-<span className="text-yellow-400">{stats.draws}D</span>
                  </span>
                </div>
                
                {/* Win rate progress bar */}
                <div className="w-full bg-slate-600/50 rounded-full h-2.5 mt-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2.5 rounded-full transition-all duration-300 shadow-lg shadow-green-500/50"
                    style={{ width: `${stats.winRate * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths and Improvement Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="w-5 h-5 text-green-400" />
            <h4 className="text-lg font-semibold text-white">Strength Areas</h4>
          </div>
          <div className="space-y-3">
            {progressData.strengthAreas.length > 0 ? (
              progressData.strengthAreas.map((strength, index) => (
                <div key={index} className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl backdrop-blur-sm hover:bg-green-500/15 transition-all duration-200">
                  <p className="text-sm text-green-300 leading-relaxed">{strength}</p>
                </div>
              ))
            ) : (
              <div className="bg-slate-700/30 border border-slate-600/50 p-4 rounded-xl backdrop-blur-sm">
                <p className="text-sm text-gray-400">Keep playing to identify strength areas!</p>
              </div>
            )}
          </div>
        </div>

        {/* Improvement Areas */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-orange-400" />
            <h4 className="text-lg font-semibold text-white">Areas to Improve</h4>
          </div>
          <div className="space-y-3">
            {progressData.improvementAreas.length > 0 ? (
              progressData.improvementAreas.map((improvement, index) => (
                <div key={index} className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-xl backdrop-blur-sm hover:bg-orange-500/15 transition-all duration-200">
                  <p className="text-sm text-orange-300 leading-relaxed">{improvement}</p>
                </div>
              ))
            ) : (
              <div className="bg-slate-700/30 border border-slate-600/50 p-4 rounded-xl backdrop-blur-sm">
                <p className="text-sm text-gray-400">Great job! No major areas for improvement identified.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LichessProgressStats;
