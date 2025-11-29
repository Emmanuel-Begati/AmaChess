# AmaChess Architecture Guide

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                    amachess-frontend/src/                        │
├─────────────────────────────────────────────────────────────────┤
│  Pages:                                                          │
│  - Dashboard.tsx      → User dashboard with stats                │
│  - Puzzles.tsx        → Puzzle solving interface                 │
│  - Learn.tsx          → Learning & analysis                      │
│  - Library.tsx        → Chess books library                      │
│                                                                   │
│  Components:                                                     │
│  - ChessGame          → Chess board component                    │
│  - LichessProgressStats → Lichess stats display                  │
│  - Header/Footer      → Navigation                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTP Requests
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express.js)                        │
│                    amachess-backend/src/                         │
├─────────────────────────────────────────────────────────────────┤
│  Routes (API Endpoints):                                         │
│  ├─ auth.js           → /api/auth/*                             │
│  ├─ protected.js      → /api/user/*                             │
│  ├─ lichess.js        → /api/lichess/*                          │
│  ├─ puzzles.js        → /api/puzzles/*                          │
│  ├─ games.js          → /api/user-games/*                       │
│  ├─ stockfish.js      → /api/stockfish/*                        │
│  ├─ coach.js          → /api/coach/*                            │
│  └─ ... (other routes)                                           │
│                                                                   │
│  Services (Business Logic):                                      │
│  ├─ lichessService.js        → Fetch Lichess data               │
│  ├─ databasePuzzleService.js → Puzzle operations                │
│  ├─ stockfishService.js      → Chess engine                     │
│  ├─ openaiService.js         → AI chat/coaching                 │
│  └─ ... (other services)                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA LAYER                                    │
├─────────────────────────────────────────────────────────────────┤
│  Database (PostgreSQL via Prisma):                              │
│  ├─ Users             → User accounts                            │
│  ├─ Puzzles           → Chess puzzles                            │
│  ├─ PuzzleAttempts    → User puzzle history                      │
│  ├─ Games             → Saved games                              │
│  └─ UserStats         → User statistics                          │
│                                                                   │
│  External APIs:                                                  │
│  ├─ Lichess API       → User stats, games, ratings              │
│  ├─ Groq API          → AI chat & coaching                      │
│  └─ Stockfish Engine  → Chess analysis                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Request Flow Examples

### **Example 1: User Loads Dashboard**

```
┌──────────┐
│ Browser  │
└────┬─────┘
     │ 1. GET /dashboard
     ↓
┌────────────────┐
│ Dashboard.tsx  │
└────┬───────────┘
     │ 2. useEffect() triggers API calls
     ↓
┌─────────────────────────────────────────┐
│ Parallel API Calls:                     │
│ - GET /api/user/dashboard               │
│ - GET /api/puzzles/user/{id}/stats      │
│ - GET /api/puzzles/user/{id}/analytics  │
│ - GET /api/puzzles/leaderboard          │
└────┬────────────────────────────────────┘
     │ 3. Backend processes requests
     ↓
┌──────────────────┐
│ protected.js     │ → authenticateToken middleware
└────┬─────────────┘
     │ 4. Fetch Lichess data (queued)
     ↓
┌─────────────────────────────────────────┐
│ lichessService.js                       │
│ - getUserStats() → Check cache          │
│ - getUserRatingAnalytics() → Check cache│
│ - getRecentRapidGames() → Check cache   │
└────┬────────────────────────────────────┘
     │ 5. If cache miss, queue API request
     ↓
┌──────────────────┐
│ Request Queue    │ → One request at a time
└────┬─────────────┘
     │ 6. Fetch from Lichess API
     ↓
┌──────────────────┐
│ Lichess API      │
└────┬─────────────┘
     │ 7. Cache result (5 min TTL)
     ↓
┌──────────────────┐
│ Cache (Map)      │
└────┬─────────────┘
     │ 8. Return data to frontend
     ↓
┌──────────────────┐
│ Dashboard.tsx    │ → Display data
└──────────────────┘
```

### **Example 2: User Solves Puzzle**

```
┌──────────┐
│ Browser  │
└────┬─────┘
     │ 1. Click "Get Puzzle"
     ↓
┌────────────────┐
│ Puzzles.tsx    │
└────┬───────────┘
     │ 2. GET /api/puzzles/random?difficulty=intermediate
     ↓
┌──────────────────┐
│ puzzles.js       │
└────┬─────────────┘
     │ 3. Call service
     ↓
┌─────────────────────────────────┐
│ databasePuzzleService.js        │
│ - getRandomPuzzle(filters)      │
└────┬────────────────────────────┘
     │ 4. Query database
     ↓
┌──────────────────┐
│ Prisma → PostgreSQL │
│ SELECT * FROM puzzles           │
│ WHERE difficulty = 'intermediate'│
│ ORDER BY RANDOM()               │
│ LIMIT 1                         │
└────┬─────────────┘
     │ 5. Return puzzle
     ↓
┌────────────────┐
│ Puzzles.tsx    │ → Display puzzle
└────┬───────────┘
     │ 6. User makes move
     ↓
┌────────────────┐
│ Puzzles.tsx    │
└────┬───────────┘
     │ 7. POST /api/user/puzzles/stats/update
     ↓
┌──────────────────┐
│ userPuzzles.js   │
└────┬─────────────┘
     │ 8. Update user stats
     ↓
┌─────────────────────────────────┐
│ databasePuzzleService.js        │
│ - updateUserStats()             │
└────┬────────────────────────────┘
     │ 9. Update database
     ↓
┌──────────────────┐
│ Prisma → PostgreSQL │
│ UPDATE user_stats               │
│ SET total_solved = total_solved + 1 │
└────┬─────────────┘
     │ 10. Return updated stats
     ↓
┌────────────────┐
│ Puzzles.tsx    │ → Update UI
└────────────────┘
```

---

## 🔐 Authentication Flow

```
┌──────────┐
│ User     │
└────┬─────┘
     │ 1. Enter email/password
     ↓
┌────────────────┐
│ Login.tsx      │
└────┬───────────┘
     │ 2. POST /api/auth/login
     ↓
┌──────────────────┐
│ auth.js          │
└────┬─────────────┘
     │ 3. Validate credentials
     ↓
┌─────────────────────────────────┐
│ authController.js               │
│ - Check email/password          │
│ - Generate JWT token            │
└────┬────────────────────────────┘
     │ 4. Return token
     ↓
┌────────────────┐
│ Login.tsx      │
└────┬───────────┘
     │ 5. Store token in localStorage
     ↓
┌──────────────────┐
│ localStorage     │
│ authToken: "jwt..."│
└────┬─────────────┘
     │ 6. Redirect to dashboard
     ↓
┌────────────────┐
│ Dashboard.tsx  │
└────┬───────────┘
     │ 7. GET /api/user/dashboard
     │    Headers: { Authorization: "Bearer jwt..." }
     ↓
┌──────────────────┐
│ protected.js     │
└────┬─────────────┘
     │ 8. authenticateToken middleware
     ↓
┌─────────────────────────────────┐
│ auth.js (middleware)            │
│ - Verify JWT token              │
│ - Decode user info              │
│ - Attach to req.user            │
└────┬────────────────────────────┘
     │ 9. If valid, proceed to route
     ↓
┌──────────────────┐
│ Route Handler    │ → Access req.user.id
└──────────────────┘
```

---

## 💾 Caching Strategy

```
┌──────────────────────────────────────────────────────────────┐
│                    CACHING FLOW                               │
└──────────────────────────────────────────────────────────────┘

Request comes in
     ↓
┌──────────────────┐
│ Check Cache      │
│ (Map with TTL)   │
└────┬─────────────┘
     │
     ├─ Cache Hit (data < 5 min old)
     │  ↓
     │  Return cached data (0.2s) ✅
     │
     └─ Cache Miss (no data or expired)
        ↓
        Queue API request
        ↓
        Fetch from Lichess API (1.2s)
        ↓
        Store in cache with timestamp
        ↓
        Return fresh data

Next request (within 5 min):
     ↓
Cache Hit → Return instantly (0.2s) ✅
```

### **Cache Structure**

```javascript
// In-memory cache (Map)
{
  "stats_begati": {
    data: { username: "begati", rating: { rapid: 1650 }, ... },
    timestamp: 1732500000000
  },
  "analytics_begati": {
    data: { peakRatings: { rapid: 1700 }, ... },
    timestamp: 1732500000000
  },
  "games_begati_5": {
    data: [ { id: "abc123", ... }, ... ],
    timestamp: 1732500000000
  }
}

// TTL Check
if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
  return cached.data; // Cache hit
} else {
  // Cache expired, fetch fresh data
}
```

---

## 🚦 Request Queue (Rate Limiting)

```
┌──────────────────────────────────────────────────────────────┐
│              LICHESS API REQUEST QUEUE                        │
└──────────────────────────────────────────────────────────────┘

Problem: Lichess only allows 1 request at a time

Solution: Request Queue

┌─────────────────────────────────────────────────────────────┐
│ Multiple requests come in simultaneously:                    │
│ - getUserStats()                                             │
│ - getUserRatingAnalytics()                                   │
│ - getRecentGames()                                           │
└────┬────────────────────────────────────────────────────────┘
     │ All added to queue
     ↓
┌──────────────────┐
│ Request Queue    │
│ [req1, req2, req3]│
└────┬─────────────┘
     │ Process one at a time
     ↓
Execute req1 → Wait 100ms → Execute req2 → Wait 100ms → Execute req3
     ↓              ↓              ↓
  Result 1      Result 2      Result 3
     ↓              ↓              ↓
  Resolve       Resolve       Resolve
  Promise       Promise       Promise

Result: All requests succeed, no 429 errors ✅
```

---

## 📁 File Organization

```
amachess-backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js      # Prisma setup
│   │   ├── groq.js          # AI config
│   │   └── logger.js        # Logging
│   │
│   ├── middleware/          # Express middleware
│   │   └── auth.js          # JWT authentication
│   │
│   ├── routes/              # API endpoints
│   │   ├── auth.js          # Login/register
│   │   ├── protected.js     # User dashboard
│   │   ├── lichess.js       # Lichess data
│   │   ├── puzzles.js       # Puzzles
│   │   ├── games.js         # Game storage
│   │   └── ... (others)
│   │
│   ├── services/            # Business logic
│   │   ├── lichessService.js
│   │   ├── databasePuzzleService.js
│   │   ├── stockfishService.js
│   │   └── ... (others)
│   │
│   ├── utils/               # Utilities
│   │   └── cacheMonitor.js  # Cache tracking
│   │
│   └── server.js            # Main entry point
│
├── prisma/                  # Database schema
│   └── schema.prisma
│
└── package.json             # Dependencies
```

---

## 🎯 Key Concepts

### **1. Routes = API Endpoints**
- Handle HTTP requests (GET, POST, PUT, DELETE)
- Validate input
- Call services
- Return responses

### **2. Services = Business Logic**
- Reusable functions
- Database operations
- External API calls
- Data processing

### **3. Middleware = Request Interceptors**
- Run before route handlers
- Authentication (check JWT)
- Logging
- Error handling

### **4. Prisma = Database ORM**
- Type-safe database queries
- Automatic migrations
- Model relationships

---

## 🔄 Data Flow Summary

```
User Action
    ↓
Frontend Component
    ↓
API Request (axios/fetch)
    ↓
Backend Route
    ↓
Middleware (auth, validation)
    ↓
Service (business logic)
    ↓
Database/External API
    ↓
Response
    ↓
Frontend Update
    ↓
UI Renders
```

---

## 🎯 Understanding Any Feature

**Step-by-Step Process:**

1. **Find the frontend component** (e.g., `Dashboard.tsx`)
2. **Look for API calls** (e.g., `axios.get('/api/user/dashboard')`)
3. **Find the backend route** (e.g., `src/routes/protected.js`)
4. **Follow the service calls** (e.g., `lichessService.getUserStats()`)
5. **Check the service file** (e.g., `src/services/lichessService.js`)
6. **See the database/API operations** (Prisma queries or axios calls)

**Example: Tracing Puzzle Feature**

```
1. Frontend: Puzzles.tsx
   → axios.get('/api/puzzles/random')

2. Backend Route: src/routes/puzzles.js
   → router.get('/random', async (req, res) => { ... })

3. Service Call: databasePuzzleService.getRandomPuzzle(filters)

4. Service File: src/services/databasePuzzleService.js
   → async getRandomPuzzle(filters, userId) { ... }

5. Database Query:
   → await prisma.puzzle.findFirst({ where: { ... } })

6. Response flows back up the chain
```

---

**Your codebase is now clean, organized, and easy to understand! 🎉**
