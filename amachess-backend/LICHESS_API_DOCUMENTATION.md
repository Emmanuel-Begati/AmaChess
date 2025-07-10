# Lichess API Integration Documentation

## Overview
This backend provides a secure interface to the Lichess API for fetching user games in PGN format. The implementation includes authentication, caching, error handling, and rate limiting considerations.

## Prerequisites
1. Lichess personal API token (OAuth2)
2. Node.js backend with Express
3. Environment variables configured

## Setup Instructions

### 1. Get Lichess API Token
1. Go to https://lichess.org/account/oauth/token
2. Create a new personal access token
3. Copy the token and add it to your `.env` file

### 2. Environment Configuration
Create a `.env` file in the backend directory:
```env
LICHESS_API_TOKEN=your_lichess_api_token_here
PORT=3001
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Server
```bash
npm run dev
```

## API Endpoints

### 1. GET /api/games/:username
Fetch PGN games for a specific Lichess user.

**Parameters:**
- `username` (required): Lichess username

**Query Parameters:**
- `max` (optional): Maximum number of games to fetch (1-100, default: 10)
- `rated` (optional): Include only rated games ('true'/'false', default: 'true')
- `variant` (optional): Game variant ('standard', 'chess960', etc., default: 'standard')
- `since` (optional): Fetch games since this timestamp (Unix timestamp in milliseconds)
- `until` (optional): Fetch games until this timestamp (Unix timestamp in milliseconds)
- `color` (optional): Games where user played as ('white', 'black')
- `opening` (optional): Filter by opening ECO code
- `perfType` (optional): Performance type ('bullet', 'blitz', 'rapid', 'classical')
- `sort` (optional): Sort order ('dateDesc', 'dateAsc', default: 'dateDesc')

**Response:**
- Content-Type: `application/x-chess-pgn`
- Headers include game count and user information
- Returns raw PGN data

**Example:**
```bash
curl "http://localhost:3001/api/games/DrNykterstein?max=5&rated=true"
```

### 2. GET /api/games/:username/json
Fetch games in JSON format with metadata.

**Response:**
```json
{
  "username": "DrNykterstein",
  "gameCount": 5,
  "options": {
    "max": 5,
    "rated": "true",
    "variant": "standard",
    "sort": "dateDesc"
  },
  "pgnData": "[Event \"Rated Blitz game\"]...",
  "fetchedAt": "2024-01-15T10:30:00.000Z",
  "cacheStatus": "fresh"
}
```

### 3. GET /api/games/:username/cache
Get cached PGN files for a user.

**Response:**
```json
{
  "username": "DrNykterstein",
  "cachedFiles": [
    {
      "filename": "DrNykterstein_2024-01-15T10-30-00-000Z.pgn",
      "size": 15420,
      "created": "2024-01-15T10:30:00.000Z",
      "modified": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalFiles": 1
}
```

### 4. DELETE /api/games/:username/cache
Clear cache for a specific user.

**Response:**
```json
{
  "message": "Cache cleared for user: DrNykterstein",
  "clearedAt": "2024-01-15T10:35:00.000Z"
}
```

### 5. GET /api/games/status
Get Lichess API status and rate limit information.

**Response:**
```json
{
  "status": "connected",
  "rateLimitRemaining": "95",
  "rateLimitReset": "1642248000",
  "user": {
    "id": "your_lichess_id",
    "username": "your_username"
  }
}
```

## Error Handling

### Common Error Responses

**404 - User Not Found:**
```json
{
  "error": "User not found",
  "message": "User 'nonexistentuser' not found"
}
```

**429 - Rate Limited:**
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests to Lichess API. Please try again later.",
  "retryAfter": 60
}
```

**401 - Authentication Error:**
```json
{
  "error": "Authentication error",
  "message": "Invalid or missing Lichess API token"
}
```

**400 - Bad Request:**
```json
{
  "error": "Invalid username",
  "message": "Username must be at least 3 characters long"
}
```

## Caching Strategy

### In-Memory Cache
- Stores recent PGN responses for 5 minutes
- Reduces API calls for repeated requests
- Keyed by username and request parameters

### File Cache
- Saves PGN data to disk with timestamp
- Located in `backend/cache/` directory
- Includes metadata about request parameters
- Useful for offline analysis and backup

### Cache Management
- Automatic cleanup of old cache entries
- Manual cache clearing per user
- Cache status included in JSON responses

## Rate Limiting
- Lichess API has rate limits (typically 50-100 requests per minute)
- Implementation includes exponential backoff
- Caching reduces API calls
- Error responses include rate limit information

## Security Considerations
1. **API Token Security**: Store in environment variables, never commit to version control
2. **Input Validation**: All user inputs are validated and sanitized
3. **Error Handling**: Sensitive information is not exposed in error messages
4. **Rate Limiting**: Respects Lichess API rate limits to prevent abuse

## Testing

### Run Tests
```bash
npm run test-lichess
```

### Manual Testing
```bash
# Test basic functionality
curl "http://localhost:3001/api/games/DrNykterstein?max=3"

# Test JSON format
curl "http://localhost:3001/api/games/DrNykterstein/json?max=3"

# Test status endpoint
curl "http://localhost:3001/api/games/status"
```

## Usage Examples

### JavaScript Frontend
```javascript
// Fetch PGN games
const response = await fetch('/api/games/DrNykterstein?max=10&rated=true');
const pgnData = await response.text();

// Fetch with metadata
const jsonResponse = await fetch('/api/games/DrNykterstein/json?max=5');
const gameData = await jsonResponse.json();
console.log(`Fetched ${gameData.gameCount} games`);
```

### Python Script
```python
import requests

# Fetch PGN games
response = requests.get('http://localhost:3001/api/games/DrNykterstein', 
                       params={'max': 10, 'rated': 'true'})
pgn_data = response.text
```

## Troubleshooting

### Common Issues

1. **"API token is required" Error**
   - Check if `LICHESS_API_TOKEN` is set in `.env`
   - Verify the token is valid on Lichess

2. **"No response from Lichess API" Error**
   - Check internet connection
   - Verify Lichess API is accessible

3. **Rate Limit Errors**
   - Wait for rate limit reset
   - Reduce request frequency
   - Use cached data when possible

4. **Cache Directory Issues**
   - Check file permissions
   - Ensure disk space is available

### Debug Mode
Set `NODE_ENV=development` for detailed logging:
```bash
NODE_ENV=development npm run dev
```

## API Limitations
- Maximum 100 games per request
- Rate limited by Lichess (typically 50-100 requests/minute)
- Some game data may not be available for older games
- PGN format limitations apply

## Future Enhancements
- [ ] Add support for game streaming
- [ ] Implement more sophisticated caching strategies
- [ ] Add game analysis integration
- [ ] Support for bulk user processing
- [ ] WebSocket support for real-time updates

## Support
For issues or questions about this implementation, please refer to:
- Lichess API documentation: https://lichess.org/api
- This backend's issue tracker
- Contact the development team
