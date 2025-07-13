const express = require('express');
const cors = require('cors');
require('dotenv').config();

const stockfishRoutes = require('./routes/stockfish');
const importRoutes = require('./routes/import');
const testRoutes = require('./routes/test');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const lichessRoutes = require('./routes/lichess');
const analyzeRoutes = require('./routes/analyze');
const booksRoutes = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', protectedRoutes);
app.use('/api/stockfish', stockfishRoutes);
app.use('/api/import', importRoutes);
app.use('/api/test', testRoutes);
app.use('/api/games', lichessRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/books', booksRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AmaChess Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: {
      authentication: true,
      stockfish: true,
      import: true,
      lichess: true,
      analysis: true,
      books: true
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AmaChess Backend server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`👤 Protected routes: http://localhost:${PORT}/api/user`);
  console.log(`🧪 Quick test: http://localhost:${PORT}/api/test/quick-test`);
  console.log(`♟️  Stockfish API: http://localhost:${PORT}/api/stockfish`);
  console.log(`🏆 Lichess API: http://localhost:${PORT}/api/games`);
  console.log(`📊 Analysis API: http://localhost:${PORT}/api/analyze`);
  console.log(`📚 Books API: http://localhost:${PORT}/api/books`);
});

module.exports = app;
