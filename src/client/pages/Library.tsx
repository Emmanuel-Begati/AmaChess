import React, { useState } from 'react'
import { 
  Search, 
  Star, 
  Heart,
  Download,
  Filter,
  Grid,
  List
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

  return (
    <div className="min-h-screen bg-[#121621] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Chess Library</h1>
          <p className="text-gray-400">Discover chess books, resources, and learning materials</p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search books, authors, or topics..."
              className="w-full bg-[#272e45] text-white pl-10 pr-4 py-3 rounded-lg border border-[#374162] focus:outline-none focus:border-blue-400 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-[#272e45] hover:bg-[#374162] text-white px-4 py-3 rounded-lg transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="bg-[#272e45] hover:bg-[#374162] text-white px-4 py-3 rounded-lg transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Featured Books */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Featured Books</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredBooks.map((book) => (
              <div
                key={book.title}
                className="bg-[#272e45] rounded-xl p-6 hover:bg-[#374162] transition-all duration-300 cursor-pointer group transform hover:scale-105"
              >
                <div className="relative mb-4">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-48 object-cover rounded-lg group-hover:shadow-lg transition-shadow"
                  />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="bg-black/40 hover:bg-black/60 p-2 rounded-full transition-colors">
                      <Heart className="w-4 h-4 text-white" />
                    </button>
                    <button className="bg-black/40 hover:bg-black/60 p-2 rounded-full transition-colors">
                      <Download className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors">{book.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{book.author}</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-400 text-sm font-medium bg-blue-400/10 px-2 py-1 rounded">{book.category}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm font-medium">{book.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Releases */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">New Releases</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {newReleases.map((book) => (
              <div
                key={book.title}
                className="flex-shrink-0 w-48 cursor-pointer group"
              >
                <div className="bg-[#272e45] rounded-xl p-4 hover:bg-[#374162] transition-all duration-300 h-full transform hover:scale-105">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-32 object-cover rounded-lg mb-3 group-hover:shadow-lg transition-shadow"
                  />
                  <h3 className="text-white font-bold text-sm mb-1 group-hover:text-blue-400 transition-colors">{book.title}</h3>
                  <p className="text-gray-400 text-xs">{book.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Favorites */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Community Favorites</h2>
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[...communityFavorites, ...newReleases.slice(0, 3)].map((book) => (
              <div
                key={book.title}
                className={`cursor-pointer group transition-all duration-300 transform hover:scale-105 ${
                  viewMode === 'list' 
                    ? 'flex gap-4 bg-[#272e45] rounded-xl p-4 hover:bg-[#374162]' 
                    : 'bg-[#272e45] rounded-xl p-6 hover:bg-[#374162]'
                }`}
              >
                <img
                  src={book.cover}
                  alt={book.title}
                  className={`object-cover rounded-lg group-hover:shadow-lg transition-shadow ${
                    viewMode === 'list' ? 'w-24 h-32' : 'w-full h-48 mb-4'
                  }`}
                />
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors">{book.title}</h3>
                  <p className="text-gray-400 text-sm">{book.description}</p>
                  {viewMode === 'list' && (
                    <div className="flex gap-2 mt-3">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition-colors">
                        Read
                      </button>
                      <button className="bg-[#374162] hover:bg-[#4a5568] text-white px-3 py-1 rounded text-xs transition-colors">
                        Download
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Library
