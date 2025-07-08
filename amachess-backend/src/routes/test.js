const express = require('express');
const cors = require('cors');

// API Testing endpoint for quick verification
const testRouter = express.Router();

// Quick health check with Stockfish test
testRouter.get('/quick-test', async (req, res) => {
  try {
    const StockfishService = require('./services/stockfishService');
    const stockfishService = new StockfishService();
    
    // Quick analysis test
    const startingFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    const analysis = await stockfishService.analyzePosition(startingFen, 8, 1000);
    
    res.json({
      status: 'success',
      message: 'AmaChess Backend & Stockfish are working correctly!',
      test: {
        position: 'Starting position',
        bestMove: analysis.bestMove,
        evaluation: analysis.evaluation,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Backend test failed',
      error: error.message
    });
  }
});

module.exports = testRouter;
