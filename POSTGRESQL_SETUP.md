# AmaChess PostgreSQL & Prisma Setup Guide

This guide will help you set up PostgreSQL and Prisma for your AmaChess application with complete database models for puzzles, users, and progress tracking.

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher) OR Docker
- Git

## 🚀 Quick Setup Options

### Option 1: Docker Setup (Recommended for Development)

1. **Start PostgreSQL with Docker Compose:**
   ```bash
   cd amachess-backend
   docker-compose up -d postgres
   ```

2. **The database will be available at:**
   - Host: `localhost`
   - Port: `5432`
   - Database: `amachess_db`
   - User: `amachess_user`
   - Password: `amachess_password`

3. **Optional: Start pgAdmin for database management:**
   ```bash
   docker-compose up -d pgadmin
   ```
   Access at: http://localhost:8080 (admin@amachess.com / admin123)

### Option 2: Local PostgreSQL Installation

1. **Install PostgreSQL** from [postgresql.org](https://www.postgresql.org/download/)

2. **Run the setup script:**
   
   **On Windows:**
   ```cmd
   cd amachess-backend\scripts
   setup-postgresql.bat
   ```
   
   **On Linux/Mac:**
   ```bash
   cd amachess-backend/scripts
   chmod +x setup-postgresql.sh
   ./setup-postgresql.sh
   ```

## 🔧 Database Configuration

1. **Update your `.env` file:**
   ```env
   # For Docker setup:
   DATABASE_URL="postgresql://amachess_user:amachess_password@localhost:5432/amachess_db?schema=public"
   
   # For local PostgreSQL (adjust credentials):
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/amachess_dev?schema=public"
   ```

2. **Install dependencies:**
   ```bash
   cd amachess-backend
   npm install
   ```

3. **Generate Prisma client:**
   ```bash
   npm run db:generate
   ```

4. **Run database migrations:**
   ```bash
   npm run db:migrate
   ```

5. **Seed the database with Lichess puzzles:**
   ```bash
   npm run db:seed
   ```

## 📊 Database Schema Overview

Your Prisma schema includes these optimized models:

### Core Models
- **User**: User accounts with authentication and profile data
- **Puzzle**: Lichess puzzle data with tactical themes and ratings
- **PuzzleAttempt**: Individual puzzle solving attempts with timing and accuracy
- **PuzzleSession**: Training sessions with multiple puzzles
- **UserStats**: Aggregated user performance statistics
- **Book**: Chess book storage and analysis

### Key Features
- ✅ **PostgreSQL optimized** with proper indexing
- ✅ **Efficient puzzle filtering** by rating, themes, difficulty
- ✅ **Progress tracking** with streaks, accuracy, and timing
- ✅ **Session management** for different training types
- ✅ **Batch operations** for large puzzle datasets

## 🧩 Puzzle Data Structure

Each puzzle includes:
```typescript
interface LichessPuzzle {
  id: string;
  lichessId: string;        // Original Lichess ID
  fen: string;              // Chess position
  moves: string[];          // Solution moves (UCI format)
  rating: number;           // Difficulty rating (800-3000)
  themes: string[];         // Tactical themes ['pin', 'fork', etc.]
  difficulty: string;       // 'Beginner', 'Intermediate', 'Advanced', 'Expert'
  sideToMove: string;       // 'white' or 'black'
  description?: string;     // AI-generated description
  hint?: string;           // Puzzle hint
  gameUrl?: string;        // Original Lichess game
}
```

## 🔌 API Endpoints

### Public Puzzle Endpoints
```bash
GET /api/puzzles/random                    # Get random puzzle
GET /api/puzzles/theme/:theme             # Get puzzles by theme
GET /api/puzzles/stats                    # Get puzzle database stats
GET /api/puzzles/themes                   # Get available themes
```

### User Progress Endpoints (Authenticated)
```bash
POST /api/user/puzzles/attempts           # Record puzzle attempt
GET  /api/user/puzzles/stats              # Get user statistics
GET  /api/user/puzzles/attempts           # Get attempt history
POST /api/user/puzzles/sessions           # Start puzzle session
GET  /api/user/puzzles/recommendations    # Get personalized puzzles
```

## 💻 Example Usage in Your React Frontend

### Load Random Puzzle
```typescript
const { puzzleService } = from '../services/puzzleService';

// Load puzzle with filters
const puzzle = await puzzleService.getRandomPuzzle({
  minRating: 1400,
  maxRating: 1800,
  themes: ['pin', 'fork'],
  difficulty: 'Intermediate'
});
```

### Record User Progress
```typescript
// After user completes puzzle
const response = await fetch('/api/user/puzzles/attempts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    puzzleId: puzzle.id,
    isCompleted: true,
    isSolved: true,
    movesPlayed: userMoves,
    timeSpent: 45, // seconds
    hintsUsed: 0,
    accuracy: 100
  })
});
```

## 🔧 Database Management Commands

```bash
# Development workflow
npm run db:generate          # Generate Prisma client
npm run db:migrate           # Create and apply new migration
npm run db:seed              # Seed with puzzle data
npm run db:studio           # Open Prisma Studio GUI

# Production deployment
npm run db:migrate:prod      # Deploy migrations to production

# Reset database (development only)
npm run db:reset            # Reset database and re-seed
```

## 📈 Performance Optimizations

The setup includes several PostgreSQL optimizations:

1. **Proper Indexing**: Efficient queries on rating, themes, difficulty
2. **Batch Operations**: Fast puzzle seeding with transaction batching
3. **Connection Pooling**: Optimized database connections
4. **Query Optimization**: Efficient filtering and sorting

## 🧪 Testing Your Setup

1. **Check database connection:**
   ```bash
   npm start
   # Look for "✅ Database connection successful"
   ```

2. **Test API health:**
   ```bash
   curl http://localhost:3001/api/health
   ```

3. **Load a random puzzle:**
   ```bash
   curl http://localhost:3001/api/puzzles/random
   ```

## 🔍 Monitoring & Debugging

- **Health Check**: `GET /api/health` shows database status
- **Prisma Studio**: Visual database browser at `npm run db:studio`
- **pgAdmin**: Web interface if using Docker setup
- **Logs**: Check console for detailed query logs in development

## 🚀 Next Steps

1. **Start the backend server:**
   ```bash
   npm run dev
   ```

2. **Test puzzle loading in your frontend**

3. **Implement user authentication** to track progress

4. **Customize puzzle filters** based on user preferences

5. **Add more advanced features** like spaced repetition or difficulty adaptation

## 🆘 Troubleshooting

### Connection Issues
- Verify PostgreSQL is running: `docker-compose ps` or `systemctl status postgresql`
- Check DATABASE_URL in `.env` file
- Ensure database and user exist

### Migration Issues
- Reset migrations: `npm run db:reset`
- Check Prisma schema syntax
- Verify database permissions

### Seeding Issues
- Check if CSV file exists: `amachess-backend/utils/lichess_db_puzzle.csv`
- Reduce `MAX_PUZZLES_TO_LOAD` in `.env` for testing
- Check database disk space

Your AmaChess app is now ready with a production-grade PostgreSQL setup! 🎉
