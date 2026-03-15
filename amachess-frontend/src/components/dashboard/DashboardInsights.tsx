import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import RecommendedPuzzles from './RecommendedPuzzles';

interface InsightData {
  insight: {
    message: string;
    coach: string;
    type: string;
    timestamp?: string;
  };
  analysis: {
    gamesAnalyzed: number;
    overallAccuracy: number | null;
    hasAccuracyData: boolean;
    winRate: number;
    wins: number;
    losses: number;
    draws: number;
    lossRate: number;
    drawRate: number;
    totalBlunders: number;
    totalMistakes: number;
    totalInaccuracies: number;
    hasAnalysisData: boolean;
    mostPlayedOpening: string;
    ratingProgress: number;
    averageRating: number;
  } | null;
  gamesAnalyzed: number;
  generatedAt?: string;
  generationTimeMs?: number;
  cached?: boolean;
  recommendedThemes?: { theme: string; reason: string }[];
  historicalProgress?: {
    winRateDelta: number;
    ratingDelta: number;
    blunderDelta: number;
    mistakeDelta: number;
    accuracyDelta: number | null;
    daysSinceLastInsight: number;
  } | null;
}

const DashboardInsights: React.FC = () => {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await axios.get(`/insights/dashboard${forceRefresh ? '?refresh=true' : ''}`);
      
      if (response.data.success) {
        setData(response.data);
      } else {
        setError(response.data.message || 'Failed to load insights');
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load coaching insights. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const handleRefresh = () => {
    fetchInsights(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-lg">🧠</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Coach B Insights</h3>
            <p className="text-gray-400 text-sm">Analyzing your recent games...</p>
          </div>
        </div>
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-slate-700/50 rounded-full w-full"></div>
          <div className="h-4 bg-slate-700/50 rounded-full w-5/6"></div>
          <div className="h-4 bg-slate-700/50 rounded-full w-4/6"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-700/30 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-red-500/20 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <span className="text-lg">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-white">Coach B Insights</h3>
        </div>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => fetchInsights()}
          className="px-4 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data || !data.insight) return null;

  const { insight, analysis } = data;

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-purple-500/20 backdrop-blur-sm relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-400"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <span className="text-lg">🧠</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Coach B Insights</h3>
            <div className="flex items-center gap-2">
              <p className="text-gray-400 text-xs">
                Based on your last {data.gamesAnalyzed} games
                {data.cached && ' • Cached'}
              </p>
              {data.historicalProgress && (
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                  Compared to {data.historicalProgress.daysSinceLastInsight} days ago
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-gray-300 text-sm font-medium rounded-xl hover:bg-slate-600/50 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600/50"
          title="Refresh insights"
        >
          <svg
            className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* AI Coaching Message */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-5 mb-6 border border-purple-500/10">
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5">♔</span>
          <p className="text-gray-200 leading-relaxed text-[15px]">
            {insight.message}
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      {analysis && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="Accuracy"
            value={analysis.overallAccuracy !== null ? `${analysis.overallAccuracy}%` : 'N/A'}
            icon="🎯"
            color="from-blue-500/20 to-blue-600/10"
            delta={Math.round(data.historicalProgress?.accuracyDelta || 0)}
            inverseGood={false}
          />
          <StatCard
            label="Win Rate"
            value={`${analysis.winRate}%`}
            icon="🏆"
            color="from-green-500/20 to-green-600/10"
            subtitle={`${analysis.wins}W ${analysis.losses}L ${analysis.draws}D`}
            delta={Math.round(data.historicalProgress?.winRateDelta || 0)}
            inverseGood={false}
          />
          <StatCard
            label="Blunders"
            value={analysis.hasAnalysisData ? `${analysis.totalBlunders}` : 'N/A'}
            icon="💥"
            color="from-red-500/20 to-red-600/10"
            delta={data.historicalProgress?.blunderDelta}
            inverseGood={true}
          />
          <StatCard
            label="Rating Δ"
            value={analysis.ratingProgress > 0 ? `+${analysis.ratingProgress}` : `${analysis.ratingProgress}`}
            icon="📈"
            color={analysis.ratingProgress >= 0 ? 'from-green-500/20 to-green-600/10' : 'from-red-500/20 to-red-600/10'}
            delta={data.historicalProgress?.ratingDelta}
            inverseGood={false}
          />
          <StatCard
            label="Avg Rating"
            value={`${analysis.averageRating}`}
            icon="⭐"
            color="from-yellow-500/20 to-yellow-600/10"
          />
          <StatCard
            label="Top Opening"
            value={analysis.mostPlayedOpening.length > 18
              ? analysis.mostPlayedOpening.substring(0, 16) + '…'
              : analysis.mostPlayedOpening}
            icon="📖"
            color="from-purple-500/20 to-purple-600/10"
            small
          />
        </div>
      )}

      {/* Recommended Puzzle Themes */}
      {data.recommendedThemes && data.recommendedThemes.length > 0 && (
        <RecommendedPuzzles themes={data.recommendedThemes} />
      )}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  color: string;
  small?: boolean;
  subtitle?: string;
  delta?: number | null | undefined;
  inverseGood?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, small = false, subtitle, delta, inverseGood = false }) => {
  let deltaIndicator = null;
  
  if (delta !== undefined && delta !== null && delta !== 0 && !isNaN(delta)) {
    const isPositive = delta > 0;
    const isGood = inverseGood ? !isPositive : isPositive;
    const deltaColor = isGood ? "text-green-400" : "text-red-400";
    const deltaIcon = isPositive ? "↑" : "↓";
    const bgOpacity = isGood ? "bg-green-500/10" : "bg-red-500/10";
    
    deltaIndicator = (
      <span className={`text-[10px] font-bold ${deltaColor} ${bgOpacity} px-1.5 py-0.5 rounded ml-2 whitespace-nowrap`}>
        {deltaIcon}{Math.abs(delta)}
      </span>
    );
  }

  return (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-3 border border-slate-700/30`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm">{icon}</span>
        <span className="text-gray-400 text-xs font-medium">{label}</span>
      </div>
      <div className="flex items-end">
        <p className={`text-white font-bold ${small ? 'text-xs' : 'text-lg'} truncate`}>{value}</p>
        {deltaIndicator}
      </div>
      {subtitle && <p className="text-gray-500 text-[10px] mt-1">{subtitle}</p>}
    </div>
  );
};

export default DashboardInsights;
