import React, { useState } from 'react'
import { 
  Target, 
  Clock, 
  Star, 
  Trophy, 
  Zap,
  Award,
  Calendar,
  TrendingUp
} from 'lucide-react'

const Puzzles: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all')
  
  const puzzleCategories = [
    { id: 'all', label: 'All', count: 1250 },
    { id: 'tactics', label: 'Tactics', count: 850 },
    { id: 'endgame', label: 'Endgame', count: 200 },
    { id: 'opening', label: 'Opening', count: 100 },
    { id: 'middlegame', label: 'Middlegame', count: 100 },
  ]

  const featuredPuzzles = [
    {
      id: 1,
      title: "Tactical Challenge",
      difficulty: "Expert",
      rating: 1800,
      theme: "Fork",
      completion: "85%",
      image: "https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=400&h=300&fit=crop&crop=center"
    },
    {
      id: 2,
      title: "Endgame Mastery",
      difficulty: "Intermediate",
      rating: 1400,
      theme: "King & Pawn",
      completion: "92%",
      image: "https://images.unsplash.com/photo-1611195974226-ef16767c3050?w=400&h=300&fit=crop&crop=center"
    },
    {
      id: 3,
      title: "Opening Trap",
      difficulty: "Beginner",
      rating: 1200,
      theme: "Scholar's Mate",
      completion: "78%",
      image: "https://images.unsplash.com/photo-1606166187734-a4cb70074b4c?w=400&h=300&fit=crop&crop=center"
    }
  ]

  const stats = [
    { label: "Puzzles Solved", value: "1,247", icon: Target, color: "text-blue-400" },
    { label: "Current Rating", value: "1,685", icon: TrendingUp, color: "text-green-400" },
    { label: "Best Streak", value: "23", icon: Zap, color: "text-yellow-400" },
    { label: "Achievements", value: "12", icon: Award, color: "text-purple-400" },
  ]

  return (
    <div className="min-h-screen bg-[#121621] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Puzzles</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Challenge yourself with thousands of chess puzzles designed to improve your tactical vision and pattern recognition.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const IconComponent = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-[#272e45] rounded-xl p-6 text-center"
              >
                <IconComponent className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Daily Challenge */}
        <div className="bg-[#272e45] rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Daily Challenge</h2>
            <div className="flex items-center gap-2 text-yellow-400">
              <Trophy className="w-5 h-5" />
              <span className="text-sm font-medium">Premium Reward</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="bg-[#374162] rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Today's Puzzle</span>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-4 h-4" />
                    <span className="text-sm">1650</span>
                  </div>
                </div>
                <div className="aspect-square bg-[#121621] rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">Interactive puzzle board</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <h3 className="text-xl font-bold text-white mb-2">Tactical Fork</h3>
              <p className="text-gray-400 mb-4">
                Find the winning tactical shot that forks the opponent's king and queen. This intermediate-level puzzle will test your pattern recognition skills.
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">5 min avg</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">73% solved</span>
                </div>
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                Start Challenge
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {puzzleCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#272e45] text-gray-300 hover:bg-[#374162]'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Featured Puzzles */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Featured Puzzles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPuzzles.map((puzzle) => (
              <div
                key={puzzle.id}
                className="bg-[#272e45] rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:scale-105"
              >
                <div className="relative">
                  <img
                    src={puzzle.image}
                    alt={puzzle.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm font-medium">
                    {puzzle.difficulty}
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
                    {puzzle.completion} completed
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors">
                    {puzzle.title}
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-blue-400 text-sm font-medium bg-blue-400/10 px-2 py-1 rounded">
                      {puzzle.theme}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-white text-sm font-medium">{puzzle.rating}</span>
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
                    Solve Puzzle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side by Side Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Performance Analytics */}
          <div className="bg-[#272e45] rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Performance Analytics
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#374162] rounded-lg">
                <span className="text-gray-300">Weekly Progress</span>
                <span className="text-green-400 font-medium">+12%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#374162] rounded-lg">
                <span className="text-gray-300">Accuracy Rate</span>
                <span className="text-blue-400 font-medium">87%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#374162] rounded-lg">
                <span className="text-gray-300">Average Time</span>
                <span className="text-yellow-400 font-medium">3m 42s</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#374162] rounded-lg">
                <span className="text-gray-300">Streak</span>
                <span className="text-purple-400 font-medium">7 days</span>
              </div>
            </div>
          </div>

          {/* Achievements & Rewards */}
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 text-white">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Latest Achievements
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <div>
                  <div className="font-medium">Puzzle Master</div>
                  <div className="text-sm opacity-80">Solved 100 puzzles</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                <Zap className="w-8 h-8 text-blue-400" />
                <div>
                  <div className="font-medium">Speed Demon</div>
                  <div className="text-sm opacity-80">Solved in under 30s</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                <Calendar className="w-8 h-8 text-green-400" />
                <div>
                  <div className="font-medium">Daily Warrior</div>
                  <div className="text-sm opacity-80">7-day solving streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Puzzles
