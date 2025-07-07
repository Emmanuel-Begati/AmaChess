import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  // Check if user is logged in (when on dashboard or other protected pages)
  const isLoggedIn = ['/dashboard', '/learn', '/puzzles', '/library', '/settings'].includes(location.pathname) || location.pathname.startsWith('/library/book/');

  return (
    <header className="w-full bg-[#111822]/95 backdrop-blur-sm border-b border-[#233248] sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-[#115fd4] to-[#4a90e2] rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-bold">AmaChess</h2>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {isLoggedIn ? (
              <>
                <Link 
                  className={`text-white/80 hover:text-white text-sm font-medium transition-colors duration-200 hover:underline decoration-[#115fd4] underline-offset-4 ${location.pathname === '/dashboard' ? 'text-white underline decoration-[#115fd4]' : ''}`} 
                  to="/dashboard"
                >
                  Dashboard
                </Link>
                <Link 
                  className={`text-white/80 hover:text-white text-sm font-medium transition-colors duration-200 hover:underline decoration-[#115fd4] underline-offset-4 ${location.pathname === '/learn' ? 'text-white underline decoration-[#115fd4]' : ''}`} 
                  to="/learn"
                >
                  Learn
                </Link>
                <Link 
                  className={`text-white/80 hover:text-white text-sm font-medium transition-colors duration-200 hover:underline decoration-[#115fd4] underline-offset-4 ${location.pathname === '/puzzles' ? 'text-white underline decoration-[#115fd4]' : ''}`} 
                  to="/puzzles"
                >
                  Puzzles
                </Link>
                <Link 
                  className={`text-white/80 hover:text-white text-sm font-medium transition-colors duration-200 hover:underline decoration-[#115fd4] underline-offset-4 ${location.pathname === '/library' ? 'text-white underline decoration-[#115fd4]' : ''}`} 
                  to="/library"
                >
                  Library
                </Link>
                <Link 
                  className={`text-white/80 hover:text-white text-sm font-medium transition-colors duration-200 hover:underline decoration-[#115fd4] underline-offset-4 ${location.pathname === '/settings' ? 'text-white underline decoration-[#115fd4]' : ''}`} 
                  to="/settings"
                >
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200 hover:underline decoration-[#115fd4] underline-offset-4" to="/">
                  Home
                </Link>
                <Link className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200 hover:underline decoration-[#115fd4] underline-offset-4" to="/chess">
                  Play Chess
                </Link>
                <a className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200 hover:underline decoration-[#115fd4] underline-offset-4" href="#about">
                  About
                </a>
                <Link className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200 hover:underline decoration-[#115fd4] underline-offset-4" to="/contact">
                  Contact Us
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#115fd4] to-[#4a90e2] rounded-full bg-cover bg-center"></div>
                <span className="text-white text-sm font-medium">Aisha</span>
              </div>
            ) : (
              <>
                <button className="px-4 py-2 xl:px-6 xl:py-2.5 bg-gradient-to-r from-[#115fd4] to-[#4a90e2] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#115fd4]/25 transition-all duration-300 hover:scale-105 text-sm">
                  Start Free Trial
                </button>
                <Link to="/dashboard" className="px-4 py-2 xl:px-6 xl:py-2.5 bg-[#233248] hover:bg-[#2a3b52] text-white font-semibold rounded-lg border border-[#233248] hover:border-[#115fd4]/30 transition-all duration-300 text-sm">
                  Log In
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-[#233248] bg-[#111822] absolute left-0 right-0 top-full shadow-lg">
            <div className="container mx-auto px-4 sm:px-6">
              <nav className="flex flex-col gap-4 mb-6">
                {isLoggedIn ? (
                  <>
                    <Link className="text-white/80 hover:text-white font-medium py-2 px-2 rounded transition-colors" to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                    <Link className="text-white/80 hover:text-white font-medium py-2 px-2 rounded transition-colors" to="/learn" onClick={() => setIsMenuOpen(false)}>Learn</Link>
                    <Link className="text-white/80 hover:text-white font-medium py-2 px-2 rounded transition-colors" to="/puzzles" onClick={() => setIsMenuOpen(false)}>Puzzles</Link>
                    <Link className="text-white/80 hover:text-white font-medium py-2 px-2 rounded transition-colors" to="/library" onClick={() => setIsMenuOpen(false)}>Library</Link>
                    <Link className="text-white/80 hover:text-white font-medium py-2 px-2 rounded transition-colors" to="/settings" onClick={() => setIsMenuOpen(false)}>Settings</Link>
                  </>
                ) : (
                  <>
                    <Link className="text-white/80 hover:text-white font-medium py-2 px-2 rounded transition-colors" to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link className="text-white/80 hover:text-white font-medium py-2 px-2 rounded transition-colors" to="/chess" onClick={() => setIsMenuOpen(false)}>Play Chess</Link>
                    <a className="text-white/80 hover:text-white font-medium py-2 px-2 rounded transition-colors" href="#about" onClick={() => setIsMenuOpen(false)}>About</a>
                    <Link className="text-white/80 hover:text-white font-medium py-2 px-2 rounded transition-colors" to="/contact" onClick={() => setIsMenuOpen(false)}>Contact Us</Link>
                  </>
                )}
              </nav>
              {!isLoggedIn && (
                <div className="flex flex-col gap-3">
                  <button className="w-full py-3 bg-gradient-to-r from-[#115fd4] to-[#4a90e2] text-white font-semibold rounded-lg">
                    Start Free Trial
                  </button>
                  <Link to="/dashboard" className="w-full py-3 bg-[#233248] text-white font-semibold rounded-lg border border-[#233248] text-center" onClick={() => setIsMenuOpen(false)}>
                    Log In
                  </Link>
                </div>
              )}
              {isLoggedIn && (
                <div className="flex items-center gap-3 pt-4 border-t border-[#233248]">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#115fd4] to-[#4a90e2] rounded-full bg-cover bg-center"></div>
                  <span className="text-white text-sm font-medium">Aisha</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;