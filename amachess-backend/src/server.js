const express = require('express');
const cors = require('cors');
require('dotenv').config();
const logger = require('./config/logger');

// Import database config to initialize connection
const { initializeDatabase } = require('./config/database');
const { checkGroqConfiguration } = require('./config/groq');

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
const chessVisionRoutes = require('./routes/chessVision'); // Chess vision/PDF detection routes
const coachRoutes = require('./routes/coach'); // AI chess coach routes
const gamesRoutes = require('./routes/games'); // Game storage routes
const chatRoutes = require('./routes/chat'); // AI chat routes

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
app.use('/api/lichess', lichessRoutes); // Lichess API endpoints
app.use('/api/games', lichessRoutes); // Games API endpoints (alias for lichess routes)
app.use('/api/analyze', analyzeRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/puzzles', puzzleRoutes);
app.use('/api', chessVisionRoutes); // Chess vision endpoints (detect-chess, get-fen, etc.)
app.use('/api/coach', coachRoutes); // AI Chess Coach endpoints
app.use('/api/user-games', gamesRoutes); // User game storage endpoints
app.use('/api/chat', chatRoutes); // AI chat endpoints

// Enhanced health check with database status
app.get('/api/health', async (req, res) => {
  try {
    const { healthCheck } = require('./config/database');
    const { getGroqStatus } = require('./config/groq');
    const dbHealth = await healthCheck();
    const groqStatus = getGroqStatus();
    
    res.json({ 
      status: 'OK', 
      message: 'AmaChess Backend is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: dbHealth,
      ai: {
        groq: groqStatus,
        stockfish: true
      },
      features: {
        authentication: true,
        stockfish: true,
        import: true,
        lichess: true,
        analysis: true,
        books: true,
        puzzles: true,
        userProgress: true,
        aiCoach: groqStatus.configured,
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
    logger.info('Starting AmaChess Backend...');
    
    // Check Groq Configuration
    checkGroqConfiguration();
    
    // Initialize database connection
    await initializeDatabase();
    
    app.listen(PORT, () => {
      logger.info(`AmaChess Backend server running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/api/health`);
      logger.info(`Auth endpoints: http://localhost:${PORT}/api/auth`);
      logger.info(`Protected routes: http://localhost:${PORT}/api/user`);
      logger.info(`Puzzle routes: http://localhost:${PORT}/api/puzzles`);
      logger.info(`User puzzles: http://localhost:${PORT}/api/user/puzzles`);
      logger.info(`Books: http://localhost:${PORT}/api/books`);
      logger.info(`Analysis: http://localhost:${PORT}/api/analyze`);
      logger.info(`Stockfish: http://localhost:${PORT}/api/stockfish`);
      logger.info(`AI Coach: http://localhost:${PORT}/api/coach`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
