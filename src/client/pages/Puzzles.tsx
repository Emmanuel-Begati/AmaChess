import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Target, 
  Clock, 
  Star, 
  Trophy, 
  Filter,
  User,
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
      description: "Sharpen your tactical skills with this challenging puzzle.",
      difficulty: "Advanced",
      rating: 1850,
      theme: "Pin",
      image: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=300&fit=crop&crop=center",
      timeLimit: "5:00"
    },
    {
      id: 2,
      title: "Endgame Mastery",
      description: "Test your endgame knowledge in this position.",
      difficulty: "Intermediate",
      rating: 1650,
      theme: "King & Pawn",
      image: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=300&h=300&fit=crop&crop=center",
      timeLimit: "3:00"
    },
    {
      id: 3,
      title: "Opening Trap",
      description: "Avoid this common opening mistake.",
      difficulty: "Beginner",
      rating: 1200,
      theme: "Opening",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=center",
      timeLimit: "2:00"
    }
  ]

  const stats = [
    { label: 'Puzzles Solved', value: '1,247', icon: Target },
    { label: 'Success Rate', value: '87%', icon: TrendingUp },
    { label: 'Current Streak', value: '15', icon: Zap },
    { label: 'Best Rating', value: '1,891', icon: Award },
  ]

  const recentActivity = [
    { puzzle: "Knight Fork", result: "Solved", time: "2:34", rating: "+12" },
    { puzzle: "Back Rank Mate", result: "Solved", time: "1:45", rating: "+8" },
    { puzzle: "Pin & Win", result: "Failed", time: "5:00", rating: "-5" },
    { puzzle: "Discovered Attack", result: "Solved", time: "3:12", rating: "+15" },
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-400/10 border-green-400/20'
      case 'Intermediate': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
      case 'Advanced': return 'text-red-400 bg-red-400/10 border-red-400/20'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
    }
  }

  return (
    <div className="min-h-screen bg-[#121621] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Puzzles</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Challenge yourself with thousands of chess puzzles designed to improve your tactical vision and pattern recognition.
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="bg-[#272e45] rounded-xl p-6 text-center"
            >
              <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Puzzle Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#272e45] rounded-xl p-6 mb-8"
        >
          <div className="flex border-b border-[#374162] mb-6">
            {puzzleCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`pb-3 pt-4 px-4 text-sm font-bold tracking-wide border-b-3 transition-colors ${
                  activeTab === category.id
                    ? 'border-blue-800 text-white'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                {category.label}
                <span className="ml-2 text-xs bg-[#374162] px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex gap-2">
              <button className="flex items-center gap-2 bg-[#374162] hover:bg-[#4a5568] text-white px-4 py-2 rounded-lg transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <select className="bg-[#374162] text-white px-4 py-2 rounded-lg border border-[#4a5568] focus:outline-none focus:border-blue-400">
                <option>Difficulty: All</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
            
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Random Puzzle
            </button>
          </div>
        </motion.div>

        {/* Featured Puzzles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Featured Puzzles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPuzzles.map((puzzle, index) => (
              <motion.div
                key={puzzle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-[#272e45] rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="relative">
                  <div 
                    className="aspect-square bg-cover bg-center"
                    style={{ backgroundImage: `url("${puzzle.image}")` }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300" />
                  
                  {/* Puzzle Info Overlay */}
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(puzzle.difficulty)}`}>
                      {puzzle.difficulty}
                    </span>
                  </div>
                  
                  <div className="absolute top-4 right-4 flex gap-2">
                    <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {puzzle.timeLimit}
                    </div>
                    <div className="bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {puzzle.rating}
                    </div>
                  </div>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg">
                      <Target className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-white text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">
                    {puzzle.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">{puzzle.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 text-sm font-medium">Theme: {puzzle.theme}</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-gray-400 text-sm">4.8</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-[#272e45] rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              Recent Activity
            </h2>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#374162] rounded-lg">
                  <div>
                    <h4 className="text-white font-medium">{activity.puzzle}</h4>
                    <p className="text-gray-400 text-sm">Time: {activity.time}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${
                      activity.result === 'Solved' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {activity.result}
                    </p>
                    <p className={`text-xs ${
                      activity.rating.startsWith('+') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {activity.rating}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 text-blue-400 text-sm hover:text-blue-300 transition-colors">
              View All Activity
            </button>
          </motion.div>

          {/* Daily Challenge */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div>
                <h2 className="text-xl font-bold">Daily Challenge</h2>
                <p className="text-blue-100 text-sm">Complete today's special puzzle</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium">Today's Theme</span>
                <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold">
                  BONUS XP
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2">Queen Sacrifice</h3>
              <p className="text-blue-100 text-sm mb-4">
                Sometimes the most powerful piece must be sacrificed for victory. Can you find the winning move?
              </p>
              <div className="flex gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <span>Rating: 1950</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Time: 10:00</span>
                </div>
              </div>
            </div>
            
            <button className="w-full bg-white text-purple-600 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors">
              Start Daily Challenge
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Puzzles
