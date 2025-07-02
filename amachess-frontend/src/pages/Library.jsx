import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Library = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#111822] via-[#0f1419] to-[#111822] text-white">
      <div className="w-full">
        <Header />
        
        <main className="w-full">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">Chess Library</h1>
              <p className="text-[#92a8c9] text-lg">Access our comprehensive collection of chess books and resources.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-6 shadow-xl border border-[#233248]/50">
                <div className="w-full h-32 bg-[#115fd4]/20 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#115fd4]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">My System</h3>
                <p className="text-[#92a8c9] text-sm mb-3">By Aron Nimzowitsch</p>
                <p className="text-[#115fd4] text-xs mb-4">30% Complete</p>
                <button className="w-full px-4 py-2 bg-[#115fd4] hover:bg-[#4a90e2] text-white text-sm font-medium rounded-lg transition-colors duration-200">
                  Continue Reading
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-6 shadow-xl border border-[#233248]/50">
                <div className="w-full h-32 bg-[#115fd4]/20 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#115fd4]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Think Like a Grandmaster</h3>
                <p className="text-[#92a8c9] text-sm mb-3">By Alexander Kotov</p>
                <p className="text-[#92a8c9] text-xs mb-4">Not Started</p>
                <button className="w-full px-4 py-2 bg-[#115fd4] hover:bg-[#4a90e2] text-white text-sm font-medium rounded-lg transition-colors duration-200">
                  Start Reading
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-6 shadow-xl border border-[#233248]/50">
                <div className="w-full h-32 bg-[#115fd4]/20 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#115fd4]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Endgame Strategy</h3>
                <p className="text-[#92a8c9] text-sm mb-3">By Mikhail Shereshevsky</p>
                <p className="text-[#92a8c9] text-xs mb-4">Not Started</p>
                <button className="w-full px-4 py-2 bg-[#115fd4] hover:bg-[#4a90e2] text-white text-sm font-medium rounded-lg transition-colors duration-200">
                  Start Reading
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-6 shadow-xl border border-[#233248]/50">
                <div className="w-full h-32 bg-[#115fd4]/20 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#115fd4]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Opening Repertoire</h3>
                <p className="text-[#92a8c9] text-sm mb-3">By Various Authors</p>
                <p className="text-[#92a8c9] text-xs mb-4">Not Started</p>
                <button className="w-full px-4 py-2 bg-[#115fd4] hover:bg-[#4a90e2] text-white text-sm font-medium rounded-lg transition-colors duration-200">
                  Start Reading
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

export default Library;
