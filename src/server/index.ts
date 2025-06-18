import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import gameRoutes from './routes/game';
import puzzleRoutes from './routes/puzzle';
import bookRoutes from './routes/book';
import lessonRoutes from './routes/lesson';
import analysisRoutes from './routes/analysis';
import recommendationRoutes from './routes/recommendation';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware - Configure helmet to allow static assets
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/puzzles', puzzleRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve static files for built client
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, '../client');
const indexPath = path.join(clientDistPath, 'index.html');

console.log('Static files directory:', clientDistPath);
console.log('Index file path:', indexPath);

// Serve static assets (CSS, JS, images) from dist/client
app.use(express.static(clientDistPath, {
  maxAge: '1d', // Cache static assets for 1 day in production
  setHeaders: (res, path) => {
    // Set proper MIME types for assets
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (path.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Catch-all handler for SPA routing - serve index.html for non-API routes
app.get('*', (req, res) => {
  // Skip API routes and static assets
  if (req.path.startsWith('/api/') || req.path.includes('.')) {
    return res.status(404).json({
      success: false,
      error: 'Not Found',
      message: 'Route not found',
    });
  }
  
  // Serve index.html for all other routes (SPA routing)
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).json({
        success: false,
        error: 'Server Error',
        message: 'Could not serve application',
      });
    }
  });
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: err.message,
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid token',
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
  });
});

// 404 handler - only for routes that weren't caught above
app.use('/api/*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: 'API Route Not Found',
    message: 'The requested API endpoint does not exist',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
