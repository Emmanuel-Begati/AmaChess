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
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const handleMove = (move, fen) => {
    console.log('Move made:', move);
    console.log('New position:', fen);
  };

  return (
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
            </Routes>
          </div>
        </Router>
      </PreferencesProvider>
    </AuthProvider>
  );
}

export default App;
