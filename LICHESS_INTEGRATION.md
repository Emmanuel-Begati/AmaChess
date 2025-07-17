# Lichess Integration for Dashboard

This integration allows users to display their real-time Lichess statistics in the AmaChess dashboard.

## Features

✅ **Real-time Lichess Statistics**: Display current rating, games played, and win rate
✅ **Multiple Time Controls**: Support for Rapid, Blitz, and Bullet ratings
✅ **User Profile Integration**: Lichess username stored during registration
✅ **Fallback Handling**: Graceful fallback when Lichess API is unavailable
✅ **Error Handling**: Proper error messages for invalid usernames or API issues

## How It Works

### 1. User Registration
- Users can provide their Lichess username during registration
- Username is stored in the `users` table in the `lichessUsername` field

### 2. Dashboard Integration
- When accessing `/user/dashboard`, the backend fetches live Lichess stats
- Uses the Lichess API via `LichessService.getUserStats()`
- Returns both dashboard data and live Lichess statistics

### 3. Frontend Display
- Dashboard shows live rating and games played data
- Displays the highest available rating (Rapid > Blitz > Bullet)
- Shows total games played and calculated win rate
- Graceful fallback to default values if no Lichess data

## API Endpoints

### Backend: `/api/user/dashboard` (Protected)
```javascript
// Response includes:
{
  "success": true,
  "data": {
    "user": { ... },
    "stats": {
      "currentRating": 1650,      // From Lichess or fallback
      "gamesPlayed": 235,         // From Lichess or fallback
      "winRate": 68,              // From Lichess or fallback
      "lichess": {                // Nested Lichess data
        "rating": 1650,
        "gamesPlayed": 235,
        "winRate": 68,
        "online": true,
        "title": "GM"
      }
    },
    "lichessStats": {             // Full Lichess API response
      "username": "DrNykterstein",
      "rating": {
        "rapid": 3200,
        "blitz": 3100,
        "bullet": 2900
      },
      "gameCount": {
        "total": 15000,
        "rapid": 5000,
        "blitz": 8000,
        "bullet": 2000
      },
      "winRate": 0.68,
      "online": true,
      "title": "GM"
    }
  }
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lichessUsername" TEXT,          -- Stores Lichess username
    "chesscomUsername" TEXT,
    "country" TEXT,
    "fideRating" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
```

## Frontend Integration

### Dashboard Component
```tsx
// Fetches dashboard data including Lichess stats
useEffect(() => {
  const fetchDashboardData = async () => {
    const response = await axios.get('/user/dashboard');
    setDashboardData(response.data.data);
    
    // Set Lichess stats from dashboard response
    if (response.data.data.lichessStats) {
      setLichessStats(response.data.data.lichessStats);
    }
  };
  
  fetchDashboardData();
}, []);
```

### Display Logic
```tsx
// Shows current rating from Lichess
<p className="text-3xl font-bold text-white">
  {lichessStats?.rating?.rapid || 
   lichessStats?.rating?.blitz || 
   lichessStats?.rating?.bullet || 'N/A'}
</p>

// Shows total games played
<p className="text-3xl font-bold text-white">
  {lichessStats?.gameCount?.total || 0}
</p>

// Shows win rate
<p className="text-gray-400 text-sm">
  {Math.round((lichessStats?.winRate || 0) * 100)}% win rate
</p>
```

## Testing

Run the integration test:
```bash
cd amachess-backend
node scripts/test-lichess-integration.js
```

This test will:
1. Register a test user with a Lichess username
2. Fetch dashboard data 
3. Verify Lichess stats are included
4. Display the results

## Error Handling

### Backend
- Graceful fallback if Lichess API is unavailable
- Doesn't fail dashboard request if Lichess API fails
- Logs errors for debugging

### Frontend
- Shows appropriate loading states
- Displays helpful error messages
- Falls back to default values when needed

## Security Considerations

- Lichess usernames are public information
- API calls to Lichess are made server-side only
- User authentication required for dashboard access
- No sensitive Lichess data is stored

## Rate Limiting

- Lichess API has rate limits (check their documentation)
- Consider implementing caching for frequently accessed users
- The `LichessService` includes basic caching mechanisms

## Future Enhancements

🔮 **Possible Improvements**:
- Cache Lichess data to reduce API calls
- Support for Chess.com integration
- Real-time game notifications
- Historical rating charts
- Recent games display with analysis
- Opening statistics from Lichess games

## Troubleshooting

### Common Issues

1. **"Lichess user not found"**
   - Check if the username is spelled correctly
   - Verify the user exists on Lichess.org

2. **"Failed to load Lichess statistics"**
   - Lichess API might be temporarily unavailable
   - Check network connectivity
   - Verify LICHESS_API_TOKEN in .env (if using authenticated endpoints)

3. **No Lichess stats showing**
   - User might not have set a Lichess username
   - Dashboard will show fallback data instead

### Debug Mode
Add logging to see Lichess API responses:
```javascript
// In protected.js
console.log('Fetching stats for:', user.lichessUsername);
console.log('Lichess response:', lichessStats);
```
