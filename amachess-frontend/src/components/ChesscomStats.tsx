import React, { useState, useEffect } from 'react';

interface TimeControlStats {
  wins: number;
  losses: number;
  draws: number;
  total: number;
  winRate: number;
  drawRate: number;
  currentRating: number | null;
}

interface ChesscomProgressData {
  totalGames: number;
  overallWinRate: number;
  timeControlBreakdown: {
    [key: string]: TimeControlStats;
  };
  strengthAreas: string[];
  improvementAreas: string[];
}

interface ChesscomStatsProps {
  username: string;
}

const ChesscomStats: React.FC<ChesscomStatsProps> = ({ username }) => {
  const [progressData, setProgressData] = useState<ChesscomProgressData | null>(null);
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
      const response = await fetch(`http://localhost:3001/api/chesscom/${username}/progress`);
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch {
          errorMessage = `HTTP ${response.status}`;
        }

        if (response.status === 404) {
          throw new Error('User not found on Chess.com');
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
      console.error('Error fetching Chess.com progress data:', err);
      
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
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Chess.com Statistics</h3>
          <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">♛</span>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400 mb-2">No Chess.com username found</p>
          <p className="text-gray-400 text-sm">Add your Chess.com username to your profile to see detailed statistics</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Chess.com Statistics</h3>
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">♛</span>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
          <span className="text-gray-400">Loading Chess.com statistics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Chess.com Statistics</h3>
          <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">⚠</span>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-red-400 mb-2">Error loading Chess.com statistics</p>
          <p className="text-gray-400 text-sm">{error}</p>
          <button
            onClick={() => fetchProgressData()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!progressData) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Chess.com Statistics</h3>
          <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">♛</span>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400 mb-2">No data available</p>
          <p className="text-gray-400 text-sm">Unable to load statistics for {username}</p>
        </div>
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 0.6) return 'text-green-400';
    if (winRate >= 0.5) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTimeControlColor = (timeControl: string) => {
    const colors: { [key: string]: string } = {
      bullet: 'bg-red-500/20 text-red-400 border-red-500/30',
      blitz: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      rapid: 'bg-green-500/20 text-green-400 border-green-500/30',
      daily: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    };
    return colors[timeControl] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getTimeControlName = (timeControl: string) => {
    const names: { [key: string]: string } = {
      bullet: 'Bullet',
      blitz: 'Blitz',
      rapid: 'Rapid',
      daily: 'Daily'
    };
    return names[timeControl] || timeControl;
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">Chess.com Statistics</h3>
        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">♛</span>
        </div>
      </div>

      {/* Overall Performance */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-white mb-4">Overall Performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center bg-slate-700/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Total Games Played</p>
            <p className="text-3xl font-bold text-white">{formatNumber(progressData.totalGames)}</p>
            <p className="text-gray-400 text-xs">All time controls</p>
          </div>
          <div className="text-center bg-slate-700/30 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Overall Win Rate</p>
            <p className={`text-3xl font-bold ${getWinRateColor(progressData.overallWinRate)}`}>
              {Math.round(progressData.overallWinRate * 100)}%
            </p>
            <p className="text-gray-400 text-xs">Across all formats</p>
          </div>
        </div>
      </div>

      {/* Time Control Breakdown */}
      {Object.keys(progressData.timeControlBreakdown).length > 0 && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-white mb-4">Performance by Time Control</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(progressData.timeControlBreakdown).map(([timeControl, breakdown]) => (
              breakdown.total > 0 && (
                <div key={timeControl} className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTimeControlColor(timeControl)}`}>
                      {getTimeControlName(timeControl)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Games:</span>
                      <span className="text-white">{breakdown.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Win Rate:</span>
                      <span className={getWinRateColor(breakdown.winRate)}>
                        {Math.round(breakdown.winRate * 100)}%
                      </span>
                    </div>
                    {breakdown.currentRating && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Rating:</span>
                        <span className="text-white">{breakdown.currentRating}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-gray-600">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>W: {breakdown.wins}</span>
                        <span>D: {breakdown.draws}</span>
                        <span>L: {breakdown.losses}</span>
                      </div>
                    </div>
                    
                    {/* Win rate progress bar */}
                    <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${breakdown.winRate * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        {progressData.strengthAreas.length > 0 && (
          <div className="bg-slate-700/20 rounded-lg p-4">
            <h5 className="text-md font-semibold text-white mb-3 flex items-center">
              <span className="text-green-400 mr-2">💪</span>
              Strengths
            </h5>
            <div className="space-y-2">
              {progressData.strengthAreas.map((strength, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-green-400 text-sm mt-0.5">✓</span>
                  <p className="text-gray-300 text-sm">{strength}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvement Areas */}
        {progressData.improvementAreas.length > 0 && (
          <div className="bg-slate-700/20 rounded-lg p-4">
            <h5 className="text-md font-semibold text-white mb-3 flex items-center">
              <span className="text-orange-400 mr-2">🎯</span>
              Areas for Improvement
            </h5>
            <div className="space-y-2">
              {progressData.improvementAreas.map((improvement, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <span className="text-orange-400 text-sm mt-0.5">!</span>
                  <p className="text-gray-300 text-sm">{improvement}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show placeholder if no insights */}
        {progressData.strengthAreas.length === 0 && progressData.improvementAreas.length === 0 && (
          <div className="md:col-span-2 bg-slate-700/20 rounded-lg p-4 text-center">
            <p className="text-gray-400 text-sm">
              Play more games to get personalized insights about your strengths and areas for improvement!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChesscomStats;
