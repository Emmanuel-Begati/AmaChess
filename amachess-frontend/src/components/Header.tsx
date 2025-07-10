import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  // Check if current path matches the given path
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <header className="bg-[#1a1f2e] border-b border-[#374162]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <span className="text-white font-bold text-xl sm:text-2xl">AmaChess</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-4">
            <Link
              to="/dashboard"
              className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium ${
                isActive('/dashboard')
                  ? 'bg-[#115fd4] text-white'
                  : 'text-[#97a1c4] hover:bg-[#272e45] hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/learn"
              className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium ${
                isActive('/learn')
                  ? 'bg-[#115fd4] text-white'
                  : 'text-[#97a1c4] hover:bg-[#272e45] hover:text-white'
              }`}
            >
              Learn
            </Link>
            <Link
              to="/puzzles"
              className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium ${
                isActive('/puzzles')
                  ? 'bg-[#115fd4] text-white'
                  : 'text-[#97a1c4] hover:bg-[#272e45] hover:text-white'
              }`}
            >
              Puzzles
            </Link>
            <Link
              to="/library"
              className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium ${
                isActive('/library')
                  ? 'bg-[#115fd4] text-white'
                  : 'text-[#97a1c4] hover:bg-[#272e45] hover:text-white'
              }`}
            >
              Library
            </Link>
            <Link
              to="/contact"
              className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium ${
                isActive('/contact')
                  ? 'bg-[#115fd4] text-white'
                  : 'text-[#97a1c4] hover:bg-[#272e45] hover:text-white'
              }`}
            >
              Contact
            </Link>
          </nav>
          
          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center max-w-xs text-sm rounded-full focus:outline-none"
                    id="user-menu-button"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-[#115fd4] flex items-center justify-center text-white">
                      {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                    <span className="ml-2 text-white truncate max-w-[100px]">
                      {user.name || user.email?.split('@')[0]}
                    </span>
                    <svg
                      className={`ml-1 h-4 w-4 text-white transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {profileMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-[#1a1f2e] ring-1 ring-black ring-opacity-5 z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                    tabIndex="-1"
                  >
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-sm text-[#97a1c4] hover:bg-[#272e45] hover:text-white"
                      role="menuitem"
                      tabIndex="-1"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-[#97a1c4] hover:bg-[#272e45] hover:text-white"
                      role="menuitem"
                      tabIndex="-1"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#272e45] hover:bg-[#374162] rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#115fd4] hover:bg-blue-700 rounded-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#97a1c4] hover:text-white hover:bg-[#272e45] focus:outline-none"
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1a1f2e] border-t border-[#374162]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/dashboard')
                  ? 'bg-[#115fd4] text-white'
                  : 'text-[#97a1c4] hover:bg-[#272e45] hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/learn"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/learn')
                  ? 'bg-[#115fd4] text-white'
                  : 'text-[#97a1c4] hover:bg-[#272e45] hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Learn
            </Link>
            <Link
              to="/puzzles"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/puzzles')
                  ? 'bg-[#115fd4] text-white'
                  : 'text-[#97a1c4] hover:bg-[#272e45] hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Puzzles
            </Link>
            <Link
              to="/library"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/library')
                  ? 'bg-[#115fd4] text-white'
                  : 'text-[#97a1c4] hover:bg-[#272e45] hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Library
            </Link>
            <Link
              to="/contact"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/contact')
                  ? 'bg-[#115fd4] text-white'
                  : 'text-[#97a1c4] hover:bg-[#272e45] hover:text-white'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
          
          {/* Mobile User Section */}
          <div className="pt-4 pb-3 border-t border-[#374162]">
            {user ? (
              <>
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-[#115fd4] flex items-center justify-center text-white">
                      {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{user.name || user.email?.split('@')[0]}</div>
                    <div className="text-sm font-medium text-[#97a1c4]">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    to="/settings"
                    className="block px-3 py-2 rounded-md text-base font-medium text-[#97a1c4] hover:bg-[#272e45] hover:text-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-[#97a1c4] hover:bg-[#272e45] hover:text-white"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="px-2 space-y-1">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-[#272e45] hover:bg-[#374162]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-[#115fd4] hover:bg-blue-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;