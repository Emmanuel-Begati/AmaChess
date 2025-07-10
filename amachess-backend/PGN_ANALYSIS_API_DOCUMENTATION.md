# PGN Analysis API Documentation

## Overview
The PGN Analysis API provides comprehensive chess game analysis using Stockfish engine. It accepts PGN (Portable Game Notation) strings and returns detailed statistics, move quality assessments, and insights.

## Features
- **Deep Move Analysis**: Each move is analyzed using Stockfish engine
- **Move Quality Classification**: Moves are classified as excellent, good, inaccuracy, mistake, or blunder
- **Game Phase Analysis**: Separate statistics for opening, middlegame, and endgame
- **Key Moments Detection**: Identifies blunders, excellent moves, and turning points
- **Performance Rating**: Calculates estimated performance rating based on play quality
- **Caching System**: Intelligent caching to avoid re-analyzing identical games
- **Batch Processing**: Support for analyzing multiple games at once

## API Endpoints

### 1. POST /api/analyze
Analyze a single PGN game and return comprehensive statistics.

**Request Body:**
```json
{
  "pgn": "string (required) - PGN data to analyze",
  "depth": "number (optional) - Engine depth (5-25, default: 15)",
  "timePerMove": "number (optional) - Time per move in ms (500-10000, default: 2000)",
  "username": "string (optional) - Username to identify player side",
  "enableCache": "boolean (optional) - Use caching (default: true)"
}
```

**Response Format:**
```json
{
  "success": true,
  "analysis": {
    "metadata": {
      "event": "Event name",
      "site": "Site URL",
      "date": "Game date",
      "white": "White player",
      "black": "Black player", 
      "result": "Game result",
      "whiteElo": 1500,
      "blackElo": 1480,
      "timeControl": "300+3",
      "opening": "Opening name"
    },
    "accuracy": 87,
    "blunders": 2,
    "mistakes": 4,
    "inaccuracies": 8,
    "excellentMoves": 12,
    "goodMoves": 18,
    "centipawnLoss": 45,
    "totalMoves": 44,
    "playerSide": "white",
    "phaseAnalysis": {
      "opening": {
        "accuracy": 92,
        "movesAnalyzed": 12,
        "keyMoments": 1
      },
      "middlegame": {
        "accuracy": 78,
        "movesAnalyzed": 24,
        "keyMoments": 3
      },
      "endgame": {
        "accuracy": 89,
        "movesAnalyzed": 8,
        "keyMoments": 0
      }
    },
    "keyMoments": [
      {
        "moveNumber": 18,
        "type": "blunder",
        "side": "white",
        "move": "Rxd4",
        "description": "Blunder: Lost 240 centipawns",
        "evaluation": "-2.40",
        "betterMove": "Rd2"
      }
    ],
    "moveAccuracy": {
      "excellent": { "count": 12, "percentage": 27 },
      "good": { "count": 18, "percentage": 41 },
      "inaccuracies": { "count": 8, "percentage": 18 },
      "mistakes": { "count": 4, "percentage": 9 },
      "blunders": { "count": 2, "percentage": 5 }
    },
    "openingName": "Sicilian Defense",
    "openingEval": "+0.30",
    "result": "1-0",
    "timeControl": "300+3",
    "performanceRating": 1847,
    "analysisInfo": {
      "depth": 15,
      "timePerMove": 2000,
      "analysisTime": 45000,
      "generatedAt": "2024-01-15T10:30:00.000Z",
      "movesAnalyzed": 44
    }
  }
}
```

### 2. POST /api/analyze/batch
Analyze multiple PGN games at once (up to 10 games).

**Request Body:**
```json
{
  "pgns": ["pgn1", "pgn2", "..."],
  "depth": 12,
  "timePerMove": 1000,
  "username": "player_name"
}
```

**Response Format:**
```json
{
  "success": true,
  "batchAnalysis": {
    "totalGames": 3,
    "successfulAnalyses": 2,
    "failedAnalyses": 1,
    "totalTime": 89000,
    "results": [
      {
        "index": 0,
        "success": true,
        "analysis": { /* analysis object */ }
      },
      {
        "index": 1,
        "success": false,
        "error": "Invalid PGN format"
      }
    ]
  }
}
```

### 3. GET /api/analyze/cache/stats
Get cache statistics.

**Response:**
```json
{
  "success": true,
  "cache": {
    "size": 25,
    "maxSize": 100
  }
}
```

### 4. DELETE /api/analyze/cache
Clear analysis cache.

**Response:**
```json
{
  "success": true,
  "message": "Analysis cache cleared"
}
```

## Move Quality Classification

The analysis engine classifies each move based on centipawn loss:

| Classification | Centipawn Loss | Score Range | Description |
|---------------|----------------|-------------|-------------|
| Excellent | 0-10 | 90-95 | Best or near-best move |
| Good | 11-25 | 80-89 | Solid, practical move |
| Inaccuracy | 26-50 | 65-79 | Slightly suboptimal |
| Mistake | 51-100 | 40-64 | Clear error in judgment |
| Blunder | 100+ | 20-39 | Major oversight |

## Game Phase Detection

Games are automatically divided into phases:
- **Opening**: First 30% of moves (minimum 20 moves)
- **Middlegame**: Middle 40% of moves 
- **Endgame**: Final 30% of moves

Each phase receives separate analysis and statistics.

## Error Handling

The API provides detailed error responses for common issues:

### 400 Bad Request
- Invalid PGN format
- Missing required parameters
- Invalid depth or time parameters

### 408 Request Timeout
- Analysis taking too long
- Engine timeout

### 503 Service Unavailable
- Stockfish engine unavailable
- System overload

## Usage Examples

### Basic Analysis
```javascript
const response = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pgn: pgnString,
    depth: 15,
    timePerMove: 2000,
    username: 'playerName'
  })
});

const analysis = await response.json();
console.log(`Accuracy: ${analysis.analysis.accuracy}%`);
```

### Integration with Lichess API
```javascript
// Fetch PGN from Lichess
const lichessResponse = await fetch('/api/games/username?max=1');
const pgnData = await lichessResponse.text();

// Analyze the fetched PGN
const analysisResponse = await fetch('/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pgn: pgnData,
    username: 'username'
  })
});

const analysis = await analysisResponse.json();
```

### Frontend Integration
```jsx
const analyzePGN = async (pgnString, username) => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pgn: pgnString,
        username: username,
        depth: 15,
        timePerMove: 2000
      })
    });

    if (!response.ok) {
      throw new Error('Analysis failed');
    }

    const result = await response.json();
    return result.analysis;
  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }
};
```

## Performance Considerations

### Analysis Time
- **Depth**: Higher depth = more accurate but slower
- **Time per move**: More time = better analysis
- **Game length**: Longer games take proportionally more time

### Typical Analysis Times
| Game Length | Depth 10 | Depth 15 | Depth 20 |
|-------------|----------|----------|----------|
| 20 moves | 30s | 60s | 120s |
| 40 moves | 60s | 120s | 240s |
| 60 moves | 90s | 180s | 360s |

### Optimization Tips
1. **Use caching**: Enable caching for repeated analyses
2. **Adjust parameters**: Lower depth/time for faster results
3. **Batch processing**: Analyze multiple games efficiently
4. **Progressive analysis**: Start with quick analysis, then deep dive

## Rate Limiting

- Maximum 10 concurrent analysis requests
- Batch analysis limited to 10 games
- Cache size limited to 100 entries
- Individual game analysis timeout: 10 minutes

## Testing

Run the test suite to verify functionality:

```bash
npm run test-analysis
```

The test covers:
- Basic PGN analysis
- Complex game analysis
- Error handling
- Cache functionality
- Batch processing
- Integration with Lichess API

## Troubleshooting

### Common Issues

1. **"No valid moves found in PGN"**
   - Check PGN format
   - Ensure moves are valid chess notation
   - Remove annotations and comments

2. **"Analysis timeout"**
   - Reduce depth parameter
   - Reduce timePerMove parameter
   - Check Stockfish engine availability

3. **"Engine unavailable"**
   - Verify Stockfish installation
   - Check engine path configuration
   - Restart the server

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

## Future Enhancements

Planned features for future versions:
- [ ] Real-time analysis streaming
- [ ] Opening book integration
- [ ] Tactical theme detection
- [ ] Position evaluation graphs
- [ ] Multi-engine comparison
- [ ] Analysis export formats (PDF, JSON)
- [ ] Game similarity detection
