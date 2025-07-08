const express = require('express');
const cors = require('cors');
const stockfishRoutes = require('./routes/stockfish');
const importRoutes = require('./routes/import');
const testRoutes = require('./routes/test');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/stockfish', stockfishRoutes);
app.use('/api/import', importRoutes);
app.use('/api/test', testRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AmaChess Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AmaChess Backend server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Quick test: http://localhost:${PORT}/api/test/quick-test`);
  console.log(`♟️  Stockfish API: http://localhost:${PORT}/api/stockfish`);
});

module.exports = app;
