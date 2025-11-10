const express = require('express');
const cors = require('cors');
const path = require('path');
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

// Serve static files from the React app build directory
const frontendBuildPath = path.join(__dirname, '../../amachess-frontend/dist');
app.use(express.static(frontendBuildPath));

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

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  const indexPath = path.join(frontendBuildPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      logger.error('Error serving index.html:', err);
      res.status(500).json({ error: 'Failed to serve frontend' });
    }
  });
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

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  try {
    // Get StockfishService instance and cleanup
    const StockfishService = require('./services/stockfishService');
    const stockfishService = new StockfishService();
    await stockfishService.cleanup();
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = app;
