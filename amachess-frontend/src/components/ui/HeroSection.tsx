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
        <div className="absolute top-10 left-4 sm:top-20 sm:left-10 w-48 h-48 sm:w-72 sm:h-72 bg-[#115fd4]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-4 sm:bottom-20 sm:right-10 w-64 h-64 sm:w-96 sm:h-96 bg-[#4a90e2]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8 pt-20">
        <div className="text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full bg-[#115fd4]/10 border border-[#115fd4]/20">
            <span className="text-[#4a90e2] text-sm font-medium tracking-wide uppercase">New: Interactive PDF Reader</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6 sm:mb-8 tracking-tight">
            <span className="block text-white mb-2">
              Master Chess Through
            </span>
            <span className="block bg-gradient-to-r from-[#115fd4] via-[#4a90e2] to-[#115fd4] bg-clip-text text-transparent bg-300% animate-gradient">
              Interactive Learning
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-[#94a3b8] mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
            Transform your static PDF books into playable lessons. Analyze your Lichess games with AI. Train smarter, not harder.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 sm:mb-20 px-4 sm:px-0">
            <button className="group relative w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-[#115fd4] text-white text-lg font-bold rounded-xl hover:shadow-2xl hover:shadow-[#115fd4]/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <span className="relative z-10">Start Training for Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-[#115fd4] to-[#2563eb] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>

            <button className="group w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-[#1e293b]/50 backdrop-blur-md text-white text-lg font-bold rounded-xl border border-[#334155] hover:border-[#115fd4]/50 hover:bg-[#1e293b] transition-all duration-300 hover:-translate-y-1">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch Demo
              </span>
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-4 sm:px-0">
            <div className="bg-[#1e293b]/40 backdrop-blur-sm rounded-2xl p-6 border border-[#334155]/50 hover:border-[#115fd4]/30 transition-all duration-300 group hover:bg-[#1e293b]/60">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:bg-blue-500/20 transition-colors">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Smart Library</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">Import PDF chess books and click any diagram to play it out on the board instantly.</p>
            </div>

            <div className="bg-[#1e293b]/40 backdrop-blur-sm rounded-2xl p-6 border border-[#334155]/50 hover:border-[#115fd4]/30 transition-all duration-300 group hover:bg-[#1e293b]/60">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:bg-purple-500/20 transition-colors">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Coach</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">Get personalized move explanations and mistake analysis from our advanced AI engine.</p>
            </div>

            <div className="bg-[#1e293b]/40 backdrop-blur-sm rounded-2xl p-6 border border-[#334155]/50 hover:border-[#115fd4]/30 transition-all duration-300 group hover:bg-[#1e293b]/60">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:bg-green-500/20 transition-colors">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Lichess Sync</h3>
              <p className="text-[#94a3b8] text-sm leading-relaxed">Automatically sync your games and get tailored puzzles based on your weaknesses.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
        <div className="animate-bounce p-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
          <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
