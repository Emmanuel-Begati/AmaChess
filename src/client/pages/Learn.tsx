import React, { useState } from 'react'
import { 
  Brain, 
  Trophy, 
  Target, 
  BookOpen, 
  Play, 
  Clock,
  CheckCircle,
  ArrowRight,
  Award,
  Activity,
  BarChart3,
  Zap,
  Gift,
  Upload,
  Eye,
  TrendingUp,
  Users
} from 'lucide-react'

const Learn: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-[#121621] text-white">
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-transparent" />
          <div className="absolute top-20 right-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 bg-blue-900/20 border border-blue-500/20 rounded-full px-6 py-3 mb-8 backdrop-blur-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-blue-300 font-medium">AI-Powered Chess Learning</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent mb-6 tracking-tight">
              Master Chess
              <br />
              <span className="text-4xl md:text-6xl">with Intelligence</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
              Transform your chess journey with personalized AI coaching, real-time analysis, 
              and adaptive learning paths designed for rapid improvement.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-2xl flex items-center gap-3 transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/25">
                <Play className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                Start Learning Journey
              </button>
              
              <button className="group border-2 border-gray-600 hover:border-blue-400 text-gray-300 hover:text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center gap-3 backdrop-blur-sm hover:bg-blue-900/10">
                <Eye className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Watch Demo
              </button>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { icon: Brain, title: 'AI Analysis', desc: 'Deep position evaluation' },
                { icon: TrendingUp, title: 'Progress Tracking', desc: 'Detailed improvement metrics' },
                { icon: Users, title: 'Expert Guidance', desc: 'Learn from grandmaster games' }
              ].map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600/20 to-blue-700/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-blue-500/20">
                    <feature.icon className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Enhanced Stats Overview */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Your Chess Journey</h2>
            <p className="text-gray-400 text-lg">Track your progress and celebrate your achievements</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Trophy, label: 'Current Rating', value: '1,650', change: '+85 this month', color: 'blue', bgGradient: 'from-blue-600/10 to-blue-700/5' },
              { icon: Target, label: 'Puzzles Solved', value: '1,247', change: '92% accuracy', color: 'purple', bgGradient: 'from-purple-600/10 to-purple-700/5' },
              { icon: Clock, label: 'Study Time', value: '47h', change: '5-day streak', color: 'green', bgGradient: 'from-green-600/10 to-green-700/5' },
              { icon: Activity, label: 'Games Analyzed', value: '342', change: '78% win rate', color: 'orange', bgGradient: 'from-orange-600/10 to-orange-700/5' }
            ].map((stat, index) => (
              <div
                key={index}
                className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 border border-gray-800/50 hover:border-blue-500/30 transition-all duration-300 group hover:transform hover:scale-105`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <stat.icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 text-xs font-medium bg-green-900/20 px-2 py-1 rounded-full border border-green-500/20">
                      {stat.change}
                    </div>
                  </div>
                </div>
                <h3 className="text-3xl font-black text-white mb-2">{stat.value}</h3>
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                
                {/* Decorative gradient */}
                <div className="absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br from-blue-600/10 to-transparent rounded-full" />
              </div>
            ))}
          </div>
        </section>

        {/* Enhanced Navigation Tabs */}
        <section className="mb-16">
          <div className="bg-[#272e45] p-2 rounded-3xl border border-gray-700/50 backdrop-blur-sm">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'analysis', label: 'Game Analysis', icon: Brain },
                { id: 'lessons', label: 'Lessons', icon: BookOpen },
                { id: 'achievements', label: 'Achievements', icon: Award }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-600/20 transform scale-[1.02]'
                      : 'text-gray-400 hover:text-white hover:bg-[#374162]/80'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-semibold">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Upload,
                  title: 'Analyze Your Game',
                  description: 'Upload PGN files for instant AI analysis with move suggestions and insights',
                  action: 'Upload Game'
                },
                {
                  icon: Target,
                  title: 'Daily Puzzle',
                  description: 'Solve personalized puzzles tailored to your skill level and weaknesses',
                  action: 'Solve Puzzle'
                },
                {
                  icon: BookOpen,
                  title: 'Study Plan',
                  description: 'Follow your AI-generated study plan based on your playing style',
                  action: 'Continue Learning'
                }
              ].map((action, index) => (
                <div key={index} className="group cursor-pointer">
                  <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/30 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <action.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{action.title}</h3>
                    <p className="text-gray-400 text-sm mb-6 leading-relaxed">{action.description}</p>
                    <button className="flex items-center gap-2 text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                      {action.action}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Strengths */}
              <div className="bg-[#272e45] rounded-2xl p-8 border border-green-700/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Your Strengths</h3>
                    <p className="text-green-400 text-sm">AI-identified strong areas</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[
                    'Excellent tactical awareness',
                    'Strong endgame technique', 
                    'Good opening preparation',
                    'Effective time management'
                  ].map((strength, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-green-900/20 rounded-xl border border-green-700/30">
                      <Award className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-white">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Focus Areas */}
              <div className="bg-[#272e45] rounded-2xl p-8 border border-blue-700/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Focus Areas</h3>
                    <p className="text-blue-400 text-sm">Recommended improvements</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {[
                    { area: 'Positional understanding', progress: 65 },
                    { area: 'Pattern recognition', progress: 45 },
                    { area: 'Complex calculation', progress: 30 },
                    { area: 'Opening theory depth', progress: 55 }
                  ].map((item, index) => (
                    <div key={index} className="p-4 bg-blue-900/20 rounded-xl border border-blue-700/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{item.area}</span>
                        <span className="text-blue-400 text-sm">{item.progress}%</span>
                      </div>
                      <div className="w-full bg-[#374162] rounded-full h-2">
                        <div
                          className="h-2 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Recent Learning Activity</h2>
              <p className="text-gray-400">Your progress over the last 7 days</p>
            </div>
            <button className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2">
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                type: 'Game Analysis', 
                title: 'Sicilian Defense Study', 
                time: '45 minutes', 
                date: 'Today', 
                icon: Brain
              },
              { 
                type: 'Puzzle Session', 
                title: 'Tactical Patterns #3', 
                time: '25 minutes', 
                date: 'Yesterday', 
                icon: Target
              },
              { 
                type: 'Lesson', 
                title: 'Endgame Principles', 
                time: '30 minutes', 
                date: '2 days ago', 
                icon: BookOpen
              }
            ].map((activity, index) => (
              <div
                key={index}
                className="bg-[#272e45] rounded-xl p-6 border border-[#374162] hover:border-[#4a5568] transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <activity.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs text-gray-400 bg-[#374162] px-2 py-1 rounded-full">
                    {activity.date}
                  </span>
                </div>
                
                <div className="mb-3">
                  <p className="text-blue-400 text-sm font-medium mb-1">{activity.type}</p>
                  <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                    {activity.title}
                  </h3>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    {activity.time}
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-3xl p-12 border border-blue-700/30">
            <div className="max-w-3xl mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Accelerate Your Chess Growth?
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Join thousands of players who've improved their game with our AI-powered learning system. 
                Get personalized coaching, detailed analysis, and structured learning paths.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl flex items-center justify-center gap-2 transform hover:scale-105 transition-all duration-300">
                  <Gift className="w-5 h-5" />
                  Start Free Trial
                </button>
                
                <button className="border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105">
                  <Eye className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Learn
