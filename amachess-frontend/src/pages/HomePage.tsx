import React from 'react';
import Header from '../components/ui/Header';
import HeroSection from '../components/ui/HeroSection';
import FeatureCard from '../components/ui/FeatureCard';
import Footer from '../components/ui/Footer';

const HomePage = () => {
  const features = [
    {
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAjVknoFFx2nfYG6aAOxZzO0IJsn-9XtQXg86Qd53YPYeeP7AMAHzjO3Lnt7tuiw1qZJ09O0aaav1IU5TRI8jU7x0c0xRB-RL8mw9Pkd2_RWYPOsMU2itC5vEL2g54S8HS28GKcwE7ptQKH5XcZhFvjTuNNyYCmESovAwaGakb2jJ2jFyPeLKMXQVN0fQtAxQM11XLE2jnUg2KXnl5gxmYGeRpzFF8kWYScMryxUqUIgt-93mSXHoX4J-StOyYpbp1As0et687AggU",
      title: "AI-Powered Tutor",
      description: "Engage with our AI tutor for personalized feedback and guidance. Practice against AI opponents with adaptive difficulty levels."
    },
    {
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBUBo2_EnKBe_J7u24P4tVdFbInmtZ6IWcGIseceLS4QJE-G_fiGgbKw4WWEtDjHF30_hJ3df9AXy9bFvhX9PB3-Gsew9-51aCZhcp0lrzaOmI7ThHs6vZbV5FnYYujUaAsriwMOlfxSYvGUCWl30ubevo0QGxFjs8ZdIcUB9c9JJa-wqUSJyvQNclgSbw2ovuLy3r7Dojkq3DAOsyqgxDGifin3xYA1TqpFi0GiqHoWm61Lhxs0De8uPdNBIzNSH-phUcGtmqgsyc",
      title: "Progress Tracking",
      description: "Visualize your learning journey with detailed progress reports and performance analytics. Track your improvement over time and identify areas for growth."
    },
    {
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZ5dT-EoWNY467IchqFvdXorOt_Xm8PNsOMPt1nT1DevKzGNsLueSJAzO5F0YP1X-BntvoXgJogdEUBgzIiRLiSDDowV1S1Ts_1_6fZiZ-iBBB7uWF1yUzscvrM4bgTq4-nEY_90uT2tErCzp5XCSbKdASs30DacbQD85bqbjTG1d4TI_qfj_gxWyfMSQL4Dwq1noZ-kQqyU9tCnZ54Elq3qpikr-eVDIgEI4YrItXMrHa7meu05jcvUEMGt0qBCJtOa3wnsJlN2g",
      title: "Enhanced Book Reading",
      description: "Dive deeper into chess literature with our enhanced book reading feature. Analyze positions, play out variations, and integrate learning directly into your practice."
    }
  ];

  const benefits = [
    {
      icon: "🎯",
      title: "Accelerated Learning",
      description: "Learn chess faster with AI-guided lessons tailored to your skill level and learning pace."
    },
    {
      icon: "📈",
      title: "Measurable Progress",
      description: "Track your improvement with detailed analytics and see your rating climb over time."
    },
    {
      icon: "🤖",
      title: "24/7 AI Coach",
      description: "Get instant feedback and coaching from our advanced AI tutor anytime, anywhere."
    },
    {
      icon: "📚",
      title: "Comprehensive Library",
      description: "Read chess books in a more fun and engaging way, with interactive positions that set up automatically - no manual board arrangement needed."
    },
    {
      icon: "🌍",
      title: "Global Community",
      description: "Connect with chess players worldwide and participate in tournaments and discussions."
    },
    {
      icon: "🏆",
      title: "Achievement System",
      description: "Stay motivated with badges, achievements, and milestone celebrations as you progress."
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#111822] via-[#0f1419] to-[#111822] text-white">
      <div className="w-full">
        <Header />
        
        <main className="w-full">
          <HeroSection />
          
          {/* Benefits Section */}
          <section className="w-full py-12 sm:py-16 lg:py-24 bg-[#111822]">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-[#92a8c9] bg-clip-text text-transparent">
                  Why Choose AmaChess?
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-[#92a8c9] max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                  Join thousands of players who have transformed their chess game with our innovative platform.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
                {benefits.map((benefit, index) => (
                  <div key={index} className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-4 sm:p-6 text-center shadow-xl border border-[#233248]/50 hover:border-[#115fd4]/30 transition-all duration-300 hover:transform hover:scale-105">
                    <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">{benefit.icon}</div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3">{benefit.title}</h3>
                    <p className="text-[#92a8c9] leading-relaxed text-sm sm:text-base">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          {/* Key Features Section */}
          <section className="w-full py-12 sm:py-16 lg:py-24 bg-gradient-to-r from-[#0f1419] to-[#111822]">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-[#92a8c9] bg-clip-text text-transparent">
                  Our Core Services
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-[#92a8c9] max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                  Explore our innovative features designed to enhance your chess skills and understanding with cutting-edge AI technology.
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 max-w-7xl mx-auto">
                {features.map((feature, index) => (
                  <FeatureCard
                    key={index}
                    image={feature.image}
                    title={feature.title}
                    description={feature.description}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Stats Section */}
          <section className="w-full py-12 sm:py-16 bg-[#111822]">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 sm:mb-12">
                Trusted by Chess Enthusiasts Worldwide
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto">
                <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-4 sm:p-6 lg:p-8 text-center shadow-xl border border-[#233248]/50 hover:border-[#115fd4]/30 transition-all duration-300 hover:transform hover:scale-105">
                  <p className="text-[#92a8c9] text-sm sm:text-base font-medium mb-2">Active Users</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#115fd4] to-[#4a90e2] bg-clip-text text-transparent">150,000+</p>
                </div>
                <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-4 sm:p-6 lg:p-8 text-center shadow-xl border border-[#233248]/50 hover:border-[#115fd4]/30 transition-all duration-300 hover:transform hover:scale-105">
                  <p className="text-[#92a8c9] text-sm sm:text-base font-medium mb-2">Games Analyzed</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#115fd4] to-[#4a90e2] bg-clip-text text-transparent">2.5M+</p>
                </div>
                <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-4 sm:p-6 lg:p-8 text-center shadow-xl border border-[#233248]/50 hover:border-[#115fd4]/30 transition-all duration-300 hover:transform hover:scale-105">
                  <p className="text-[#92a8c9] text-sm sm:text-base font-medium mb-2">Books Available</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#115fd4] to-[#4a90e2] bg-clip-text text-transparent">500+</p>
                </div>
                <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-4 sm:p-6 lg:p-8 text-center shadow-xl border border-[#233248]/50 hover:border-[#115fd4]/30 transition-all duration-300 hover:transform hover:scale-105">
                  <p className="text-[#92a8c9] text-sm sm:text-base font-medium mb-2">Countries</p>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#115fd4] to-[#4a90e2] bg-clip-text text-transparent">120+</p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action Section */}
          <section className="w-full py-12 sm:py-16 lg:py-24 bg-gradient-to-r from-[#0f1419] to-[#111822]">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white to-[#92a8c9] bg-clip-text text-transparent">
                  Ready to Master Chess?
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-[#92a8c9] mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
                  Join AmaChess today and start your journey to becoming a better chess player with AI-powered learning and analysis.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4 sm:px-0">
                  <button className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#115fd4] to-[#4a90e2] text-white text-lg font-bold rounded-xl hover:shadow-2xl hover:shadow-[#115fd4]/30 transition-all duration-300 hover:scale-105 overflow-hidden">
                    <span className="relative z-10">Start Your Free Trial</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#4a90e2] to-[#115fd4] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                  
                  <button className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm text-white text-lg font-bold rounded-xl border border-white/20 hover:border-[#115fd4]/50 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Learn More
                    </span>
                  </button>
                </div>
                
                <p className="text-sm text-[#92a8c9] mt-4 sm:mt-6 px-4 sm:px-0">
                  No credit card required • 14-day free trial • Cancel anytime
                </p>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
