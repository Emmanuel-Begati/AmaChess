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
      const response = await fetch(`http://localhost:3001/api/lichess/${username}/progress`);
      
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
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-800">Lichess Progress Statistics</h3>
        </div>
        <div className="text-gray-600 text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-lg font-medium mb-2">No Lichess Username Configured</p>
          <p className="text-sm">Add your Lichess username to your profile to see your progress statistics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-800">Lichess Progress Statistics</h3>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-800">Lichess Progress Statistics</h3>
        </div>
        <div className="text-red-600 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchProgressData()}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium transition-colors"
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
      bullet: 'bg-red-100 text-red-800',
      blitz: 'bg-yellow-100 text-yellow-800',
      rapid: 'bg-green-100 text-green-800',
      classical: 'bg-blue-100 text-blue-800'
    };
    return colors[timeControl] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <TrendingUp className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-semibold text-gray-800">Lichess Progress Statistics</h3>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h4 className="font-medium text-gray-700">Total Games</h4>
          </div>
          <p className="text-2xl font-bold text-purple-600">{progressData.totalGames.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Trophy className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-gray-700">Overall Win Rate</h4>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatWinRate(progressData.overallWinRate)}%</p>
        </div>
      </div>

      {/* Time Control Breakdown */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Clock className="w-5 h-5 text-gray-600" />
          <h4 className="text-lg font-medium text-gray-700">Performance by Time Control</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(progressData.timeControlBreakdown).map(([timeControl, stats]) => (
            <div key={timeControl} className="border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTimeControlColor(timeControl)}`}>
                  {getTimeControlName(timeControl)}
                </span>
                {stats.currentRating && (
                  <span className="text-sm text-gray-600">
                    Rating: {stats.currentRating}
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Games:</span>
                  <span className="font-medium">{stats.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Win Rate:</span>
                  <span className="font-medium text-green-600">{formatWinRate(stats.winRate)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Record:</span>
                  <span className="font-medium">
                    {stats.wins}W-{stats.losses}L-{stats.draws}D
                  </span>
                </div>
                
                {/* Win rate progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
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
          <div className="flex items-center space-x-2 mb-3">
            <Trophy className="w-5 h-5 text-green-600" />
            <h4 className="text-lg font-medium text-gray-700">Strength Areas</h4>
          </div>
          <div className="space-y-2">
            {progressData.strengthAreas.length > 0 ? (
              progressData.strengthAreas.map((strength, index) => (
                <div key={index} className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <p className="text-sm text-green-800">{strength}</p>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Keep playing to identify strength areas!</p>
              </div>
            )}
          </div>
        </div>

        {/* Improvement Areas */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Target className="w-5 h-5 text-orange-600" />
            <h4 className="text-lg font-medium text-gray-700">Areas to Improve</h4>
          </div>
          <div className="space-y-2">
            {progressData.improvementAreas.length > 0 ? (
              progressData.improvementAreas.map((improvement, index) => (
                <div key={index} className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                  <p className="text-sm text-orange-800">{improvement}</p>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Great job! No major areas for improvement identified.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LichessProgressStats;
