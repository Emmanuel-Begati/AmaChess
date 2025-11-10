# Stockfish API Migration Guide

## Overview

AmaChess has been migrated from using local Stockfish binaries to a professional API-based approach. This change brings significant benefits in terms of memory usage, deployment simplicity, and maintainability.

## Benefits of API-Based Approach

### ✅ Advantages
- **Reduced Memory Usage**: No local engine processes consuming RAM
- **Platform Independence**: No need for platform-specific binaries
- **Always Updated**: Access to latest Stockfish versions automatically
- **Better Scalability**: API handles load balancing and optimization
- **Simplified Deployment**: No binary compilation or installation required
- **Professional Caching**: Built-in request caching and rate limiting
- **Error Resilience**: Automatic retry logic and fallback handling

### 🔧 Technical Improvements
- **Request Caching**: 5-minute TTL for position analysis
- **Rate Limiting**: Intelligent queue management
- **Retry Logic**: Automatic retry with exponential backoff
- **Health Monitoring**: Real-time API status checking
- **Performance Metrics**: Detailed statistics and monitoring

## Configuration

### Environment Variables
```bash
# Primary API (recommended)
STOCKFISH_API_URL=https://stockfish.online/api/s/v2.php

# Alternative APIs
# STOCKFISH_API_URL=https://chess-api.com/v1/analysis
# STOCKFISH_API_URL=https://lichess.org/api/cloud-eval
```

### Dependencies
The migration adds one new dependency:
```json
"node-cache": "^5.1.2"
```

## API Features

### Difficulty Levels
- **Beginner**: Depth 8, Skill 1 (800 Elo)
- **Intermediate**: Depth 12, Skill 10 (1500 Elo)
- **Advanced**: Depth 16, Skill 15 (2000 Elo)
- **Expert**: Depth 20, Skill 18 (2500 Elo)
- **Maximum**: Depth 25, Skill 20 (3200+ Elo)

### Caching Strategy
- Position analysis cached for 5 minutes
- Move calculations cached by difficulty level
- Automatic cache cleanup and statistics
- Memory-efficient cache management

## Migration Steps

### 1. Install Dependencies
```bash
npm install node-cache
```

### 2. Update Environment
Update your `.env` file:
```bash
# Remove old Stockfish path
# STOCKFISH_PATH=./stockfish/stockfish/stockfish-ubuntu-x86-64-avx2

# Add new API configuration
STOCKFISH_API_URL=https://stockfish.online/api/s/v2.php
```

### 3. Clean Up Old Files
```bash
npm run cleanup-stockfish
```

### 4. Test API Integration
```bash
npm run test-stockfish-api
```

## Testing

### Health Check
```bash
curl http://localhost:3001/api/stockfish/health
```

### API Test
```bash
npm run test-stockfish-api
```

### Performance Test
The test suite includes performance benchmarks and cache validation.

## Monitoring

### Service Statistics
```bash
curl http://localhost:3001/api/stockfish/stats
```

### Cache Management
```bash
# Clear cache
curl -X POST http://localhost:3001/api/stockfish/cache/clear
```

## Troubleshooting

### Common Issues

1. **API Timeout**: Increase timeout in service configuration
2. **Rate Limiting**: Built-in queue management handles this automatically
3. **Network Issues**: Automatic retry logic with exponential backoff

### Fallback Behavior
- If API is unavailable, system gracefully degrades
- Error messages provide clear feedback
- Health checks monitor API status

## Performance Comparison

| Metric | Local Stockfish | API-Based |
|--------|----------------|-----------|
| Memory Usage | ~50-100MB per engine | ~5MB |
| Startup Time | 2-5 seconds | Instant |
| Platform Support | Limited | Universal |
| Maintenance | High | None |
| Scalability | Poor | Excellent |

## Support

For issues or questions about the API migration:
1. Check the health endpoint: `/api/stockfish/health`
2. Run the test suite: `npm run test-stockfish-api`
3. Review logs for detailed error information
4. Check API documentation for alternative endpoints