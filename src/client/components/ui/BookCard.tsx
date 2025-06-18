import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Book, Play, Star } from 'lucide-react'

interface BookCardProps {
  title: string
  author: string
  rating: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  progress?: number
  image: string
  isInteractive?: boolean
}

const BookCard: React.FC<BookCardProps> = ({
  title,
  author,
  rating,
  difficulty,
  progress,
  image,
  isInteractive = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const difficultyColors = {
    Beginner: 'bg-green-600 text-green-100',
    Intermediate: 'bg-yellow-600 text-yellow-100',
    Advanced: 'bg-red-600 text-red-100'
  }

  return (
    <div className="bg-[#272e45] rounded-xl overflow-hidden hover:bg-[#374162] transition-all duration-300 transform hover:scale-[1.02]">
      <div className="relative">
        <div 
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url("${image}")` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">{title}</h3>
            <p className="text-gray-300 text-sm">{author}</p>
          </div>
        </div>
        
        {progress !== undefined && (
          <div className="absolute top-4 right-4">
            <div className="bg-black/60 rounded-full px-3 py-1">
              <span className="text-white text-xs font-medium">{progress}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                }`}
              />
            ))}
            <span className="text-gray-400 text-sm ml-1">({rating}/5)</span>
          </div>
          
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[difficulty]}`}>
            {difficulty}
          </span>
        </div>

        {progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">{progress}%</span>
            </div>
            <div className="w-full bg-[#374162] rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {isInteractive && (
          <>
            <div className="flex gap-2 mb-3">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Book className="w-4 h-4" />
                Read
              </button>
              <button className="flex-1 bg-[#374162] hover:bg-[#4a5568] text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <Play className="w-4 h-4" />
                Practice
              </button>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full text-gray-400 hover:text-white text-sm flex items-center justify-center gap-1 transition-colors"
            >
              {isExpanded ? (
                <>
                  <span>Less info</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>More info</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>

            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-[#374162] text-sm text-gray-300 space-y-2">
                <p><strong className="text-white">Category:</strong> Opening Theory</p>
                <p><strong className="text-white">Pages:</strong> 324</p>
                <p><strong className="text-white">Published:</strong> 2023</p>
                <p className="text-xs leading-relaxed">
                  A comprehensive guide to modern opening principles with practical examples 
                  and interactive variations to enhance your understanding.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default BookCard
