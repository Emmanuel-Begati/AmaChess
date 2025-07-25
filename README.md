# AmaChess - Advanced Chess Learning Platform

![AmaChess Logo](https://amachess.xyz/logo.png)

AmaChess is a comprehensive chess learning platform that combines interactive gameplay, puzzle solving, game analysis, and educational resources. Built with modern web technologies, it offers a seamless chess experience for players of all skill levels.

## 🚀 Live Demo

**Deployed Application**: [https://amachess.xyz](https://amachess.xyz)

## 🎥 Demo Video

[**5-Minute Demo Video**](https://youtu.be/YOUR_VIDEO_ID) - *Coming Soon*

*The demo showcases core functionalities including:*
- Interactive chess gameplay with AI opponents
- Puzzle solving with real-time feedback
- Game analysis and performance tracking
- PDF chess book reader with position analysis
- Lichess integration for live statistics

## 📸 Screenshots

### Dashboard & Home
<img src="amachess-frontend/screenshots/Screenshot 2025-07-24 013244.png" alt="AmaChess Dashboard" width="800">

*Main dashboard showing user statistics, recent games, and performance metrics*

### Interactive Chess Gameplay
<img src="amachess-frontend/screenshots/Screenshot 2025-07-24 042538.png" alt="Chess Gameplay" width="800">

*Play against AI with multiple difficulty levels and real-time analysis*

### Puzzle Training System
<img src="amachess-frontend/screenshots/Screenshot 2025-07-24 094227.png" alt="Puzzle Training" width="800">

*Solve tactical puzzles with hints, themes, and difficulty progression*

<img src="amachess-frontend/screenshots/Screenshot 2025-07-24 094517.png" alt="Puzzle Interface" width="800">

*Clean puzzle interface with move notation and analysis*

### Game Analysis & Learning
<img src="amachess-frontend/screenshots/Screenshot 2025-07-24 101224.png" alt="Game Analysis" width="800">

*Detailed game analysis with move evaluation and recommendations*

<img src="amachess-frontend/screenshots/Screenshot 2025-07-24 101242.png" alt="Learning Interface" width="800">

*Learn from your games with AI-powered insights*

### Chess Library & Book Reader
<img src="amachess-frontend/screenshots/Screenshot 2025-07-24 101312.png" alt="Chess Library" width="800">

*Browse and read chess books with interactive position analysis*

<img src="amachess-frontend/screenshots/Screenshot 2025-07-24 101919.png" alt="Book Reader" width="800">

*PDF chess book reader with position extraction and analysis*

### Settings & Customization
<img src="amachess-frontend/screenshots/Screenshot 2025-07-24 104228.png" alt="Settings" width="800">

*Customize themes, preferences, and account settings*

### Daily Challenges & Statistics
<img src="amachess-frontend/screenshots/Screenshot 2025-07-24 170302.png" alt="Daily Challenges" width="800">

*Daily puzzle challenges with community statistics*

<img src="amachess-frontend/screenshots/Screenshot 2025-07-24 193245.png" alt="Statistics" width="800">

*Detailed performance tracking and progress analytics*

<img src="amachess-frontend/screenshots/Screenshot 2025-07-24 193257.png" alt="Progress Tracking" width="800">

*Track your improvement over time with comprehensive metrics*

## ✨ Key Features

### 🎯 Core Functionalities
- **Interactive Chess Gameplay**: Play against AI with multiple difficulty levels
- **Puzzle Training**: Solve 10,000+ chess puzzles with themes and difficulty levels
- **Game Analysis**: Analyze your games with detailed insights and recommendations
- **Chess Library**: Read and analyze positions from chess books (PDF support)
- **Lichess Integration**: Import and analyze your Lichess games
- **Daily Challenges**: Solve daily puzzles with community statistics
- **Performance Tracking**: Track your progress with detailed statistics

### 🛠 Technical Features
- **Real-time Chess Engine**: Stockfish integration for game analysis
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Themes**: Customizable UI themes
- **PDF Processing**: Advanced chess book parsing and position extraction
- **Database Integration**: PostgreSQL/SQLite with Prisma ORM
- **Authentication**: Secure JWT-based user authentication

## 🏗 Project Structure

```
AmaChess/
├── amachess-frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ChessBoard/     # Chess board components
│   │   │   ├── Modals/         # Modal dialogs
│   │   │   └── UI/             # Basic UI components
│   │   ├── pages/              # Application pages
│   │   ├── services/           # API services
│   │   ├── hooks/              # Custom React hooks
│   │   └── types/              # TypeScript definitions
│   ├── public/                 # Static assets
│   └── package.json
├── amachess-backend/           # Node.js + Express backend
│   ├── src/
│   │   ├── routes/             # API route handlers
│   │   ├── services/           # Business logic services
│   │   ├── middleware/         # Express middleware
│   │   └── utils/              # Utility functions
│   ├── prisma/                 # Database schema and migrations
│   ├── scripts/                # Utility scripts
│   └── package.json
├── Puzzle_Classifier/          # ML puzzle classification
└── chess_vision_service/       # Computer vision for chess boards
```

## 📋 Prerequisites

Before installing AmaChess, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** - [Download here](https://git-scm.com/)
- **PostgreSQL** (optional, SQLite is default) - [Download here](https://postgresql.org/)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/AmaChess.git
cd AmaChess
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd amachess-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env file with your configuration:
# - DATABASE_URL (for PostgreSQL) or leave default for SQLite
# - JWT_SECRET (generate a secure random string)
# - LICHESS_TOKEN (optional, for Lichess integration)
# - OPENAI_API_KEY (optional, for AI features)

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database with puzzles (optional)
npm run db:seed

# Start the backend server
npm run dev
```

The backend will start on `http://localhost:3001`

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend directory
cd amachess-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to:
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001/api`

## 🎮 Usage Guide

### Getting Started
1. **Register/Login**: Create an account or log in to track your progress
2. **Dashboard**: View your statistics, recent games, and progress
3. **Play**: Start a game against AI opponents with different difficulty levels
4. **Puzzles**: Solve tactical puzzles to improve your chess skills
5. **Learn**: Analyze your games and learn from mistakes
6. **Library**: Read chess books and analyze positions

### Key Pages
- **Dashboard**: Overview of your chess progress and statistics
- **Play**: Interactive chess gameplay with AI
- **Puzzles**: Tactical puzzle solving with themes and difficulties
- **Learn**: Game analysis and improvement recommendations
- **Library**: Chess book reader with position analysis
- **Settings**: Customize your preferences and themes

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/amachess"
# or for SQLite: DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET="your-super-secure-jwt-secret-key"

# External APIs (Optional)
LICHESS_TOKEN="your-lichess-api-token"
OPENAI_API_KEY="your-openai-api-key"

# Server Configuration
PORT=3001
NODE_ENV=development
```

#### Frontend
The frontend automatically connects to the backend on `localhost:3001`. For production deployment, update the API base URL in the configuration files.

## 🧪 Testing

### Backend Testing
```bash
cd amachess-backend

# Test API endpoints
npm run test-api

# Test Stockfish integration
npm run test-stockfish

# Test Lichess integration
npm run test-lichess

# Test database connection
node check-db.js
```

### Frontend Testing
```bash
cd amachess-frontend

# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Related Files

### Core Application Files
- `amachess-frontend/src/App.tsx` - Main React application
- `amachess-backend/src/server.js` - Express server entry point
- `amachess-backend/prisma/schema.prisma` - Database schema
- `amachess-frontend/src/services/api.ts` - API service layer

### Chess Engine & Analysis
- `amachess-backend/src/services/stockfishService.js` - Chess engine integration
- `amachess-frontend/src/components/ChessBoard/` - Chess board components
- `amachess-backend/src/services/lichessService.js` - Lichess API integration

### Puzzle System
- `amachess-backend/src/services/databasePuzzleService.js` - Puzzle management
- `amachess-backend/utils/lichess_db_puzzle.csv` - Puzzle database (10,000+ puzzles)
- `amachess-frontend/src/pages/PuzzlesWithSidebar.tsx` - Puzzle interface

### Book Reader & PDF Processing
- `amachess-frontend/src/pages/BookReader.tsx` - PDF chess book reader
- `amachess-backend/src/services/pdfParsingService.js` - PDF processing
- `amachess-frontend/src/components/ChessPDFViewer.tsx` - PDF viewer component

### Authentication & User Management
- `amachess-backend/src/routes/auth.js` - Authentication routes
- `amachess-backend/src/middleware/auth.js` - JWT middleware
- `amachess-frontend/src/services/authService.ts` - Frontend auth service

### Configuration Files
- `amachess-frontend/package.json` - Frontend dependencies
- `amachess-backend/package.json` - Backend dependencies
- `amachess-frontend/vite.config.ts` - Vite build configuration
- `amachess-backend/.env` - Environment variables

## 🚀 Deployment

### Production Build

#### Frontend
```bash
cd amachess-frontend
npm run build
# Deploy the 'dist' folder to your hosting service
```

#### Backend
```bash
cd amachess-backend
# Set NODE_ENV=production in your environment
# Set up PostgreSQL database
npm run db:migrate:prod
npm start
```

### Deployment Options
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Backend**: Railway, Heroku, DigitalOcean, AWS
- **Database**: PostgreSQL on Railway, Supabase, or AWS RDS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Lichess** - For providing the puzzle database and API
- **Stockfish** - For the powerful chess engine
- **React Chess Board** - For the interactive chess board component
- **Chess.js** - For chess game logic and validation

## 📞 Support

For support, email support@amachess.xyz or create an issue on GitHub.

---

**Built with ❤️ for the chess community**
