import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, 
  BookOpen, 
  Gamepad2, 
  Target, 
  Library, 
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Crown
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAuth } from '../../hooks/useAuth'

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const { logout } = useAuth()

  const navigationItems = [
    { name: 'Home', path: '/dashboard', icon: Home, authRequired: true },
    { name: 'Learn', path: '/learn', icon: BookOpen, authRequired: true },
    { name: 'Play', path: '/play', icon: Gamepad2, authRequired: true },
    { name: 'Puzzles', path: '/puzzles', icon: Target, authRequired: true },
    { name: 'Community', path: '/community', icon: User, authRequired: true },
    { name: 'Library', path: '/library', icon: Library, authRequired: true },
  ]

  const publicNavigationItems = [
    { name: 'Learn', path: '#features', icon: BookOpen },
    { name: 'Practice', path: '#practice', icon: Gamepad2 },
    { name: 'Community', path: '#community', icon: User },
    { name: 'About', path: '#about', icon: BookOpen },
  ]

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
      setIsProfileMenuOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isActivePath = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/') return true
    return location.pathname === path
  }

  return (
    <header className="sticky top-0 z-50 bg-[#121621]/95 backdrop-blur-sm border-b border-[#272e45]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-white">
              AmaChess
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {isAuthenticated ? (
              navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActivePath(item.path)
                      ? 'text-primary-400 bg-primary-900/20'
                      : 'text-gray-300 hover:text-white hover:bg-background-secondary'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))
            ) : (
              publicNavigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-background-secondary transition-colors duration-200"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </a>
              ))
            )}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-background-secondary transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{user?.username}</p>
                    <p className="text-xs text-gray-400">Rating: {user?.rating || 1200}</p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#272e45] rounded-lg shadow-lg border border-[#374162]">
                    <div className="p-2">
                      <Link
                        to="/settings"
                        className="flex items-center space-x-2 w-full p-2 text-left text-sm text-gray-300 hover:text-white hover:bg-[#374162] rounded-md transition-colors duration-200"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full p-2 text-left text-sm text-gray-300 hover:text-white hover:bg-[#374162] rounded-md transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="bg-[#374162] hover:bg-[#4a5568] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Start Free Trial
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-background-secondary"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#374162]">
            <div className="space-y-2">
              {isAuthenticated ? (
                <>
                  {navigationItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center space-x-2 p-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActivePath(item.path)
                          ? 'text-primary-400 bg-primary-900/20'
                          : 'text-gray-300 hover:text-white hover:bg-background-secondary'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                  <div className="border-t border-[#374162] pt-2 mt-2">
                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 p-3 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-background-secondary transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="flex items-center space-x-2 w-full p-3 text-left rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-background-secondary transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {publicNavigationItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.path}
                      className="flex items-center space-x-2 p-3 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-background-secondary transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </a>
                  ))}
                  <div className="border-t border-[#374162] pt-2 mt-2 space-y-2">
                    <Link
                      to="/login"
                      className="block w-full bg-[#374162] hover:bg-[#4a5568] text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Start Free Trial
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
