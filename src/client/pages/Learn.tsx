import React, { useState } from 'react'
import { 
  Upload, 
  Search, 
  Play, 
  TrendingUp,
  BarChart3,
  Calendar,
  Plus,
  Target,
  BookOpen,
  Zap,
  Award
} from 'lucide-react'

const Learn: React.FC = () => {
  const [activeTab, setActiveTab] = useState('strengths')
  const [activeProgressTab, setActiveProgressTab] = useState('rating')

  const stats = [
    { label: 'Total Games', value: '187' },
    { label: 'Learning Points', value: '456' },
  ]

  const strengths = [
    "Solid opening principles",
    "Tactical awareness in the middlegame",
    "Strong endgame technique",
    "Good time management"
  ]

  const improvements = [
    "Positional understanding",
    "Pattern recognition",
    "Complex calculation",
    "Opening theory depth"
  ]

  const chartData = [
    { date: 'Jan 1', rating: 1520 },
    { date: 'Jan 8', rating: 1535 },
    { date: 'Jan 15', rating: 1550 },
    { date: 'Jan 22', rating: 1580 },
    { date: 'Jan 29', rating: 1650 },
  ]

  return (
    <div className="min-h-screen bg-[#121621] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Learn From Your Games
          </h1>
          <p className="text-gray-400 text-sm mb-6">
            Transform your playing experience into personalized chess education
          </p>
          
          {/* Import Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button className="bg-[#272e45] hover:bg-[#374162] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
              Import from Lichess
            </button>
            <button className="bg-[#272e45] hover:bg-[#374162] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
              Import from Chess.com
            </button>
            <button className="bg-[#272e45] hover:bg-[#374162] text-white px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload PGN
            </button>
          </div>
        </div>        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#272e45] rounded-xl p-6 border border-[#374162]"
            >
              <h3 className="text-white text-base font-medium mb-1">{stat.label}</h3>
              <p className="text-white text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>{/* Game Library Search */}
        <div className="bg-[#272e45] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Game Library</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your games..."
              className="w-full bg-[#374162] text-white pl-10 pr-4 py-3 rounded-lg border border-[#4a5568] focus:outline-none focus:border-blue-400"
            />
          </div>        </div>

        {/* Featured Video */}
        <div className="bg-[#272e45] rounded-xl p-6 mb-8">
          <div className="relative aspect-video bg-cover bg-center rounded-lg overflow-hidden">
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&h=450&fit=crop&crop=center")'
              }}
            >
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <button className="bg-black/40 hover:bg-black/60 rounded-full p-4 transition-colors">
                  <Play className="w-8 h-8 text-white fill-current" />
                </button>
              </div>
            </div>
          </div>        </div>

        {/* AI Insights Tabs */}
        <div className="bg-[#272e45] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">AI Insights</h2>
          
          {/* Tab Navigation */}
          <div className="flex border-b border-[#374162] mb-6">
            {[
              { id: 'strengths', label: 'Strengths' },
              { id: 'improvements', label: 'Learning Opportunities' },
              { id: 'patterns', label: 'Pattern Recognition' },
              { id: 'recommendations', label: 'Study Recommendations' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 pt-4 px-4 text-sm font-bold tracking-wide border-b-3 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-800 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[200px]">
            {activeTab === 'strengths' && (
              <div>
                <p className="text-white text-base mb-4">
                  Your strengths include solid opening principles and tactical awareness in the middlegame. Continue to reinforce these areas through practice and analysis.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-900/20 rounded-lg border border-green-700/30">
                      <Award className="w-5 h-5 text-green-400" />
                      <span className="text-white">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'improvements' && (
              <div>
                <p className="text-white text-base mb-4">
                  Focus on these areas to accelerate your improvement and reach the next level in your chess journey.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {improvements.map((improvement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
                      <Target className="w-5 h-5 text-blue-400" />
                      <span className="text-white">{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'patterns' && (
              <div>
                <p className="text-white text-base mb-4">
                  Pattern recognition exercises tailored to your playing style and common position types from your games.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#374162] rounded-lg">
                    <h4 className="text-white font-semibold mb-2">Tactical Patterns</h4>
                    <p className="text-gray-300 text-sm">Focus on pins, forks, and discovered attacks</p>
                  </div>
                  <div className="p-4 bg-[#374162] rounded-lg">
                    <h4 className="text-white font-semibold mb-2">Positional Themes</h4>
                    <p className="text-gray-300 text-sm">Weak squares, pawn structures, piece coordination</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'recommendations' && (
              <div>
                <p className="text-white text-base mb-4">
                  Personalized study recommendations based on your game analysis and improvement areas.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-[#374162] rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                    <div>
                      <h4 className="text-white font-semibold">Study: Endgame Principles</h4>
                      <p className="text-gray-300 text-sm">Focus on king and pawn endgames</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[#374162] rounded-lg">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    <div>
                      <h4 className="text-white font-semibold">Practice: Tactical Puzzles</h4>
                      <p className="text-gray-300 text-sm">Pin and fork combinations</p>
                    </div>
                  </div>
                </div>              </div>
            )}
          </div>
        </div>

        {/* Learning Dashboard */}
        <div className="bg-[#272e45] rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Learning Dashboard</h2>
          
          {/* Progress Tab Navigation */}
          <div className="flex border-b border-[#374162] mb-6">
            {[
              { id: 'rating', label: 'Rating Progress' },
              { id: 'weakAreas', label: 'Weak Areas' },
              { id: 'timeSpent', label: 'Time Spent' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveProgressTab(tab.id)}
                className={`pb-3 pt-4 px-4 text-sm font-bold tracking-wide border-b-3 transition-colors ${
                  activeProgressTab === tab.id
                    ? 'border-blue-800 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chart Area */}
          <div className="h-64 bg-[#374162] rounded-lg p-4 flex items-center justify-center">
            {activeProgressTab === 'rating' && (
              <div className="w-full h-full">
                <div className="flex justify-between items-end h-full">
                  {chartData.map((point, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="bg-blue-500 w-8 mb-2 rounded-t"
                        style={{ height: `${((point.rating - 1500) / 200) * 100}%` }}
                      />
                      <span className="text-gray-400 text-xs">{point.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeProgressTab === 'weakAreas' && (
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Weak area analysis will be displayed here</p>
              </div>
            )}
            
            {activeProgressTab === 'timeSpent' && (
              <div className="text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Time tracking visualization will be displayed here</p>
              </div>
            )}          </div>
        </div>        {/* AI Learning Coach */}
        <div className="bg-[#272e45] rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">AI Learning Coach</h2>
          <p className="text-white text-base mb-6">
            Your AI Learning Coach provides personalized insights based on your game analysis. It identifies key areas for improvement, suggests smart recommendations, tracks your progress, and offers custom training options to enhance your chess skills.
          </p>
            <div className="flex justify-end">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-colors">
              <Plus className="w-5 h-5" />
              Get Personalized Plan
            </button>          </div>
        </div>
      </div>
    </div>
  )
}

export default Learn
