import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, 
  BookOpen, 
  Star, 
  Heart,
  Download,
  Filter,
  Grid,
  List,
  User,
  Home,
  Settings,
  Target,
  Users
} from 'lucide-react'

const Library: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const featuredBooks = [
    {
      title: "The Queen's Gambit",
      author: "Walter Tevis",
      cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop&crop=center",
      rating: 4.8,
      category: "Fiction"
    },
    {
      title: "Chess Fundamentals",
      author: "Jose Capablanca",
      cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=center",
      rating: 4.9,
      category: "Strategy"
    },
    {
      title: "Modern Chess Strategy",
      author: "Ludek Pachman",
      cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=400&fit=crop&crop=center",
      rating: 4.7,
      category: "Strategy"
    }
  ]

  const newReleases = [
    {
      title: "Chess Openings for Beginners",
      description: "Learn essential opening principles",
      cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=280&fit=crop&crop=center"
    },
    {
      title: "Tactics Training",
      description: "Improve your tactical vision",
      cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=280&fit=crop&crop=center"
    },
    {
      title: "Positional Play",
      description: "Understand positional concepts",
      cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&h=280&fit=crop&crop=center"
    },
    {
      title: "Chess Structures",
      description: "Master pawn structures",
      cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=200&h=280&fit=crop&crop=center"
    },
    {
      title: "The Art of Attack",
      description: "Learn attacking techniques",
      cover: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=280&fit=crop&crop=center"
    },
    {
      title: "Chess Calculation",
      description: "Improve your calculation skills",
      cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=280&fit=crop&crop=center"
    }
  ]

  const communityFavorites = [
    {
      title: "Defense and Counterattack",
      description: "Master defensive strategies",
      cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200&h=280&fit=crop&crop=center"
    }
  ]

  const sidebarMenuItems = [
    { icon: Home, label: 'Home', active: false },
    { icon: BookOpen, label: 'Learn', active: false },
    { icon: Target, label: 'Play', active: false },
    { icon: Target, label: 'Puzzles', active: false },
    { icon: Users, label: 'Community', active: false },
    { icon: BookOpen, label: 'Library', active: true },
    { icon: Settings, label: 'Settings', active: false },
  ]

  return (
    <div className="min-h-screen bg-[#111822] text-white flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-80 bg-[#101a23] p-4 flex flex-col justify-between min-h-screen"
      >
        <div className="space-y-4">
          {/* Profile Section */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gray-400 rounded-full bg-cover bg-center" />
            <span className="text-white font-medium">AmaChess</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {sidebarMenuItems.map((item, index) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  item.active 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-[#1a2332]'
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* Profile Actions */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-gray-400 hover:text-white hover:bg-[#1a2332] transition-colors">
            <User className="w-6 h-6" />
            <span className="font-medium">Profile</span>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 max-w-5xl">
        <div className="p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Library</h1>
            <p className="text-gray-400 text-sm max-w-3xl">
              Explore a vast collection of chess literature, from classic treatises to modern analyses, enriched with interactive features and community insights.
            </p>
          </motion.div>

          {/* Search and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search books, authors, topics..."
                className="w-full bg-[#233248] text-white pl-10 pr-4 py-3 rounded-lg border border-[#374162] focus:outline-none focus:border-blue-400"
              />
            </div>
            
            <div className="flex gap-2">
              <button className="p-3 bg-[#233248] border border-[#374162] rounded-lg hover:bg-[#374162] transition-colors">
                <Filter className="w-5 h-5 text-gray-400" />
              </button>
              
              <div className="flex bg-[#233248] border border-[#374162] rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-colors ${
                    viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Featured Books */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Featured Books</h2>
            <div className="flex overflow-x-auto gap-6 pb-4">
              {featuredBooks.map((book, index) => (
                <motion.div
                  key={book.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex-shrink-0 w-48 cursor-pointer group"
                >
                  <div className="relative mb-4">
                    <div 
                      className="w-full aspect-[3/4] bg-cover bg-center rounded-lg group-hover:shadow-xl transition-all duration-300"
                      style={{ backgroundImage: `url("${book.cover}")` }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 rounded-lg transition-all duration-300" />
                    <button className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Heart className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-white text-base font-medium mb-1 group-hover:text-blue-400 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{book.author}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-gray-400 text-sm">{book.rating}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* New Releases */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-white mb-6">New Releases</h2>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
                : 'grid-cols-1'
            }`}>
              {newReleases.map((book, index) => (
                <motion.div
                  key={book.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className={`cursor-pointer group ${
                    viewMode === 'list' ? 'flex gap-4 p-4 bg-[#233248] rounded-lg' : ''
                  }`}
                >
                  <div className={`${viewMode === 'list' ? 'w-20 h-28' : 'w-full aspect-[3/4]'} mb-3`}>
                    <div 
                      className="w-full h-full bg-cover bg-center rounded-lg group-hover:shadow-lg transition-shadow"
                      style={{ backgroundImage: `url("${book.cover}")` }}
                    />
                  </div>
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <h3 className="text-white text-base font-medium mb-1 group-hover:text-blue-400 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{book.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Community Favorites */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Community Favorites</h2>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
                : 'grid-cols-1'
            }`}>
              {communityFavorites.map((book, index) => (
                <motion.div
                  key={book.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className={`cursor-pointer group ${
                    viewMode === 'list' ? 'flex gap-4 p-4 bg-[#233248] rounded-lg' : ''
                  }`}
                >
                  <div className={`${viewMode === 'list' ? 'w-20 h-28' : 'w-full aspect-[3/4]'} mb-3`}>
                    <div 
                      className="w-full h-full bg-cover bg-center rounded-lg group-hover:shadow-lg transition-shadow"
                      style={{ backgroundImage: `url("${book.cover}")` }}
                    />
                  </div>
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <h3 className="text-white text-base font-medium mb-1 group-hover:text-blue-400 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-gray-400 text-sm">{book.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  )
}

export default Library
