import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, BookOpen, Target, Zap, Clock, Star, ChevronRight } from 'lucide-react'

interface Recommendation {
  id: string
  type: 'study' | 'practice' | 'review' | 'play'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimatedTime: string
  difficulty: number
  category: string
  reason: string
  progress?: number
}

interface AIRecommendationPanelProps {
  userRating: number
  recentGames: Array<{
    result: 'win' | 'loss' | 'draw'
    opponent: string
    timeControl: string
    mistakes: number
  }>
  studyProgress: Array<{
    topic: string
    completion: number
  }>
}

const AIRecommendationPanel: React.FC<AIRecommendationPanelProps> = ({
  userRating,
  recentGames,
  studyProgress
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  // Simulate AI recommendation generation
  useEffect(() => {
    const generateRecommendations = () => {
      setIsLoading(true)
      
      // Simulate AI analysis delay
      setTimeout(() => {
        const generatedRecommendations: Recommendation[] = [
          {
            id: '1',
            type: 'study',
            title: 'Master King and Pawn Endgames',
            description: 'Your recent games show missed opportunities in king and pawn endgames. Focus on opposition and critical squares.',
            priority: 'high',
            estimatedTime: '45 min',
            difficulty: 3,
            category: 'Endgames',
            reason: 'Based on 3 recent games where you missed winning endgame techniques',
            progress: 25
          },
          {
            id: '2',
            type: 'practice',
            title: 'Tactical Pattern Recognition',
            description: 'Practice pin and fork combinations to improve your tactical awareness in the middlegame.',
            priority: 'high',
            estimatedTime: '20 min',
            difficulty: 2,
            category: 'Tactics',
            reason: 'Your tactical rating is 150 points below your overall rating'
          },
          {
            id: '3',
            type: 'review',
            title: 'Analyze Your French Defense Games',
            description: 'Review your last 5 French Defense games to identify recurring positional mistakes.',
            priority: 'medium',
            estimatedTime: '30 min',
            difficulty: 3,
            category: 'Openings',
            reason: '40% loss rate with French Defense in the last month'
          },
          {
            id: '4',
            type: 'play',
            title: 'Practice 15+10 Time Control',
            description: 'Your time management in longer games needs improvement. Practice with 15+10 increment.',
            priority: 'medium',
            estimatedTime: '60 min',
            difficulty: 2,
            category: 'Time Management',
            reason: 'Lost 3 games due to time pressure in the last week'
          },
          {
            id: '5',
            type: 'study',
            title: 'Queen\'s Gambit Declined Structures',
            description: 'Deepen your understanding of pawn structures in the Queen\'s Gambit Declined.',
            priority: 'low',
            estimatedTime: '35 min',
            difficulty: 4,
            category: 'Positional Play',
            reason: 'To complement your solid opening repertoire'
          }
        ]
        
        setRecommendations(generatedRecommendations)
        setIsLoading(false)
      }, 1500)
    }

    generateRecommendations()
  }, [userRating, recentGames, studyProgress])

  const categories = ['all', 'Tactics', 'Endgames', 'Openings', 'Positional Play', 'Time Management']

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.category === selectedCategory)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'study': return BookOpen
      case 'practice': return Target
      case 'review': return TrendingUp
      case 'play': return Zap
      default: return BookOpen
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'study': return 'bg-blue-600'
      case 'practice': return 'bg-green-600'
      case 'review': return 'bg-yellow-600'
      case 'play': return 'bg-purple-600'
      default: return 'bg-blue-600'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10'
      case 'medium': return 'border-yellow-500 bg-yellow-500/10'
      case 'low': return 'border-green-500 bg-green-500/10'
      default: return 'border-gray-500 bg-gray-500/10'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-[#272e45] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white">AI Chess Coach</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-blue-400">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span>Analyzing your chess performance...</span>
          </div>
          
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#374162] rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-600 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-600 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#272e45] rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">AI Chess Coach</h2>
        </div>
        <div className="text-sm text-gray-400">
          Based on your rating: <span className="text-white font-semibold">{userRating}</span>
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#374162] text-gray-300 hover:bg-[#4a5568] hover:text-white'
              }`}
            >
              {category === 'all' ? 'All Recommendations' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No recommendations found for the selected category.</p>
          </div>
        ) : (
          filteredRecommendations.map((recommendation) => {
            const TypeIcon = getTypeIcon(recommendation.type)
            
            return (
              <div
                key={recommendation.id}
                className={`p-4 rounded-lg border-l-4 ${getPriorityColor(recommendation.priority)} hover:bg-[#374162] transition-all duration-200 cursor-pointer group`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-6 h-6 ${getTypeColor(recommendation.type)} rounded flex items-center justify-center`}>
                        <TypeIcon className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                        {recommendation.title}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        recommendation.priority === 'high' ? 'bg-red-600 text-red-100' :
                        recommendation.priority === 'medium' ? 'bg-yellow-600 text-yellow-100' :
                        'bg-green-600 text-green-100'
                      }`}>
                        {recommendation.priority}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 mb-3 leading-relaxed">
                      {recommendation.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{recommendation.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        <span>Difficulty: {recommendation.difficulty}/5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        <span>{recommendation.category}</span>
                      </div>
                    </div>
                    
                    {recommendation.progress !== undefined && (
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">{recommendation.progress}%</span>
                        </div>
                        <div className="w-full bg-[#374162] rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${recommendation.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-[#121621] rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <Brain className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-400 mb-1">AI Analysis:</p>
                          <p className="text-sm text-gray-300">{recommendation.reason}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors ml-4" />
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Start Now
                  </button>
                  <button className="bg-[#374162] hover:bg-[#4a5568] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Save for Later
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Refresh Recommendations */}
      <div className="mt-6 pt-4 border-t border-[#374162]">
        <button 
          onClick={() => setIsLoading(true)}
          className="w-full bg-[#374162] hover:bg-[#4a5568] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Refresh Recommendations
        </button>
      </div>
    </div>
  )
}

export default AIRecommendationPanel
