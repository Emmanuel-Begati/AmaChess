import React from 'react';

const Testimonial = ({ avatar, name, date, rating, review, likes, dislikes }) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-[#115fd4]' : 'text-gray-600'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-2xl p-6 shadow-xl border border-[#233248]/50 hover:border-[#115fd4]/30 transition-all duration-300 hover:transform hover:scale-105">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-12 h-12 bg-center bg-no-repeat bg-cover rounded-full ring-2 ring-[#115fd4]/30"
          style={{ backgroundImage: `url("${avatar}")` }}
        />
        <div className="flex-1">
          <h4 className="text-white font-semibold text-lg">{name}</h4>
          <p className="text-[#92a8c9] text-sm">{date}</p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-4">
        {renderStars(rating)}
      </div>

      {/* Review */}
      <p className="text-white/90 leading-relaxed mb-6 text-base">
        "{review}"
      </p>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[#233248]">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-[#92a8c9] hover:text-[#115fd4] transition-colors duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span className="text-sm font-medium">{likes}</span>
          </button>
          
          <button className="flex items-center gap-2 text-[#92a8c9] hover:text-red-400 transition-colors duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
            <span className="text-sm font-medium">{dislikes}</span>
          </button>
        </div>
        
        <button className="text-[#115fd4] hover:text-[#4a90e2] transition-colors duration-200 text-sm font-medium">
          Reply
        </button>
      </div>
    </div>
  );
};

export default Testimonial;
