# AmaChess - Single Server Deployment (Port 3060)

Your AmaChess application is now configured to run on a single server at **port 3060**.

## ✅ What's Working

- ✅ Backend API running on port 3060
- ✅ Frontend served from the same port
- ✅ Database connected (SQLite)
- ✅ All API calls use relative paths (`/api`)
- ✅ AI features enabled (Groq LLaMA 3.3)

## 🚀 Quick Commands

### Start the server
```bash
./start-server.sh
```

### Rebuild frontend (after making changes)
```bash
./rebuild-frontend.sh
```

### Access the application
- **Main app**: http://localhost:3060
- **API health**: http://localhost:3060/api/health

## 📁 Key Files

- `amachess-backend/.env` - Backend configuration (PORT=3060, DATABASE_URL)
- `amachess-frontend/.env` - Frontend configuration (VITE_API_BASE_URL=/api)
- `amachess-backend/src/server.js` - Server setup with static file serving
- `amachess-frontend/dist/` - Built frontend files (served by backend)

## 🔄 Development Workflow

### Making Frontend Changes
1. Edit files in `amachess-frontend/src/`
2. Rebuild: `./rebuild-frontend.sh`
3. Refresh browser (the backend automatically serves the new build)

### Making Backend Changes
1. Edit files in `amachess-backend/src/`
2. Restart server: Stop current process and run `./start-server.sh`

## 🛠️ Scripts Created

- `start-server.sh` - Start the backend server (serves both API and frontend)
- `rebuild-frontend.sh` - Rebuild the frontend after changes
- `setup-database.sh` - PostgreSQL setup helper (if you want to switch from SQLite)

## 📝 Configuration Changes Made

### Frontend
- Updated all API URLs to use `import.meta.env.VITE_API_BASE_URL || '/api'`
- Changed `.env` to use relative path: `VITE_API_BASE_URL=/api`
- Updated Vite proxy to point to port 3060

### Backend
- Changed database from PostgreSQL to SQLite for easier setup
- Updated `.env` with `DATABASE_URL="file:./dev.db"`
- Server already configured to serve static files from `amachess-frontend/dist`

## 🔐 Security Notes

Before deploying to production:
1. Change `JWT_SECRET` in `amachess-backend/.env`
2. Update `CORS_ORIGIN` to your actual domain
3. Consider switching to PostgreSQL for better performance
4. Use environment-specific `.env` files

## 📚 Documentation

- `QUICK-START.md` - Detailed setup guide
- `DEPLOYMENT.md` - Deployment information
- This file - Quick reference

## 🐛 Troubleshooting

If you see connection errors:
1. Make sure the server is running: `./start-server.sh`
2. Clear browser cache and hard refresh (Ctrl+Shift+R)
3. Check server logs for errors
4. Verify database is initialized: `cd amachess-backend && npm run db:migrate`

## 🎯 Next Steps

1. Create a user account at http://localhost:3060
2. Import puzzles: `cd amachess-backend && npm run db:seed`
3. Start playing chess!

---

**Server Status**: Running on port 3060 ✅
**Database**: SQLite (dev.db) ✅
**Frontend**: Built and served ✅
