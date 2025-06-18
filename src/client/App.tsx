import { Routes, Route } from 'react-router-dom'

// Components
import BaseLayout from './components/layout/BaseLayout'

// Pages
import HomePage from './pages/HomePage'
import Dashboard from './pages/Dashboard'
import Learn from './pages/Learn'
import Library from './pages/Library'
import Puzzles from './pages/Puzzles'
import PracticePosition from './pages/PracticePosition'
import BookReading from './pages/BookReading'
import Settings from './pages/Settings'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Hooks
import { useAuth } from './hooks/useAuth'

// Store
import { useAuthStore } from './store/authStore'

function App() {
  const { isLoading } = useAuth()
  const { isAuthenticated } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121621] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <BaseLayout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        {isAuthenticated && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/library" element={<Library />} />
            <Route path="/puzzles" element={<Puzzles />} />
            <Route path="/practice" element={<PracticePosition />} />
            <Route path="/book-reading" element={<BookReading />} />
            <Route path="/settings" element={<Settings />} />
          </>
        )}

        {/* Fallback route */}
        <Route path="*" element={<HomePage />} />      </Routes>
    </BaseLayout>
  )
}

export default App
