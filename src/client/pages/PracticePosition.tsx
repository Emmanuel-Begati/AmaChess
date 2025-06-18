import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Play, Target } from 'lucide-react'

const PracticePosition: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#121621] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Practice Position</h1>
          <p className="text-gray-400 text-lg">
            Practice specific chess positions to improve your understanding and tactical skills.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chess Board Area */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#272e45] rounded-xl p-6"
          >
            <h2 className="text-xl font-bold text-white mb-4">Interactive Chess Board</h2>
            <div className="aspect-square bg-[#374162] rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Chess board component will be integrated here</p>
            </div>
          </motion.div>

          {/* Practice Options */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-[#272e45] rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Practice Options</h2>
              <div className="space-y-4">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg flex items-center gap-3 transition-colors">
                  <Target className="w-5 h-5" />
                  <span>Load Random Position</span>
                </button>
                <button className="w-full bg-[#374162] hover:bg-[#4a5568] text-white p-4 rounded-lg flex items-center gap-3 transition-colors">
                  <BookOpen className="w-5 h-5" />
                  <span>Practice from Book</span>
                </button>
                <button className="w-full bg-[#374162] hover:bg-[#4a5568] text-white p-4 rounded-lg flex items-center gap-3 transition-colors">
                  <Play className="w-5 h-5" />
                  <span>Analyze Game Position</span>
                </button>
              </div>
            </div>

            <div className="bg-[#272e45] rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Position Analysis</h3>
              <div className="space-y-3 text-gray-300">
                <p>Material: Equal</p>
                <p>Evaluation: +0.2 (Slight advantage for White)</p>
                <p>Best move: Nf3</p>
                <p>Key themes: King safety, piece development</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default PracticePosition
