import type { Move } from 'chess.js';

// Common types and interfaces for the AmaChess application

// Auth related types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  lichessUsername?: string;
  chesscomUsername?: string;
  country?: string;
  fideRating?: number;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; data?: any; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  updateProfile?: (userData: Partial<User>) => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name?: string;
  lichessUsername?: string;
  chesscomUsername?: string;
  country?: string;
  fideRating?: string;
}

// Chess related types
export interface ChessMove {
  from: string;
  to: string;
  promotion?: string;
  piece?: string;
  captured?: string;
  san?: string;
  flags?: string;
}

export interface ChessGameState {
  fen: string;
  playerColor: 'white' | 'black';
  isPlayerTurn: boolean;
  status: 'active' | 'checkmate' | 'stalemate' | 'draw' | 'resigned';
  thinking: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  evaluation: number | null;
}

export interface StockfishAnalysis {
  bestMove: string;
  evaluation: number;
  depth: number;
  timeUsed?: number;
  pv?: string[];
}

// Game analysis types
export interface GameAnalysis {
  gameMetadata: GameMetadata;
  moveAnalysis: MoveAnalysis[];
  overallStats: GameStats;
  openingInfo?: OpeningInfo;
  endgameInfo?: EndgameInfo;
}

export interface GameMetadata {
  white: string;
  black: string;
  result: string;
  date: string;
  event?: string;
  site?: string;
  round?: string;
  eco?: string;
  timeControl?: string;
}

export interface MoveAnalysis {
  moveNumber: number;
  move: string;
  fen: string;
  evaluation: number;
  isBlunder?: boolean;
  isMistake?: boolean;
  isInaccuracy?: boolean;
  bestMove?: string;
  comment?: string;
}

export interface GameStats {
  totalMoves: number;
  averageTime?: number;
  blunders: number;
  mistakes: number;
  inaccuracies: number;
  accuracy: number;
  openingAccuracy?: number;
  middlegameAccuracy?: number;
  endgameAccuracy?: number;
}

export interface OpeningInfo {
  name: string;
  eco: string;
  moves: string[];
}

export interface EndgameInfo {
  type: string;
  evaluation: number;
  technique?: string;
}

// Puzzle types
export interface ChessPuzzle {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
  solution: string[];
  description?: string;
}

// Preferences types
export interface UserPreferences {
  theme: 'light' | 'dark';
  boardTheme: string;
  pieceSet: string;
  soundEnabled: boolean;
  showLegalMoves: boolean;
  autoPromoteToQueen: boolean;
  boardFlipped: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  showCoordinates: boolean;
  highlightMoves: boolean;
  soundEffects: boolean;
  dailyPuzzleReminders: boolean;
  gameAnalysisReady: boolean;
  language: string;
}

export interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

// Component prop types
export interface ChessBoardProps {
  width?: number;
  position: string;
  onMove?: (move: Move, newFen: string) => void;
  interactive?: boolean;
  showNotation?: boolean;
  engineEnabled?: boolean;
  customSquareStyles?: Record<string, React.CSSProperties>;
  orientation?: 'white' | 'black';
  disabled?: boolean;
  lastMove?: ChessMove | null;
}

export interface ModalProps {
  isOpen?: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LichessGame {
  id: string;
  rated: boolean;
  variant: string;
  speed: string;
  perf: string;
  createdAt: number;
  lastMoveAt: number;
  status: string;
  players: {
    white: LichessPlayer;
    black: LichessPlayer;
  };
  moves?: string;
  pgn?: string;
}

export interface LichessPlayer {
  user: {
    name: string;
    id: string;
  };
  rating: number;
  ratingDiff?: number;
}

// Notification types
export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  timestamp: Date;
}

// Book/Library types
export interface ChessBook {
  id: string | number;
  title: string;
  author: string;
  cover: string;
  category?: string;
  rating?: number;
  totalPages?: number;
  description?: string;
  uploadDate?: string;
  positions?: number;
  chapters?: BookChapter[];
}

export interface BookChapter {
  id: string;
  title: string;
  pages: BookPage[];
}

export interface BookPage {
  id: string;
  content: string;
  diagrams?: ChessDiagram[];
}

export interface ChessDiagram {
  fen: string;
  caption?: string;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Dashboard types
export interface DashboardData {
  stats: PlayerStats;
  recentGames: GameSummary[];
  puzzleStats: PuzzleStats;
}

export interface PlayerStats {
  gamesPlayed: number;
  winRate: number;
  currentRating: number;
  favoriteOpening: string;
}

export interface GameSummary {
  id: string;
  opponent: string;
  result: 'win' | 'lose' | 'draw';
  date: string;
  timeControl: string;
  opening?: string;
}

export interface PuzzleStats {
  puzzlesSolved: number;
  puzzleRating: number;
  bestStreak: number;
  currentStreak: number;
  averageRating: number;
  improvementThisMonth: number;
  accuracyRate: number;
  averageTime: number;
  favoriteTheme: string;
}

// Error types
export interface FormErrors {
  [key: string]: string | undefined;
}

// Event handlers
export type ClickHandler = () => void;
export type ChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
export type SubmitHandler = (e: React.FormEvent<HTMLFormElement>) => void;
