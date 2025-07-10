import React from 'react';

const FeatureCard = ({ image, title, description }) => {
  return (
    <div className="group bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-2xl overflow-hidden shadow-xl border border-[#233248]/50 hover:border-[#115fd4]/30 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-[#115fd4]/10">
      <div className="relative overflow-hidden">
        <div
          className="w-full h-56 bg-center bg-no-repeat bg-cover transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url("${image}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#4a90e2] transition-colors duration-300">
          {title}
        </h3>
        <p className="text-[#92a8c9] leading-relaxed group-hover:text-white/90 transition-colors duration-300">
          {description}
        </p>
        
        {/* Learn more arrow */}
        <div className="mt-4 flex items-center text-[#115fd4] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-2">
          <span className="text-sm font-medium mr-2">Learn more</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;
