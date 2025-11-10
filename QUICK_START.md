# AmaChess Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Setup Backend Environment
```bash
cd amachess-backend
cp .env.example .env
# Edit .env file if needed (defaults work for local development)
npm run db:generate
npm run db:migrate
cd ..
```

### 3. Start the Application
```bash
# Option A: Production mode (recommended)
npm run build:start

# Option B: Development mode
npm run dev
```

## 🌐 Access Your Application

- **Application**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health

## 🛠 Development Commands

- `npm run dev` - Start backend in development mode
- `npm run dev:frontend` - Start frontend development server only
- `npm run dev:backend` - Start backend development server only
- `npm run build` - Build frontend for production
- `npm start` - Start production server
- `npm run deploy` - Full deployment script

## 📝 Notes

- The backend now serves both the frontend and API from port 3001
- In development mode, the frontend proxies API calls to the backend
- All routes starting with `/api/` are handled by the backend
- All other routes serve the React frontend (SPA routing)

## 🔧 Troubleshooting

**Port already in use?**
```bash
# Kill process on port 3001
npx kill-port 3001
```

**Database issues?**
```bash
cd amachess-backend
npm run db:reset
npm run db:migrate
```

**Build issues?**
```bash
# Clean install
rm -rf node_modules amachess-*/node_modules
npm run install:all
```