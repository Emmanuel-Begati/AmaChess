import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 w-full h-full z-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAq8CQ7YT27TAC82HhpBp2mMgCiBQ8dK4FlGkSaOIJp7MbKvxGxC1DAgiF5k7HpTrrGP78s9LnmuDVXLy39imQkz60QQVzFa9ZOiNm54eNLFQ0vxhx2CwIDyfoaA0XaVgI8Rae1OEXcvNg1_cOqv3b4-tIPzY68qI3o0hus4zxVxFJXrZZsXRqruQIC16TG_EnE9o5VIUnJxjT6bmxEbVSHgKXjWV3ZoPO8RDeJbi--rmWsU4gQ4eWqXs4lOtpDtDWYfAUlst3swp8")`
          }}
        />
        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-black/60 via-black/40 to-[#111822]/90" />
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 w-full h-full z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#115fd4]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#4a90e2]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
            <span className="block bg-gradient-to-r from-white via-white to-[#92a8c9] bg-clip-text text-transparent">
              Elevate Your Chess Game
            </span>
            <span className="block bg-gradient-to-r from-[#115fd4] to-[#4a90e2] bg-clip-text text-transparent">
              with AI-Powered Learning
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[#92a8c9] mb-12 max-w-3xl mx-auto leading-relaxed">
            AmaChess combines advanced AI analysis with a refined interface to provide a unique and effective chess learning experience for players of all levels.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button className="group relative px-8 py-4 bg-gradient-to-r from-[#115fd4] to-[#4a90e2] text-white text-lg font-bold rounded-xl hover:shadow-2xl hover:shadow-[#115fd4]/30 transition-all duration-300 hover:scale-105 overflow-hidden">
              <span className="relative z-10">Start Free Trial</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#4a90e2] to-[#115fd4] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            
            <button className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-bold rounded-xl border border-white/20 hover:border-[#115fd4]/50 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Watch Demo
              </span>
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[#115fd4]/30 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-[#115fd4] to-[#4a90e2] rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Analysis</h3>
              <p className="text-[#92a8c9] text-sm">Get instant feedback on your games with advanced AI analysis</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[#115fd4]/30 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-[#115fd4] to-[#4a90e2] rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Interactive Learning</h3>
              <p className="text-[#92a8c9] text-sm">Learn from interactive chess books and tutorials</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-[#115fd4]/30 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-[#115fd4] to-[#4a90e2] rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Progress Tracking</h3>
              <p className="text-[#92a8c9] text-sm">Track your improvement with detailed analytics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="animate-bounce">
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
