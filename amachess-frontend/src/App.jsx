import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
import ChessBoard from './components/ChessBoard';
import ChessBoardTest from './test/ChessBoardTest';
import MinimalChessTest from './test/MinimalChessTest';
import SimpleDropTest from './test/SimpleDropTest';
// import FixedChessTest from './test/FixedChessTest';
// import TestChessApp from './test/TestChessApp';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import TestPage from './pages/TestPage';
import './App.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
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
const MissingComponent = ({ name }) => (
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

  const handleMove = (move, fen) => {
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
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/puzzles" element={<Puzzles />} />
                <Route path="/puzzle-solver" element={<PuzzleSolver />} />
                <Route path="/library" element={<Library />} />
                <Route path="/library/book/:bookId" element={<BookReader />} />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                {/* Test Routes */}
                <Route path="/drop" element={<SimpleDropTest />} />
                <Route path="/minimal" element={<MinimalChessTest />} />
                <Route path="/test" element={<ChessBoardTest />} />
                <Route path="/fixed" element={<MissingComponent name="FixedChessTest" />} />
                <Route path="/test-app" element={<MissingComponent name="TestChessApp" />} />
                <Route path="/test-page" element={<TestPage />} />
                
                {/* Example ChessBoard route */}
                <Route 
                  path="/chess" 
                  element={
                    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                      <div className="bg-white rounded-lg shadow-lg p-8">
                        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
                          Interactive Chess Game
                        </h1>
                        <ChessBoard
                          width={500}
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
