const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database config to initialize connection
const { initializeDatabase } = require('./config/database');

const stockfishRoutes = require('./routes/stockfish');
const importRoutes = require('./routes/import');
const testRoutes = require('./routes/test');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const lichessRoutes = require('./routes/lichess');
const analyzeRoutes = require('./routes/analyze');
const booksRoutes = require('./routes/books');
const puzzleRoutes = require('./routes/puzzles');
const userPuzzleRoutes = require('./routes/userPuzzles'); // New user puzzle routes

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', protectedRoutes);
app.use('/api/user/puzzles', userPuzzleRoutes); // New user puzzle management routes
app.use('/api/stockfish', stockfishRoutes);
app.use('/api/import', importRoutes);
app.use('/api/test', testRoutes);
app.use('/api/games', lichessRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/puzzles', puzzleRoutes);

// Enhanced health check with database status
app.get('/api/health', async (req, res) => {
  try {
    const { healthCheck } = require('./config/database');
    const dbHealth = await healthCheck();
    
    res.json({ 
      status: 'OK', 
      message: 'AmaChess Backend is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: dbHealth,
      features: {
        authentication: true,
        stockfish: true,
        import: true,
        lichess: true,
        analysis: true,
        books: true,
        puzzles: true,
        userProgress: true,
        postgresql: process.env.DATABASE_URL?.includes('postgresql') || false
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting AmaChess Backend...');
    
    // Initialize database connection
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`✅ AmaChess Backend server running on port ${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`👤 Protected routes: http://localhost:${PORT}/api/user`);
      console.log(`🧩 Puzzle routes: http://localhost:${PORT}/api/puzzles`);
      console.log(`📊 User puzzles: http://localhost:${PORT}/api/user/puzzles`);
      console.log(`📚 Books: http://localhost:${PORT}/api/books`);
      console.log(`🔍 Analysis: http://localhost:${PORT}/api/analyze`);
      console.log(`♟️  Stockfish: http://localhost:${PORT}/api/stockfish`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
