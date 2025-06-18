import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Eye, Bookmark, Share } from 'lucide-react'

const BookReading: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#121621] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Interactive Book Reading</h1>
          <p className="text-gray-400 text-lg">
            Experience chess literature like never before with interactive analysis and position practice.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-[#272e45] rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Chapter 3: Opening Principles</h2>
                <p className="text-gray-400">My System by Aron Nimzowitsch</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 bg-[#374162] hover:bg-[#4a5568] rounded-lg transition-colors">
                  <Bookmark className="w-5 h-5 text-gray-400" />
                </button>
                <button className="p-2 bg-[#374162] hover:bg-[#4a5568] rounded-lg transition-colors">
                  <Share className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed mb-4">
                The opening is the foundation upon which the entire game is built. Understanding the fundamental principles 
                will guide your play in the critical first phase of the game.
              </p>
              
              <h3 className="text-white text-lg font-semibold mb-3">1. Control the Center</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                The center squares (e4, e5, d4, d5) are the most important squares on the board. Pieces placed in the center 
                have maximum mobility and influence over the game.
              </p>

              <div className="bg-[#374162] p-4 rounded-lg mb-4">
                <p className="text-blue-400 font-medium mb-2">💡 Interactive Note</p>
                <p className="text-gray-300 text-sm">
                  Click on the position diagram to practice this concept with the interactive board.
                </p>
              </div>

              <h3 className="text-white text-lg font-semibold mb-3">2. Develop Your Pieces</h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Bring your pieces into active positions where they can contribute to your plan. Knights before bishops 
                is a general rule, as knights have fewer good squares to choose from.
              </p>
            </div>

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#374162]">
              <button className="bg-[#374162] hover:bg-[#4a5568] text-white px-4 py-2 rounded-lg transition-colors">
                Previous Page
              </button>
              <span className="text-gray-400">Page 42 of 180</span>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Next Page
              </button>
            </div>
          </motion.div>

          {/* Interactive Tools */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Position Diagram */}
            <div className="bg-[#272e45] rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-400" />
                Position Diagram
              </h3>
              <div className="aspect-square bg-[#374162] rounded-lg flex items-center justify-center mb-4">
                <p className="text-gray-400 text-center">
                  Interactive chess board<br />
                  will be displayed here
                </p>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors">
                Practice This Position
              </button>
            </div>

            {/* Table of Contents */}
            <div className="bg-[#272e45] rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Table of Contents
              </h3>
              <nav className="space-y-2">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Ch 1: The Center
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Ch 2: Development
                </a>
                <a href="#" className="block text-blue-400 font-medium">
                  Ch 3: Opening Principles ←
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Ch 4: Pawn Chains
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Ch 5: Piece Coordination
                </a>
              </nav>
            </div>

            {/* Reading Progress */}
            <div className="bg-[#272e45] rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Reading Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Overall Progress</span>
                  <span className="text-white">23%</span>
                </div>
                <div className="w-full bg-[#374162] rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
                <div className="text-xs text-gray-400 text-center">
                  42 of 180 pages completed
                </div>
              </div>
            </div>

            {/* Study Notes */}
            <div className="bg-[#272e45] rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Your Notes</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-blue-400 font-medium">Page 38</p>
                  <p className="text-gray-300">"Remember: knights before bishops in most openings"</p>
                </div>
                <div className="text-sm">
                  <p className="text-blue-400 font-medium">Page 40</p>
                  <p className="text-gray-300">"Center control is key to good opening play"</p>
                </div>
              </div>
              <button className="w-full mt-4 bg-[#374162] hover:bg-[#4a5568] text-white py-2 rounded-lg text-sm transition-colors">
                Add Note
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default BookReading
