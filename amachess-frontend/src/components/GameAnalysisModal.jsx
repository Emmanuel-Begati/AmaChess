import React, { useState } from 'react';

const GameAnalysisModal = ({ isOpen, onClose, gameData, analysis, isBulkAnalysis }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  // Sample data for demonstration
  const defaultSingleAnalysis = {
    accuracy: 87,
    blunders: 2,
    mistakes: 3,
    inaccuracies: 5,
    openingName: "Sicilian Defense: Najdorf Variation",
    openingEval: "+0.3",
    tacticalThemes: ["Pin", "Fork", "Discovered Attack"],
    weaknesses: ["Time management in middlegame", "Missed tactical opportunities"],
    improvements: ["Study more endgame patterns", "Practice tactical puzzles daily"],
    moveAccuracy: {
      excellent: { count: 25, percentage: 45 },
      good: { count: 15, percentage: 27 },
      inaccuracies: { count: 8, percentage: 14 },
      mistakes: { count: 5, percentage: 9 },
      blunders: { count: 2, percentage: 4 }
    },
    phaseAnalysis: {
      opening: { performance: "Excellent", eval: "+0.2", description: "Strong development and center control" },
      middlegame: { performance: "Good", eval: "-0.5", description: "Some inaccuracies in pawn structure" },
      endgame: { performance: "Excellent", eval: "+1.2", description: "Precise technique secured the win" }
    },
    tacticalAnalysis: {
      themes: [
        { theme: "Pin", occurrences: 3, success: 2 },
        { theme: "Fork", occurrences: 2, success: 1 },
        { theme: "Skewer", occurrences: 1, success: 1 }
      ],
      successful: ["Knight fork on move 23", "Pin defense on move 31"],
      missed: ["Back rank mate threat on move 18", "Tactical shot on move 26"]
    },
    keyMoments: [
      { 
        move: 18, 
        notation: "Rxd4", 
        type: "blunder", 
        evaluation: "-2.3", 
        description: "Allowed opponent to gain material advantage" 
      },
      { 
        move: 23, 
        notation: "Nf5+", 
        type: "excellent", 
        evaluation: "+1.8", 
        description: "Brilliant tactical shot that wins material" 
      }
    ]
  };

  const bulkAnalysisData = {
    gamesAnalyzed: 47,
    timeRange: "Last 3 months",
    overallAccuracy: 84,
    winRate: 0.64,
    ratingProgress: 156,
    totalBlunders: 44,
    openingPerformance: {
      mostPlayed: [
        { name: "Sicilian Defense", games: 15, winRate: 0.67, avgAccuracy: 86 },
        { name: "Queen's Gambit", games: 12, winRate: 0.58, avgAccuracy: 82 },
        { name: "English Opening", games: 8, winRate: 0.75, avgAccuracy: 88 }
      ]
    },
    timeControlAnalysis: {
      blitz: { games: 28, winRate: 0.61, avgAccuracy: 82 },
      rapid: { games: 15, winRate: 0.73, avgAccuracy: 87 },
      classical: { games: 4, winRate: 0.5, avgAccuracy: 89 }
    },
    trends: {
      monthlyProgress: [
        { month: "October", rating: 1542, accuracy: 81 },
        { month: "November", rating: 1598, accuracy: 84 },
        { month: "December", rating: 1698, accuracy: 87 }
      ]
    },
    opponentAnalysis: {
      vsStronger: { games: 18, winRate: 0.39, avgRatingDiff: 127 },
      vsSimilar: { games: 20, winRate: 0.70, avgRatingDiff: 15 },
      vsWeaker: { games: 9, winRate: 0.89, avgRatingDiff: -98 }
    },
    phaseAnalysis: {
      opening: { 
        avgAccuracy: 89, 
        commonMistakes: ["Premature attacks", "Neglecting development"], 
        improvement: "Study opening principles more thoroughly" 
      },
      middlegame: { 
        avgAccuracy: 78, 
        commonMistakes: ["Poor pawn structure", "Tactical oversights"], 
        improvement: "Focus on tactical pattern recognition" 
      },
      endgame: { 
        avgAccuracy: 85, 
        commonMistakes: ["Time pressure errors", "Basic technique"], 
        improvement: "Practice fundamental endgames" 
      }
    },
    tacticalThemes: [
      { theme: "Pin", frequency: 23, successRate: 0.74 },
      { theme: "Fork", frequency: 18, successRate: 0.67 },
      { theme: "Skewer", frequency: 12, successRate: 0.83 },
      { theme: "Discovered Attack", frequency: 8, successRate: 0.50 }
    ],
    keyGamesForReview: [
      {
        opponent: "ChessMaster2000",
        result: "Loss",
        date: "Dec 15, 2024",
        reason: "Missed winning combination in the middlegame",
        lessonType: "Tactical Awareness"
      },
      {
        opponent: "PositionalPlayer",
        result: "Win",
        date: "Dec 10, 2024",
        reason: "Excellent endgame technique demonstration",
        lessonType: "Endgame Mastery"
      }
    ],
    improvementAreas: [
      {
        area: "Tactical Calculation",
        priority: "High",
        description: "Missing tactical opportunities in complex positions",
        recommendation: "Solve 20 tactical puzzles daily, focus on calculation depth",
        estimatedGain: "+50 rating points"
      },
      {
        area: "Time Management",
        priority: "Medium",
        description: "Spending too much time in opening and early middlegame",
        recommendation: "Practice with increment time controls, develop opening repertoire",
        estimatedGain: "+30 rating points"
      }
    ]
  };

  // Use the appropriate data based on analysis type
  const analysisData = isBulkAnalysis ? bulkAnalysisData : (analysis || defaultSingleAnalysis);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {isBulkAnalysis ? (
              <>
                {/* Bulk Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-[#97a1c4] text-sm font-medium">Overall Accuracy</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{analysisData.overallAccuracy}%</p>
                    <p className="text-green-400 text-xs mt-1">Improving trend</p>
                  </div>
                  <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-[#97a1c4] text-sm font-medium">Win Rate</p>
                    </div>
                    <p className="text-2xl font-bold text-green-400">{(analysisData.winRate * 100).toFixed(0)}%</p>
                    <p className="text-green-300 text-xs mt-1">Above average</p>
                  </div>
                  <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <p className="text-[#97a1c4] text-sm font-medium">Rating Progress</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-400">+{analysisData.ratingProgress}</p>
                    <p className="text-purple-300 text-xs mt-1">Last 3 months</p>
                  </div>
                  <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <p className="text-[#97a1c4] text-sm font-medium">Total Blunders</p>
                    </div>
                    <p className="text-2xl font-bold text-red-400">{analysisData.totalBlunders}</p>
                    <p className="text-red-300 text-xs mt-1">0.94 per game</p>
                  </div>
                </div>

                {/* Opening Performance */}
                <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                  <h3 className="text-xl font-bold text-white mb-4">Opening Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[#97a1c4] text-sm mb-3">Most Played Openings</p>
                      {analysisData.openingPerformance.mostPlayed.map((opening, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-[#374162] rounded-lg mb-2">
                          <div>
                            <p className="text-white font-medium">{opening.name}</p>
                            <p className="text-[#97a1c4] text-sm">{opening.games} games</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">{(opening.winRate * 100).toFixed(0)}%</p>
                            <p className="text-[#97a1c4] text-sm">{opening.avgAccuracy}% acc</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-[#97a1c4] text-sm mb-3">Time Control Performance</p>
                      {Object.entries(analysisData.timeControlAnalysis).map(([timeControl, data]) => (
                        <div key={timeControl} className="flex items-center justify-between p-3 bg-[#374162] rounded-lg mb-2">
                          <div>
                            <p className="text-white font-medium capitalize">{timeControl}</p>
                            <p className="text-[#97a1c4] text-sm">{data.games} games</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">{(data.winRate * 100).toFixed(0)}%</p>
                            <p className="text-[#97a1c4] text-sm">{data.avgAccuracy}% acc</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Single Game Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-[#97a1c4] text-sm font-medium">Overall Accuracy</p>
                    </div>
                    <p className="text-2xl font-bold text-white">{analysisData.accuracy}%</p>
                    <p className="text-green-400 text-xs mt-1">Above average</p>
                  </div>
                  <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <p className="text-[#97a1c4] text-sm font-medium">Blunders</p>
                    </div>
                    <p className="text-2xl font-bold text-red-400">{analysisData.blunders}</p>
                    <p className="text-red-300 text-xs mt-1">Critical errors</p>
                  </div>
                  <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <p className="text-[#97a1c4] text-sm font-medium">Mistakes</p>
                    </div>
                    <p className="text-2xl font-bold text-orange-400">{analysisData.mistakes}</p>
                    <p className="text-orange-300 text-xs mt-1">Significant errors</p>
                  </div>
                  <div className="bg-[#272e45] rounded-xl p-4 border border-[#374162]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <p className="text-[#97a1c4] text-sm font-medium">Inaccuracies</p>
                    </div>
                    <p className="text-2xl font-bold text-yellow-400">{analysisData.inaccuracies}</p>
                    <p className="text-yellow-300 text-xs mt-1">Minor errors</p>
                  </div>
                </div>

                {/* Opening Information */}
                <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                  <h3 className="text-xl font-bold text-white mb-4">Opening Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[#97a1c4] text-sm mb-2">Opening Played</p>
                      <p className="text-lg font-semibold text-white mb-1">{analysisData.openingName}</p>
                      <p className="text-green-400 text-sm">Evaluation: {analysisData.openingEval}</p>
                    </div>
                    <div>
                      <p className="text-[#97a1c4] text-sm mb-2">Opening Performance</p>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <p className="text-white font-medium">Strong opening play</p>
                      </div>
                      <p className="text-[#97a1c4] text-sm mt-1">Good piece development and center control</p>
                    </div>
                  </div>
                </div>

                {/* Quick Insights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-900/20 border border-green-600 rounded-xl p-4">
                    <h4 className="text-green-400 font-semibold mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      <li className="text-[#97a1c4] text-sm">• Solid opening principles</li>
                      <li className="text-[#97a1c4] text-sm">• Good tactical awareness</li>
                      <li className="text-[#97a1c4] text-sm">• Strong endgame technique</li>
                    </ul>
                  </div>
                  <div className="bg-orange-900/20 border border-orange-600 rounded-xl p-4">
                    <h4 className="text-orange-400 font-semibold mb-2">Focus Areas</h4>
                    <ul className="space-y-1">
                      <li className="text-[#97a1c4] text-sm">• Time management</li>
                      <li className="text-[#97a1c4] text-sm">• Middlegame planning</li>
                      <li className="text-[#97a1c4] text-sm">• Tactical calculation</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'accuracy':
        return (
          <div className="space-y-6">
            {isBulkAnalysis ? (
              <>
                {/* Performance Trends for Bulk Analysis */}
                <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                  <h3 className="text-xl font-bold text-white mb-6">Monthly Progress</h3>
                  <div className="space-y-4">
                    {analysisData.trends.monthlyProgress.map((month, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-[#374162] rounded-lg">
                        <div>
                          <span className="text-white font-medium">{month.month} 2024</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-[#97a1c4] text-xs">Rating</p>
                            <p className="text-white font-bold">{month.rating}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[#97a1c4] text-xs">Accuracy</p>
                            <p className="text-blue-400 font-bold">{month.accuracy}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Opponent Strength Analysis */}
                <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                  <h3 className="text-xl font-bold text-white mb-4">Performance vs Opponent Strength</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(analysisData.opponentAnalysis).map(([category, data]) => (
                      <div key={category} className="bg-[#374162] rounded-lg p-4">
                        <h4 className="text-white font-medium mb-2 capitalize">
                          {category.replace('vs', 'vs ').replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <div className="space-y-2">
                          <p className="text-[#97a1c4] text-sm">{data.games} games</p>
                          <p className="text-lg font-bold text-white">{(data.winRate * 100).toFixed(0)}% win rate</p>
                          <p className="text-[#97a1c4] text-xs">
                            {data.avgRatingDiff > 0 ? '+' : ''}{data.avgRatingDiff} avg rating diff
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Single Game Accuracy */}
                <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                  <h3 className="text-xl font-bold text-white mb-6">Move Quality Distribution</h3>
                  <div className="space-y-4">
                    {Object.entries(analysisData.moveAccuracy || {}).map(([category, data]) => (
                      <div key={category} className="flex items-center justify-between p-3 bg-[#374162] rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            category === 'excellent' ? 'bg-green-500' :
                            category === 'good' ? 'bg-blue-500' :
                            category === 'inaccuracies' ? 'bg-yellow-500' :
                            category === 'mistakes' ? 'bg-orange-500' :
                            'bg-red-500'
                          }`}></div>
                          <span className="text-white font-medium capitalize">{category.replace('inaccuracies', 'Inaccuracies')}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-white font-bold">{data?.count || 0}</span>
                          <span className="text-[#97a1c4] ml-2">({data?.percentage || 0}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accuracy by Game Phase */}
                <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                  <h3 className="text-xl font-bold text-white mb-4">Accuracy by Game Phase</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#374162] rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Opening</h4>
                      <p className="text-2xl font-bold text-green-400">92%</p>
                      <p className="text-[#97a1c4] text-sm">15 moves analyzed</p>
                    </div>
                    <div className="bg-[#374162] rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Middlegame</h4>
                      <p className="text-2xl font-bold text-orange-400">78%</p>
                      <p className="text-[#97a1c4] text-sm">28 moves analyzed</p>
                    </div>
                    <div className="bg-[#374162] rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Endgame</h4>
                      <p className="text-2xl font-bold text-blue-400">89%</p>
                      <p className="text-[#97a1c4] text-sm">12 moves analyzed</p>
                    </div>
                  </div>
                </div>

                {/* Time Management */}
                <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                  <h3 className="text-xl font-bold text-white mb-4">Time Management Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#374162] rounded-lg p-4">
                      <p className="text-[#97a1c4] text-sm mb-2">Average Time per Move</p>
                      <p className="text-xl font-bold text-white">32 seconds</p>
                      <p className="text-green-400 text-sm">Within optimal range</p>
                    </div>
                    <div className="bg-[#374162] rounded-lg p-4">
                      <p className="text-[#97a1c4] text-sm mb-2">Time Pressure Moves</p>
                      <p className="text-xl font-bold text-orange-400">6 moves</p>
                      <p className="text-orange-300 text-sm">Under 10 seconds</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'phases':
        return (
          <div className="space-y-6">
            {isBulkAnalysis ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(analysisData.phaseAnalysis || {}).map(([phase, data]) => (
                  <div key={phase} className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                    <h4 className="text-lg font-bold text-white mb-3 capitalize">{phase}</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[#97a1c4] text-sm">Average Accuracy</p>
                        <p className="text-2xl font-bold text-blue-400">{data?.avgAccuracy || 0}%</p>
                      </div>
                      <div>
                        <p className="text-[#97a1c4] text-sm mb-2">Common Mistakes</p>
                        <ul className="space-y-1">
                          {(data?.commonMistakes || []).map((mistake, index) => (
                            <li key={index} className="text-[#97a1c4] text-sm">• {mistake}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-[#97a1c4] text-sm mb-1">Improvement Focus</p>
                        <p className="text-white text-sm">{data?.improvement || 'No specific recommendations'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(analysisData.phaseAnalysis || {}).map(([phase, data]) => (
                  <div key={phase} className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                    <h4 className="text-lg font-bold text-white mb-3 capitalize">{phase}</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[#97a1c4] text-sm">Performance</p>
                        <p className={`font-semibold ${
                          data?.performance === 'Excellent' ? 'text-green-400' :
                          data?.performance === 'Good' ? 'text-blue-400' :
                          'text-orange-400'
                        }`}>{data?.performance || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[#97a1c4] text-sm">Evaluation</p>
                        <p className={`font-bold ${(data?.eval || '').startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {data?.eval || 'N/A'}
                        </p>
                      </div>
                      <p className="text-[#97a1c4] text-sm">{data?.description || 'No description available'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'tactics':
        return (
          <div className="space-y-6">
            {isBulkAnalysis ? (
              <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                <h3 className="text-xl font-bold text-white mb-4">Tactical Theme Performance</h3>
                <div className="space-y-4">
                  {(analysisData.tacticalThemes || []).map((theme, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-[#374162] rounded-lg">
                      <div>
                        <p className="text-white font-medium">{theme.theme}</p>
                        <p className="text-[#97a1c4] text-sm">{theme.frequency} occurrences</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${
                          theme.successRate >= 0.7 ? 'text-green-400' :
                          theme.successRate >= 0.6 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {(theme.successRate * 100).toFixed(0)}%
                        </p>
                        <p className="text-[#97a1c4] text-xs">success rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Tactical Themes in This Game */}
                <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                  <h3 className="text-xl font-bold text-white mb-4">Tactical Themes Found</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {(analysisData.tacticalThemes || []).map((theme, index) => (
                      <div key={index} className="bg-[#374162] rounded-lg p-4 text-center">
                        <p className="text-white font-medium">{theme}</p>
                        <p className="text-blue-400 text-sm mt-2">Practice more →</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tactical Performance Breakdown */}
                <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                  <h3 className="text-xl font-bold text-white mb-4">Tactical Performance</h3>
                  <div className="space-y-4">
                    {(analysisData.tacticalAnalysis?.themes || []).map((theme, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-[#374162] rounded-lg">
                        <div>
                          <p className="text-white font-medium">{theme.theme}</p>
                          <p className="text-[#97a1c4] text-sm">{theme.occurrences} opportunities</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${
                            theme.success === theme.occurrences ? 'text-green-400' :
                            theme.success > 0 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {theme.success}/{theme.occurrences}
                          </p>
                          <p className="text-[#97a1c4] text-xs">executed</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tactical Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-900/20 border border-green-600 rounded-xl p-4">
                    <h4 className="text-green-400 font-semibold mb-3">Successfully Executed</h4>
                    <ul className="space-y-2">
                      {(analysisData.tacticalAnalysis?.successful || []).map((tactic, index) => (
                        <li key={index} className="text-[#97a1c4] text-sm">• {tactic}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-red-900/20 border border-red-600 rounded-xl p-4">
                    <h4 className="text-red-400 font-semibold mb-3">Missed Opportunities</h4>
                    <ul className="space-y-2">
                      {(analysisData.tacticalAnalysis?.missed || []).map((tactic, index) => (
                        <li key={index} className="text-[#97a1c4] text-sm">• {tactic}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'keymoments':
        return (
          <div className="space-y-4">
            {isBulkAnalysis ? (
              <>
                <h3 className="text-xl font-bold text-white mb-4">Key Games for Review</h3>
                {(analysisData.keyGamesForReview || []).map((game, index) => (
                  <div key={index} className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                    <div className="flex items-start gap-4">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        game.result === 'Win' ? 'bg-green-500' :
                        game.result === 'Loss' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-white font-bold">vs {game.opponent}</p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            game.result === 'Win' ? 'bg-green-600 text-white' :
                            game.result === 'Loss' ? 'bg-red-600 text-white' :
                            'bg-yellow-600 text-white'
                          }`}>
                            {game.result}
                          </span>
                          <span className="text-[#97a1c4] text-sm">{game.date}</span>
                        </div>
                        <p className="text-[#97a1c4] mb-2">{game.reason}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 text-sm font-medium">Lesson: {game.lessonType}</span>
                          <button className="text-blue-400 hover:text-blue-300 text-sm">→ Review Game</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-white mb-4">Critical Moments</h3>
                {(analysisData.keyMoments || []).map((moment, index) => (
                  <div key={index} className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                    <div className="flex items-start gap-4">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        moment.type === 'excellent' ? 'bg-green-500' :
                        moment.type === 'blunder' ? 'bg-red-500' :
                        moment.type === 'mistake' ? 'bg-orange-500' :
                        'bg-yellow-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-white font-bold">Move {moment.move}: {moment.notation}</p>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            moment.type === 'excellent' ? 'bg-green-600 text-white' :
                            moment.type === 'blunder' ? 'bg-red-600 text-white' :
                            moment.type === 'mistake' ? 'bg-orange-600 text-white' :
                            'bg-yellow-600 text-white'
                          }`}>
                            {moment.type.charAt(0).toUpperCase() + moment.type.slice(1)}
                          </span>
                          <span className={`font-mono text-sm ${
                            moment.evaluation.startsWith('+') ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {moment.evaluation}
                          </span>
                        </div>
                        <p className="text-[#97a1c4]">{moment.description}</p>
                        <button className="text-blue-400 hover:text-blue-300 text-sm mt-2">→ View Position</button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        );

      case 'improvement':
        return (
          <div className="space-y-6">
            {isBulkAnalysis ? (
              <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                <h3 className="text-xl font-bold text-white mb-4">Priority Improvement Areas</h3>
                <div className="space-y-4">
                  {(analysisData.improvementAreas || []).map((area, index) => (
                    <div key={index} className="p-4 bg-[#374162] rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-white font-semibold">{area.area}</h4>
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                            area.priority === 'High' ? 'bg-red-600 text-white' :
                            area.priority === 'Medium' ? 'bg-orange-600 text-white' :
                            'bg-yellow-600 text-black'
                          }`}>
                            {area.priority} Priority
                          </span>
                        </div>
                        <span className="text-green-400 font-medium text-sm">{area.estimatedGain}</span>
                      </div>
                      <p className="text-[#97a1c4] text-sm mb-2">{area.description}</p>
                      <div className="bg-[#272e45] p-3 rounded border-l-4 border-blue-500">
                        <p className="text-blue-400 font-medium text-sm">Recommendation:</p>
                        <p className="text-white text-sm">{area.recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Personalized Recommendations */}
                <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                  <h3 className="text-xl font-bold text-white mb-4">Personalized Recommendations</h3>
                  <div className="space-y-4">
                    {(analysisData.improvements || []).map((improvement, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-[#374162] rounded-lg">
                        <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-white font-medium">{improvement}</p>
                          <p className="text-[#97a1c4] text-sm mt-1">Recommended based on your game patterns</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Areas to Focus On */}
                <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                  <h3 className="text-xl font-bold text-white mb-4">Areas to Focus On</h3>
                  <div className="space-y-4">
                    {(analysisData.weaknesses || []).map((weakness, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-orange-900/20 border border-orange-600 rounded-lg">
                        <svg className="w-5 h-5 text-orange-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                          <p className="text-orange-400 font-medium">{weakness}</p>
                          <p className="text-[#97a1c4] text-sm mt-1">Identified weakness in this game</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Study Plan */}
                <div className="bg-[#272e45] rounded-xl p-6 border border-[#374162]">
                  <h3 className="text-xl font-bold text-white mb-4">Suggested Study Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#374162] rounded-lg p-4">
                      <h4 className="text-blue-400 font-medium mb-2">This Week</h4>
                      <ul className="space-y-1">
                        <li className="text-[#97a1c4] text-sm">• Practice 10 tactical puzzles daily</li>
                        <li className="text-[#97a1c4] text-sm">• Study Sicilian Defense variations</li>
                        <li className="text-[#97a1c4] text-sm">• Review this game's key moments</li>
                      </ul>
                    </div>
                    <div className="bg-[#374162] rounded-lg p-4">
                      <h4 className="text-purple-400 font-medium mb-2">This Month</h4>
                      <ul className="space-y-1">
                        <li className="text-[#97a1c4] text-sm">• Focus on endgame fundamentals</li>
                        <li className="text-[#97a1c4] text-sm">• Practice time management</li>
                        <li className="text-[#97a1c4] text-sm">• Analyze similar games</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        );

      default:
        return <div className="text-white">Tab content not found</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121621] rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#374162]">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isBulkAnalysis ? 'Bulk Game Analysis Report' : 'Game Analysis Report'}
            </h2>
            {isBulkAnalysis ? (
              <p className="text-[#97a1c4] text-sm mt-1">
                {analysisData.gamesAnalyzed} games analyzed • {analysisData.timeRange}
              </p>
            ) : gameData && (
              <p className="text-[#97a1c4] text-sm mt-1">
                vs {gameData.opponent} • {gameData.result} • {gameData.date}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-[#97a1c4] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#374162] px-6 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'accuracy', label: isBulkAnalysis ? 'Performance Trends' : 'Accuracy' },
            { id: 'phases', label: 'Game Phases' },
            { id: 'tactics', label: 'Tactics' },
            { id: 'keymoments', label: isBulkAnalysis ? 'Key Games' : 'Key Moments' },
            { id: 'improvement', label: 'Improvement' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-800 text-white'
                  : 'border-transparent text-[#97a1c4] hover:text-white'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#374162]">
          <div className="flex gap-3">
            <button className="bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
              Export Report
            </button>
            <button className="bg-green-800 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
              Save Analysis
            </button>
            {isBulkAnalysis && (
              <button className="bg-purple-800 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm">
                Create Study Plan
              </button>
            )}
          </div>
          <button 
            onClick={onClose}
            className="bg-[#374162] hover:bg-[#455173] text-white px-6 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameAnalysisModal;
