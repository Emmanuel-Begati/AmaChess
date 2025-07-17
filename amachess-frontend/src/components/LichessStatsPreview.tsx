import React, { useState, useEffect } from 'react';

interface LichessStats {
  username: string;
  rating: {
    rapid?: number;
    blitz?: number;
    bullet?: number;
    classical?: number;
    puzzle?: number;
  };
  gameCount: {
    rapid: number;
    blitz: number;
    bullet: number;
    classical: number;
    total: number;
  };
  winRate: number;
  online: boolean;
  title?: string;
  patron: boolean;
  verified: boolean;
  playTime: number;
  createdAt: string;
  language: string;
  country?: string;
}

interface LichessStatsPreviewProps {
  username: string;
}

const LichessStatsPreview: React.FC<LichessStatsPreviewProps> = ({ username }) => {
  const [stats, setStats] = useState<LichessStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!username || username.length < 3) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:3001/api/games/${username}/stats`);
        const data = await response.json();
        
        if (data.success) {
          setStats(data.stats);
        } else {
          setError('User not found');
        }
      } catch (err) {
        setError('Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchStats, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [username]);

  if (!username || username.length < 3) return null;

  return (
    <div className="bg-[#0f1419] border border-[#374162] rounded-lg p-4">
      <h4 className="text-white font-medium mb-3 flex items-center">
        <span className="w-6 h-6 bg-white rounded mr-2 flex items-center justify-center">
          <span className="text-black font-bold text-sm">L</span>
        </span>
        Lichess Profile Preview
      </h4>
      
      {loading && (
        <div className="flex items-center text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading stats...
        </div>
      )}
      
      {error && (
        <div className="text-red-400 text-sm">
          {error === 'User not found' 
            ? `Lichess user "${username}" not found. Please check the username.`
            : error
          }
        </div>
      )}
      
      {stats && !loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Rapid</p>
            <p className="text-white font-medium">{stats.rating.rapid || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400">Blitz</p>
            <p className="text-white font-medium">{stats.rating.blitz || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400">Bullet</p>
            <p className="text-white font-medium">{stats.rating.bullet || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-400">Games</p>
            <p className="text-white font-medium">{stats.gameCount.total}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-400">Win Rate</p>
            <p className="text-white font-medium">{Math.round(stats.winRate * 100)}%</p>
          </div>
          {stats.title && (
            <div className="col-span-2">
              <p className="text-gray-400">Title</p>
              <p className="text-yellow-400 font-medium">{stats.title}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LichessStatsPreview;
