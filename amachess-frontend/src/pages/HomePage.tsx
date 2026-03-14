import React from 'react';
import Header from '../components/ui/Header';
import HeroSection from '../components/ui/HeroSection';
import Footer from '../components/ui/Footer';

const HomePage = () => {
  const features = [
    {
      title: "Interactive Books",
      description: "Don't just read—play. Click any diagram in your PDF chess books to open it on a board instantly.",
      icon: "📚",
      color: "from-blue-500 to-cyan-400"
    },
    {
      title: "AI Analysis",
      description: "Understand your mistakes. Our AI feedback explains 'why' a move is bad in plain English.",
      icon: "🤖",
      color: "from-violet-500 to-fuchsia-400"
    },
    {
      title: "Lichess Integration",
      description: "Seamlessly import your games. We analyze your play style and generate custom puzzles.",
      icon: "⚔️",
      color: "from-emerald-500 to-teal-400"
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#0a0f1c] text-white selection:bg-[#115fd4] selection:text-white">
      <Header />

      <main className="w-full pt-16 sm:pt-20">
        <HeroSection />

        {/* Core Features Grid */}
        <section className="relative w-full py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1c] via-[#111827] to-[#0a0f1c]" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 sm:mb-20">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
                <span className="bg-gradient-to-r from-white to-[#94a3b8] bg-clip-text text-transparent">
                  Train Like a Grandmaster
                </span>
              </h2>
              <p className="text-lg text-[#94a3b8] max-w-2xl mx-auto">
                Stop passively watching videos. AmaChess turns every resource into an active training session.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group relative p-8 rounded-3xl bg-[#1e293b]/20 border border-[#334155]/50 hover:bg-[#1e293b]/40 transition-all duration-300 hover:-translate-y-1">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`} />
                  <div className="relative z-10">
                    <div className="text-4xl mb-6">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-[#94a3b8] leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Preview Section */}
        <section className="relative w-full py-20 lg:py-32 bg-[#0d121f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  <span className="text-white">Your Books, Now </span>
                  <span className="text-[#4a90e2]">Fully Playable</span>
                </h2>
                <p className="text-lg text-[#94a3b8] mb-8 leading-relaxed">
                  No more setting up physical boards. Upload any PDF/EPUB, and AmaChess automatically detects chess diagrams, turning them into interactive puzzles you can solve right on the page.
                </p>

                <ul className="space-y-4 mb-8">
                  {[
                    "Auto-detects FEN strings and diagrams",
                    "Integrated Stockfish 16 analysis",
                    "Save positions to your personal library"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center text-[#cbd5e1]">
                      <svg className="w-5 h-5 text-[#115fd4] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <button className="px-8 py-4 bg-white text-[#0f172a] font-bold rounded-xl hover:bg-gray-100 transition-colors">
                  Try It Yourself
                </button>
              </div>

              {/* Window/App Preview Mockup */}
              <div className="relative rounded-2xl bg-[#1e293b] border border-[#334155] shadow-2xl overflow-hidden aspect-[4/3] group">
                <div className="absolute top-0 w-full h-10 bg-[#0f172a] border-b border-[#334155] flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                {/* Abstract representation of the app interface */}
                <div className="p-8 mt-4 grid grid-cols-2 gap-8 h-full opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="space-y-4">
                    {/* Fake Text Lines */}
                    <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-700/50 rounded w-full"></div>
                    <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-700/50 rounded w-full"></div>

                    {/* Highlighted Diagram Area */}
                    <div className="mt-8 p-4 bg-[#115fd4]/10 border border-[#115fd4]/30 rounded-lg">
                      <div className="h-32 bg-slate-800/80 rounded flex items-center justify-center text-slate-500">
                        Chess Diagram
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0f172a] rounded-xl border border-[#334155] p-4 flex items-center justify-center">
                    <div className="w-full aspect-square bg-[#1e293b] rounded grid grid-cols-8 grid-rows-8 gap-0.5 border border-slate-700">
                      {/* Simple Grid Board */}
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div key={i} className={`${(Math.floor(i / 8) + i) % 2 === 0 ? 'bg-[#334155]' : 'bg-[#1e293b]'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats / Trust Section */}
        <section className="py-20 bg-[#0a0f1c]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: "Active Players", value: "10k+", color: "text-blue-400" },
                { label: "Puzzles Solved", value: "2.5M", color: "text-purple-400" },
                { label: "Books Parsed", value: "500+", color: "text-green-400" },
                { label: "Countries", value: "85", color: "text-orange-400" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-6 rounded-2xl bg-[#111827]/50 border border-[#1f2937]">
                  <div className={`text-4xl font-bold mb-2 ${stat.color}`}>{stat.value}</div>
                  <div className="text-[#64748b] text-sm uppercase tracking-wider font-semibold">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#115fd4]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0f1c] to-[#1e293b] opacity-90" />

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Start Your Journey Today
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join the community of chess improvers who have switched to smarter training methods.
            </p>
            <button className="px-10 py-5 bg-white text-[#115fd4] text-lg font-bold rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
              Create Free Account
            </button>
            <p className="mt-6 text-blue-200/60 text-sm">
              No credit card required for basic plan.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
