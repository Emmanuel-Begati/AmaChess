import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import ContactUs from './pages/ContactUs';
import Learn from './pages/Learn';
import Puzzles from './pages/Puzzles';
import Library from './pages/Library';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <div className="w-full min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/puzzles" element={<Puzzles />} />
          <Route path="/library" element={<Library />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
