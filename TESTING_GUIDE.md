# Testing Guide - Dashboard Optimization

## 🧪 How to Test the Optimizations

### **Prerequisites**
- Backend server running on `http://localhost:5000`
- Frontend running on `http://localhost:5173` (or your configured port)
- Valid Lichess username configured in user profile

---

## 📊 Test 1: Measure Load Time Improvement

### **Step 1: Clear All Caches**
```bash
# Clear browser cache
# Chrome: Ctrl+Shift+Delete → Clear browsing data
# Firefox: Ctrl+Shift+Delete → Clear recent history

# Restart backend to clear in-memory cache
cd amachess-backend
npm run dev
```

### **Step 2: Measure First Load (Cold Cache)**
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Navigate to dashboard: `http://localhost:5173/dashboard`
4. Look for these API calls:
   - `/api/user/dashboard`
   - `/api/puzzles/user/{userId}/stats`
   - `/api/puzzles/user/{userId}/analytics`
   - `/api/puzzles/leaderboard`

**Expected Results:**
- All 4 API calls should start **simultaneously** (parallel)
- Total load time: **~1.2 seconds**
- Backend console shows: "Fetching stats for user: {username}"

### **Step 3: Measure Second Load (Warm Cache)**
1. Keep DevTools open
2. Refresh the dashboard (F5)
3. Check Network tab again

**Expected Results:**
- Same 4 API calls
- Total load time: **~0.2 seconds** (much faster!)
- Backend console shows: "✅ Cache hit for stats: {username}"

---

## 📈 Test 2: Verify Parallel Processing

### **Backend Logs**
Watch the backend console when loading dashboard:

**Before Optimization (Sequential):**
```
Fetching stats for user: testuser
✅ Successfully fetched stats
Fetching rating analytics for user: testuser
✅ Successfully fetched analytics
Fetching games for user: testuser
✅ Successfully fetched games
```
*Each line appears one after another with delays*

**After Optimization (Parallel):**
```
Fetching stats for user: testuser
Fetching rating analytics for user: testuser
Fetching games for user: testuser
✅ Successfully fetched stats
✅ Successfully fetched analytics
✅ Successfully fetched games
```
*All "Fetching" lines appear together, then all "Successfully" lines*

---

## 🎯 Test 3: Cache Performance Monitoring

### **View Cache Statistics**

**Option 1: API Endpoint**
```bash
# Get cache statistics (requires authentication)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/user/cache/stats
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "uptime": 300,
    "caches": {
      "stats": {
        "hits": 15,
        "misses": 3,
        "hitRate": "83.33%",
        "avgResponseTime": "150.25ms"
      },
      "analytics": {
        "hits": 12,
        "misses": 3,
        "hitRate": "80.00%",
        "avgResponseTime": "200.50ms"
      },
      "games": {
        "hits": 10,
        "misses": 2,
        "hitRate": "83.33%",
        "avgResponseTime": "120.75ms"
      }
    },
    "overall": {
      "totalHits": 37,
      "totalMisses": 8,
      "overallHitRate": "82.22%"
    },
    "recommendations": [
      "✅ Excellent cache hit rate (>80%). Cache is working optimally."
    ]
  }
}
```

**Option 2: Backend Console (Development Mode)**
In development, cache stats are automatically printed every 5 minutes:

```
============================================================
📊 CACHE PERFORMANCE METRICS
============================================================
⏱️  Uptime: 300s

📈 Stats Cache:
   Hits: 15 | Misses: 3
   Hit Rate: 83.33% | Avg Time: 150.25ms

📈 Analytics Cache:
   Hits: 12 | Misses: 3
   Hit Rate: 80.00% | Avg Time: 200.50ms

📈 Games Cache:
   Hits: 10 | Misses: 2
   Hit Rate: 83.33% | Avg Time: 120.75ms

🎯 Overall:
   Total Hits: 37 | Total Misses: 8
   Overall Hit Rate: 82.22%
============================================================

💡 Recommendations:
   ✅ Excellent cache hit rate (>80%). Cache is working optimally.
```

---

## 🔍 Test 4: Error Handling (Graceful Degradation)

### **Simulate Lichess API Failure**

**Step 1: Temporarily break Lichess API token**
Edit `amachess-backend/.env`:
```env
LICHESS_API_TOKEN=invalid_token_for_testing
```

**Step 2: Reload Dashboard**
- Dashboard should still load
- Puzzle data should display correctly
- Lichess section shows "No data available" or fallback data
- No complete page crash

**Step 3: Check Console**
Backend should show:
```
Error fetching Lichess stats: Invalid API token
Error fetching Lichess analytics: Invalid API token
Error fetching Lichess games: Invalid API token
```

Frontend should show:
```
Failed to fetch Lichess stats: fulfilled
Failed to fetch Lichess analytics: fulfilled
Failed to fetch Lichess games: fulfilled
```

**Step 4: Restore Token**
```env
LICHESS_API_TOKEN=your_actual_token
```

---

## ⚡ Test 5: Cache TTL (Time-To-Live)

### **Test Cache Expiration**

**Step 1: Load Dashboard**
- First load fetches from API
- Backend shows: "Fetching stats for user: {username}"

**Step 2: Wait 4 Minutes**
- Reload dashboard
- Should use cached data
- Backend shows: "✅ Cache hit for stats: {username}"

**Step 3: Wait 6 Minutes (Total)**
- Reload dashboard
- Cache expired, fetches from API again
- Backend shows: "Fetching stats for user: {username}"

**Adjust Cache TTL:**
Edit `amachess-backend/src/services/lichessService.js`:
```javascript
// Change from 5 minutes to 1 minute for testing
this.CACHE_TTL = 1 * 60 * 1000; // 1 minute
```

---

## 🚀 Test 6: Load Testing (Multiple Users)

### **Simulate Multiple Dashboard Loads**

**Option 1: Manual Testing**
1. Open 5 browser tabs
2. Load dashboard in each tab simultaneously
3. Check backend logs - should see parallel processing

**Option 2: Automated Testing**
```bash
# Install Apache Bench (if not installed)
# Ubuntu: sudo apt-get install apache2-utils
# Mac: brew install ab

# Test 10 concurrent requests
ab -n 10 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/user/dashboard
```

**Expected Results:**
```
Concurrency Level:      10
Time taken for tests:   1.234 seconds
Complete requests:      10
Failed requests:        0
Requests per second:    8.10 [#/sec] (mean)
Time per request:       123.4 [ms] (mean)
```

---

## 📊 Performance Benchmarks

### **Target Metrics**

| Metric | Target | Good | Needs Improvement |
|--------|--------|------|-------------------|
| First Load | < 1.5s | < 2s | > 2s |
| Cached Load | < 0.3s | < 0.5s | > 0.5s |
| Cache Hit Rate | > 70% | > 50% | < 50% |
| API Response Time | < 1000ms | < 1500ms | > 1500ms |

### **How to Measure**

**Browser DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Look at "Load" time at bottom

**Backend Logs:**
```
Fetching stats for user: testuser
✅ Successfully fetched stats (took 850ms)
```

---

## 🐛 Troubleshooting

### **Issue: Dashboard loads slowly even with cache**

**Check 1: Verify cache is working**
```bash
# Check backend logs for cache hits
# Should see: "✅ Cache hit for stats: username"
```

**Check 2: Verify parallel processing**
```bash
# All "Fetching" logs should appear together
# Not one after another
```

**Check 3: Check cache TTL**
```javascript
// In lichessService.js
console.log('Cache TTL:', this.CACHE_TTL); // Should be 300000 (5 minutes)
```

### **Issue: Cache hit rate is low (<50%)**

**Possible Causes:**
1. Cache TTL too short
2. Users not revisiting dashboard within TTL window
3. Many unique users (each needs their own cache entry)

**Solutions:**
1. Increase cache TTL to 10-15 minutes
2. Implement background refresh
3. Consider Redis for shared cache

### **Issue: Lichess API rate limit errors**

**Check Rate Limits:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://lichess.org/api/account
```

**Solutions:**
1. Increase cache TTL
2. Implement request deduplication
3. Add rate limiting middleware

---

## ✅ Success Criteria

Your optimization is working correctly if:

- ✅ Dashboard loads in < 1.5 seconds (first load)
- ✅ Dashboard loads in < 0.3 seconds (cached load)
- ✅ Backend logs show parallel API calls
- ✅ Cache hit rate > 70% after 10 dashboard loads
- ✅ No errors in console
- ✅ Partial data loads if Lichess API fails

---

## 📝 Reporting Issues

If you encounter issues, collect this information:

1. **Browser Console Logs**
   - Open DevTools → Console
   - Copy any errors

2. **Backend Logs**
   - Check terminal running backend
   - Copy relevant error messages

3. **Network Timing**
   - DevTools → Network tab
   - Screenshot of API call timings

4. **Cache Statistics**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/user/cache/stats
   ```

5. **Environment**
   - Node version: `node --version`
   - npm version: `npm --version`
   - OS: Windows/Mac/Linux
