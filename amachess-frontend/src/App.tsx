import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PreferencesProvider } from './contexts/PreferencesContext';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import ContactUs from './pages/ContactUs';
import Learn from './pages/Learn';
import Puzzles from './pages/Puzzles';
import PuzzleSolver from './pages/PuzzleSolver';
import Library from './pages/Library';
import BookReader from './pages/BookReader';
import Settings from './pages/Settings';
import ChessGame from './components/chess/ChessGame.tsx'
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ui/ProtectedRoute';
import { ChessMove } from './types';
import './App.css';

// Redirect authenticated users away from public-only pages (landing, login, register)
const RedirectIfAuthenticated: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
          <span className="text-white">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('App Error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Fallback components for missing routes
const MissingComponent: React.FC<{ name: string }> = ({ name }) => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Component Not Found</h1>
      <p className="text-gray-600 mb-4">
        The component "{name}" is not available yet.
      </p>
      <a href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Go Home
      </a>
    </div>
  </div>
);

function App() {
  console.log('App component rendering...');

  const handleMove = (move: ChessMove, fen: string): void => {
    console.log('Move made:', move);
    console.log('New position:', fen);
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <PreferencesProvider>
          <Router>
            <div className="w-full min-h-screen">
              <Routes>
                <Route path="/" element={
                  <RedirectIfAuthenticated>
                    <HomePage />
                  </RedirectIfAuthenticated>
                } />
                <Route path="/login" element={
                  <RedirectIfAuthenticated>
                    <Login />
                  </RedirectIfAuthenticated>
                } />
                <Route path="/register" element={
                  <RedirectIfAuthenticated>
                    <Register />
                  </RedirectIfAuthenticated>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/learn" element={
                  <ProtectedRoute>
                    <Learn />
                  </ProtectedRoute>
                } />
                <Route path="/puzzles" element={
                  <ProtectedRoute>
                    <Puzzles />
                  </ProtectedRoute>
                } />
                <Route path="/puzzle-solver" element={
                  <ProtectedRoute>
                    <PuzzleSolver />
                  </ProtectedRoute>
                } />
                <Route path="/library" element={
                  <ProtectedRoute>
                    <Library />
                  </ProtectedRoute>
                } />
                <Route path="/book" element={
                  <ProtectedRoute>
                    <BookReader />
                  </ProtectedRoute>
                } />
                <Route path="/library/book/:bookId" element={
                  <ProtectedRoute>
                    <BookReader />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                
                {/* Example ChessBoard route */}
                <Route 
                  path="/chess" 
                  element={
                    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                      <div className="bg-white rounded-lg shadow-lg p-8">
                        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                          Interactive Chess Game
                        </h1>
                        <ChessGame
                          width={500}
                          position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                          onMove={handleMove}
                          interactive={true}
                          showNotation={true}
                          engineEnabled={false}
                        />
                        <p className="text-center text-gray-600 mt-4">
                          Drag and drop pieces to make moves
                        </p>
                      </div>
                    </div>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<MissingComponent name="Page" />} />
              </Routes>
            </div>
          </Router>
        </PreferencesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
