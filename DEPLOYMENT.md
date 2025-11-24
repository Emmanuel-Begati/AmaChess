# AmaChess Deployment Guide

## Single Server Setup (Port 3060)

Your backend now serves both the API and the frontend on **port 3060**.

### Quick Start

1. **Build the frontend** (do this whenever you make frontend changes):
   ```bash
   cd amachess-frontend
   npm run build
   cd ..
   ```

2. **Start the server**:
   ```bash
   ./start-server.sh
   ```
   
   Or manually:
   ```bash
   cd amachess-backend
   npm start
   ```

3. **Access the application**:
   - Open your browser to: `http://localhost:3060`
   - API endpoints are available at: `http://localhost:3060/api/*`

### How It Works

- The backend (Express) serves the built React app from `amachess-frontend/dist`
- All `/api/*` routes go to the backend API
- All other routes serve the React app (SPA routing)
- The frontend makes API calls to `/api` (relative paths), which are handled by the same server

### Development vs Production

**Development Mode** (separate servers):
- Frontend dev server: `cd amachess-frontend && npm run dev` (port 5173)
- Backend dev server: `cd amachess-backend && npm run dev` (port 3060)
- Frontend proxies API calls to backend

**Production Mode** (single server):
- Build frontend: `cd amachess-frontend && npm run build`
- Start backend: `cd amachess-backend && npm start` (port 3060)
- Backend serves both frontend and API

### Configuration Files

- `amachess-backend/.env` - Backend configuration (PORT=3060)
- `amachess-frontend/.env` - Frontend configuration (VITE_API_BASE_URL=/api)
- `amachess-backend/src/server.js` - Server setup with static file serving

### Rebuilding Frontend

Whenever you make changes to the frontend code, rebuild it:
```bash
cd amachess-frontend
npm run build
```

Then restart the backend server to serve the new build.

### Environment Variables

Make sure your `amachess-backend/.env` has:
```
PORT=3060
CORS_ORIGIN=http://localhost:3060
```

For production deployment, update `CORS_ORIGIN` to your actual domain.
