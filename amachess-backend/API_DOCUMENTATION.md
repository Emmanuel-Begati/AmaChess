# AmaChess Backend - AI Chess Coach API

## Overview

The AmaChess backend provides a powerful RESTful API for chess analysis and AI coaching powered by Stockfish 16. This backend is specifically designed to support the AI Chess Coach functionality in your Learn page.

## Quick Start

### 1. Installation & Setup

```bash
# Install dependencies
npm install

# Install Stockfish engine
npm run install-stockfish

# Test Stockfish installation
npm run test-stockfish

# Start the server
npm run dev
```

### 2. Verify Installation

The server will start on `http://localhost:3001`. Test the endpoints:

- Health Check: `GET http://localhost:3001/api/health`
- Quick Test: `GET http://localhost:3001/api/test/quick-test`

## API Endpoints for AI Chess Coach

### Core Analysis Endpoints

#### 1. Position Analysis
```http
POST /api/stockfish/analyze
Content-Type: application/json

{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "depth": 15,
  "time": 2000
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "bestMove": "e2e4",
    "evaluation": { "type": "centipawn", "value": 31 },
    "principalVariation": ["e2e4", "e7e5", "g1f3"],
    "depth": 15,
    "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
  }
}
```

### AI Coaching Endpoints

#### 2. Get Coach Move Suggestion
```http
POST /api/stockfish/coach/move
Content-Type: application/json

{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "skillLevel": 15,
  "depth": 12
}
```

**Response:**
```json
{
  "success": true,
  "coaching": {
    "suggestedMove": "e2e4",
    "evaluation": { "type": "centipawn", "value": 31 },
    "principalVariation": ["e2e4", "e7e5", "g1f3"],
    "skillLevel": 15,
    "explanation": "This move gives a slight advantage"
  }
}
```

#### 3. Evaluate Player Move
```http
POST /api/stockfish/coach/evaluate
Content-Type: application/json

{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "playerMove": "e2e4",
  "depth": 12
}
```

**Response:**
```json
{
  "success": true,
  "evaluation": {
    "playerMove": "e2e4",
    "playerEvaluation": { "type": "centipawn", "value": 31 },
    "bestMove": "e2e4",
    "bestEvaluation": { "type": "centipawn", "value": 31 },
    "quality": { "rating": 95, "description": "Excellent" },
    "feedback": "Excellent move! e2e4 is the best choice.",
    "improvement": null
  }
}
```

#### 4. Get Coaching Hint
```http
POST /api/stockfish/coach/hint
Content-Type: application/json

{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "difficulty": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "hint": {
    "message": "Consider the most forcing moves first",
    "level": "medium",
    "hasMove": true,
    "evaluation": { "type": "centipawn", "value": 31 }
  }
}
```

#### 5. Start Coaching Session
```http
POST /api/stockfish/coach/session
Content-Type: application/json

{
  "startingFen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "difficulty": "intermediate",
  "sessionType": "practice"
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "session_1234567890",
    "startingPosition": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "difficulty": "intermediate",
    "config": {
      "skillLevel": 15,
      "depth": 12,
      "timePerMove": 1500
    },
    "type": "practice",
    "created": "2024-07-08T02:45:00.000Z"
  }
}
```

### Advanced Coaching Endpoints

#### 6. Comprehensive Position Analysis
```http
POST /api/stockfish/coach/analysis
Content-Type: application/json

{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "depth": 15,
  "skillLevel": 15
}
```

#### 7. Practice Mode with Guidance
```http
POST /api/stockfish/coach/practice
Content-Type: application/json

{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "playerMove": "e2e4",
  "difficulty": "intermediate"
}
```

#### 8. Concept Explanation
```http
POST /api/stockfish/coach/explain
Content-Type: application/json

{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "concept": "tactics"
}
```

## Skill Levels

- **Beginner (1-8)**: Simplified moves, basic explanations
- **Intermediate (9-15)**: Balanced play, detailed feedback
- **Advanced (16-18)**: Strong moves, complex analysis
- **Expert (19-20)**: Maximum strength, deep analysis

## Difficulty Levels

- **easy**: Basic hints, simple explanations
- **medium**: Standard coaching, tactical awareness
- **hard**: Advanced concepts, deep calculation

## Frontend Integration

### Example React Hook for AI Chess Coach

```javascript
import { useState, useCallback } from 'react';

const useChessCoach = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const analyzePosition = useCallback(async (fen, options = {}) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/stockfish/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fen,
          depth: options.depth || 15,
          time: options.time || 2000
        })
      });
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      
      return data.analysis;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const getCoachSuggestion = useCallback(async (fen, skillLevel = 15) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/stockfish/coach/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen, skillLevel, depth: 12 })
      });
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      
      return data.coaching;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const evaluateMove = useCallback(async (fen, playerMove) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/stockfish/coach/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen, playerMove, depth: 12 })
      });
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      
      return data.evaluation;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const getHint = useCallback(async (fen, difficulty = 'medium') => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3001/api/stockfish/coach/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fen, difficulty })
      });
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error);
      
      return data.hint;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    analyzePosition,
    getCoachSuggestion,
    evaluateMove,
    getHint,
    isAnalyzing,
    error
  };
};

export default useChessCoach;
```

## Testing

```bash
# Test Stockfish engine
npm run test-stockfish

# Test API endpoints
npm run test-api
```

## Troubleshooting

### Common Issues

1. **Stockfish not found**: Run `npm run install-stockfish`
2. **Port 3001 in use**: Change PORT in server.js or kill existing process
3. **CORS errors**: Backend includes CORS middleware for frontend requests
4. **Analysis timeout**: Increase time parameter in requests

### Performance Tips

1. **Depth vs Speed**: Lower depth (8-12) for faster responses
2. **Skill Level**: Lower skill levels reduce calculation time
3. **Concurrent Requests**: Each request uses a separate Stockfish process

## Architecture

```
AmaChess Backend
├── src/
│   ├── server.js           # Express server
│   ├── routes/
│   │   ├── stockfish.js    # Chess analysis routes
│   │   ├── import.js       # Game import routes
│   │   └── test.js         # Testing routes
│   └── services/
│       ├── stockfishService.js  # Stockfish engine wrapper
│       └── lichessService.js    # Lichess API integration
├── scripts/
│   ├── install-stockfish.js    # Stockfish installer
│   ├── test-stockfish.js       # Engine tests
│   └── test-api.js             # API tests
└── stockfish/
    └── stockfish.exe           # Stockfish engine binary
```

## Next Steps

1. **Start the backend**: `npm run dev`
2. **Test all endpoints**: `npm run test-api`
3. **Integrate with frontend**: Use the provided React hooks
4. **Customize coaching**: Adjust skill levels and difficulty settings

Your AmaChess backend is now ready to power an intelligent AI Chess Coach! 🚀♟️
