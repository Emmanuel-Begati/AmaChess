export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  rating: number;
  level: number;
  joinDate: Date;
  preferences: UserPreferences;
  subscription: SubscriptionType;
  stats: UserStats;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  boardTheme: string;
  pieceSet: string;
  soundEnabled: boolean;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  gameInvites: boolean;
  lessonReminders: boolean;
  achievements: boolean;
  weeklyProgress: boolean;
}

export type SubscriptionType = 'free' | 'premium' | 'pro';

export interface UserStats {
  gamesPlayed: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  puzzlesSolved: number;
  lessonsCompleted: number;
  totalStudyTime: number; // in minutes
  weakestOpenings: string[];
  strongestTactics: string[];
}

export interface Game {
  id: string;
  pgn: string;
  white: string;
  black: string;
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  date: Date;
  event?: string;
  site?: string;
  timeControl?: string;
  opening?: Opening;
  analysis?: GameAnalysis;
}

export interface Opening {
  name: string;
  eco: string;
  moves: string;
}

export interface GameAnalysis {
  accuracy: {
    white: number;
    black: number;
  };
  mistakes: Move[];
  blunders: Move[];
  brilliantMoves: Move[];
  inaccuracies: Move[];
  evaluation: number[];
  timeSpent: number[];
}

export interface Move {
  san: string;
  lan: string;
  fen: string;
  moveNumber: number;
  color: 'white' | 'black';
  evaluation?: number;
  classification?: 'brilliant' | 'great' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  comment?: string;
}

export interface Puzzle {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
  title: string;
  description?: string;
  solution: string[];
  attempts: number;
  solved: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  category: BookCategory;
  difficulty: DifficultyLevel;
  chapters: Chapter[];
  rating: number;
  reviews: Review[];
  publishedDate: Date;
  tags: string[];
}

export type BookCategory = 
  | 'opening' 
  | 'middlegame' 
  | 'endgame' 
  | 'tactics' 
  | 'strategy' 
  | 'biography' 
  | 'tournament' 
  | 'general';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'master';

export interface Chapter {
  id: string;
  title: string;
  content: string;
  positions: Position[];
  exercises: Exercise[];
  order: number;
}

export interface Position {
  id: string;
  fen: string;
  description: string;
  variations: Variation[];
  annotations: Annotation[];
}

export interface Variation {
  moves: string[];
  comment: string;
  evaluation?: number;
}

export interface Annotation {
  square?: string;
  arrow?: {
    from: string;
    to: string;
    color: string;
  };
  comment: string;
  type: 'square' | 'arrow' | 'text';
}

export interface Exercise {
  id: string;
  type: 'find-move' | 'best-continuation' | 'evaluation' | 'multiple-choice';
  question: string;
  position: Position;
  solution: string | string[];
  explanation: string;
  points: number;
}

export interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  date: Date;
  helpful: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: LessonCategory;
  difficulty: DifficultyLevel;
  duration: number; // in minutes
  objectives: string[];
  content: LessonContent[];
  exercises: Exercise[];
  prerequisites: string[];
  completed: boolean;
  progress: number; // 0-100
}

export type LessonCategory = 
  | 'basic-rules'
  | 'piece-movement'
  | 'tactics'
  | 'openings'
  | 'middlegame'
  | 'endgame'
  | 'strategy';

export interface LessonContent {
  type: 'text' | 'video' | 'interactive-board' | 'quiz';
  content: string;
  boardPosition?: string; // FEN
  videoUrl?: string;
  quiz?: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface AIRecommendation {
  id: string;
  type: 'lesson' | 'book' | 'puzzle' | 'opening' | 'tactic';
  title: string;
  description: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  targetId: string;
  estimatedTime: number;
  potentialImprovement: string;
}

export interface StudyPlan {
  id: string;
  name: string;
  description: string;
  goals: string[];
  duration: number; // in weeks
  items: StudyPlanItem[];
  progress: number;
  createdDate: Date;
  targetRating?: number;
}

export interface StudyPlanItem {
  id: string;
  type: 'lesson' | 'book' | 'puzzle-set' | 'game-analysis';
  targetId: string;
  title: string;
  estimatedTime: number;
  completed: boolean;
  order: number;
  dueDate?: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'games' | 'puzzles' | 'study' | 'streak' | 'improvement';
  condition: string;
  reward: number; // points
  earned: boolean;
  earnedDate?: Date;
}

export interface Progress {
  date: Date;
  rating: number;
  gamesPlayed: number;
  puzzlesSolved: number;
  studyTime: number;
  lessonsCompleted: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
}

export interface GameUploadForm {
  pgn: string;
  source: 'lichess' | 'chess.com' | 'manual';
  gameUrl?: string;
}

// Socket events
export interface SocketEvents {
  'game:move': { gameId: string; move: string };
  'game:join': { gameId: string };
  'game:leave': { gameId: string };
  'analysis:request': { gameId: string };
  'analysis:complete': { gameId: string; analysis: GameAnalysis };
}
