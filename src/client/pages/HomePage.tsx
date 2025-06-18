import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Target,
  TrendingUp,
  BookOpen
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-[#111822]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=1920&h=1080&fit=crop&crop=center")',
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
              Elevate Your Chess Game with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                AI-Powered Learning
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              AmaChess combines advanced AI analysis with a refined interface to provide a unique and effective chess learning experience for players of all levels.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors flex items-center gap-2 justify-center"
                >
                  Go to Dashboard
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/register')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
                  >
                    Start Free Trial
                  </button>
                  <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-colors">
                    Watch Demo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Unlock Your Chess Potential with AmaChess
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore our innovative features designed to enhance your chess skills and understanding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#233248] rounded-xl overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="h-48 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop&crop=center")' }} />
              <div className="p-6">
                <Target className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">AI-Powered Tutor</h3>
                <p className="text-gray-300 leading-relaxed">Engage with our AI tutor for personalized feedback and guidance. Practice against AI opponents with adaptive difficulty levels.</p>
              </div>
            </div>

            <div className="bg-[#233248] rounded-xl overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="h-48 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop&crop=center")' }} />
              <div className="p-6">
                <TrendingUp className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Progress Tracking</h3>
                <p className="text-gray-300 leading-relaxed">Visualize your learning journey with detailed progress reports and performance analytics.</p>
              </div>
            </div>

            <div className="bg-[#233248] rounded-xl overflow-hidden hover:shadow-2xl transition-shadow">
              <div className="h-48 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center")' }} />
              <div className="p-6">
                <BookOpen className="w-8 h-8 text-blue-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">Enhanced Book Reading</h3>
                <p className="text-gray-300 leading-relaxed">Dive deeper into chess literature with our enhanced book reading feature.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-700">
          <div className="max-w-4xl mx-auto text-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Transform Your Chess Game?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of players who have improved their chess skills with AmaChess. Start your journey today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/register')}
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
                >
                  Start Free Trial
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-bold text-lg transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default HomePage
