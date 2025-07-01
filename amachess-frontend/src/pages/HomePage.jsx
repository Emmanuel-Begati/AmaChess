import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import FeatureCard from '../components/FeatureCard';
import Testimonial from '../components/Testimonial';
import Footer from '../components/Footer';

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

  const testimonials = [
    {
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDq3PBITPPc-s_utNnKQAAXCJA9K0vFPH7nRDkQuIEE3Lo2dfEPF5gXNycpz24TA2rQ-VgtGGvHxZpwL2pf-9U4cKMp2sQhXMFsDEXug2bu5Ucgb9xztJIMEGF_Ox4eUHY8WGj6QNnupJCXM7OOAjZzSD0sFE7bniDztkNDRQEwRSYSAPmClrjDG5PA_qWlPwluVbfgcLF6sC5lE3T53I6BslENf8x1WewFjeg8nEuhDjPOdeAPhHNQMWBNKq_cDR3UQnh0qnbFvm8",
      name: "Aisha Diallo",
      date: "2023-11-15",
      rating: 5,
      review: "AmaChess has transformed my game! The AI tutor is incredibly insightful, and the refined design is both beautiful and motivating.",
      likes: 25,
      dislikes: 2
    },
    {
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAZV9VyZjPMaiIGL5mRMUXSfCdh8GCRN2gBH4LND6nzuTX3tl5Hc0MJdMxZz9zbq0dSWJgoRF1UKTjUf-0v-bSB-rsZ2iYJH0A7q9Bl0VrZhJZBF2Le8LU-_ddezI0Fa1Kbkrx-7jUK47IJYtyXCe_NH7arlsVVT3yGr04GNfkFkGHplbetze_ozDPnj97qB8OtB8nR6JLTqkT6X3zAzPrYf5Vlo6M2iiMEMAymhw9UPF1e0UvzagjN-gcVTXdMTAJlUWLrX1g4vag",
      name: "Kwame Mensah",
      date: "2023-12-20",
      rating: 5,
      review: "I love the progress tracking feature. It's so rewarding to see my improvement over time. The community is also very supportive.",
      likes: 30,
      dislikes: 1
    },
    {
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDUVBuJji4HeuowrIgDv0G5WuJfW4mC1CR7ld1h3ZoX9OIHwZz83F9oq1IegD6UAfIxLbGGSsOKVLeovBme5OwmSmwQd6p_-abKy-BzM3pNUoOmckoeeHQ4PXa_NZXMwVVyUgnGpnaB9yU7nQ5UZTIQbNQT5dPZNrA1gxkwwiwJnr34drszPceKCc_3DKIJvFs_Fqh3aLFU822EzUpMaAsULdFGmniFv-VxvcjjeDVb9njBu2_0kC9TB0AXrCS3JjQLifOSWpZ-7l8",
      name: "Fatima Hassan",
      date: "2024-01-10",
      rating: 4,
      review: "Great platform for learning chess. The AI tutor is helpful, but I wish there were more advanced tutorials available.",
      likes: 15,
      dislikes: 3
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#111822] via-[#0f1419] to-[#111822] text-white">
      <div className="w-full">
        <Header />
        
        <main className="w-full">
          <HeroSection />
          
          {/* Key Features Section */}
          <section className="w-full py-16 lg:py-24 bg-gradient-to-r from-[#0f1419] to-[#111822]">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-[#92a8c9] bg-clip-text text-transparent">
                  Unlock Your Chess Potential
                </h2>
                <p className="text-lg md:text-xl text-[#92a8c9] max-w-3xl mx-auto leading-relaxed">
                  Explore our innovative features designed to enhance your chess skills and understanding with cutting-edge AI technology.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
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
          <section className="w-full py-16 bg-[#111822]">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                Trusted by Chess Enthusiasts Worldwide
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-8 text-center shadow-xl border border-[#233248]/50 hover:border-[#115fd4]/30 transition-all duration-300 hover:transform hover:scale-105">
                  <p className="text-[#92a8c9] text-base font-medium mb-2">Active Users</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-[#115fd4] to-[#4a90e2] bg-clip-text text-transparent">150,000+</p>
                </div>
                <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-8 text-center shadow-xl border border-[#233248]/50 hover:border-[#115fd4]/30 transition-all duration-300 hover:transform hover:scale-105">
                  <p className="text-[#92a8c9] text-base font-medium mb-2">Games Analyzed</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-[#115fd4] to-[#4a90e2] bg-clip-text text-transparent">2.5M+</p>
                </div>
                <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-8 text-center shadow-xl border border-[#233248]/50 hover:border-[#115fd4]/30 transition-all duration-300 hover:transform hover:scale-105">
                  <p className="text-[#92a8c9] text-base font-medium mb-2">Books Available</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-[#115fd4] to-[#4a90e2] bg-clip-text text-transparent">500+</p>
                </div>
                <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-8 text-center shadow-xl border border-[#233248]/50 hover:border-[#115fd4]/30 transition-all duration-300 hover:transform hover:scale-105">
                  <p className="text-[#92a8c9] text-base font-medium mb-2">Countries</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-[#115fd4] to-[#4a90e2] bg-clip-text text-transparent">120+</p>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="w-full py-16 lg:py-24 bg-gradient-to-r from-[#0f1419] to-[#111822]">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">What Our Users Say</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {testimonials.map((testimonial, index) => (
                  <Testimonial
                    key={index}
                    avatar={testimonial.avatar}
                    name={testimonial.name}
                    date={testimonial.date}
                    rating={testimonial.rating}
                    review={testimonial.review}
                    likes={testimonial.likes}
                    dislikes={testimonial.dislikes}
                  />
                ))}
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
