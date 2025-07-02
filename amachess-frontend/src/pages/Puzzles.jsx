import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Puzzles = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#111822] via-[#0f1419] to-[#111822] text-white">
      <div className="w-full">
        <Header />
        
        <main className="w-full">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">Chess Puzzles</h1>
              <p className="text-[#92a8c9] text-lg">Solve tactical puzzles to improve your pattern recognition and calculation skills.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-6 shadow-xl border border-[#233248]/50">
                <h3 className="text-xl font-bold text-white mb-3">Daily Puzzle</h3>
                <p className="text-[#92a8c9] mb-4">New puzzle every day to keep your skills sharp.</p>
                <div className="text-[#115fd4] text-sm mb-4">Difficulty: ★★☆☆☆</div>
                <button className="px-4 py-2 bg-[#115fd4] hover:bg-[#4a90e2] text-white text-sm font-medium rounded-lg transition-colors duration-200">
                  Solve Puzzle
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-6 shadow-xl border border-[#233248]/50">
                <h3 className="text-xl font-bold text-white mb-3">Tactics Training</h3>
                <p className="text-[#92a8c9] mb-4">Practice specific tactical motifs and patterns.</p>
                <div className="text-[#115fd4] text-sm mb-4">Difficulty: ★★★☆☆</div>
                <button className="px-4 py-2 bg-[#115fd4] hover:bg-[#4a90e2] text-white text-sm font-medium rounded-lg transition-colors duration-200">
                  Start Training
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-6 shadow-xl border border-[#233248]/50">
                <h3 className="text-xl font-bold text-white mb-3">Mixed Puzzles</h3>
                <p className="text-[#92a8c9] mb-4">Challenge yourself with varied puzzle types.</p>
                <div className="text-[#115fd4] text-sm mb-4">Difficulty: ★★★★☆</div>
                <button className="px-4 py-2 bg-[#115fd4] hover:bg-[#4a90e2] text-white text-sm font-medium rounded-lg transition-colors duration-200">
                  Start Challenge
                </button>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Puzzles;
