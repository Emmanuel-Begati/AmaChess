import { Router } from 'express';
import type { User, LoginForm, RegisterForm, ApiResponse } from '../../shared/types';

const router = Router();

// Mock user data for development
const mockUsers: User[] = [];

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password }: LoginForm = req.body;
    
    // Mock authentication logic
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      } as ApiResponse<null>);
    }
    
    // Mock JWT token
    const token = 'mock-jwt-token';
    
    res.json({
      success: true,
      data: {
        user,
        token
      }
    } as ApiResponse<{ user: User; token: string }>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login failed'
    } as ApiResponse<null>);
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName }: RegisterForm = req.body;
    
    // Check if user already exists
    if (mockUsers.find(u => u.email === email)) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      } as ApiResponse<null>);
    }
    
    // Use provided username or create from first/last name
    const displayName = username || (firstName && lastName ? `${firstName} ${lastName}` : email.split('@')[0]);
    
    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}`,
      username: displayName,
      email,
      rating: 1200,
      level: 1,
      joinDate: new Date(),
      preferences: {
        theme: 'dark',
        language: 'en',
        boardTheme: 'brown',
        pieceSet: 'classic',
        soundEnabled: true,
        notifications: {
          gameInvites: true,
          lessonReminders: true,
          achievements: true,
          weeklyProgress: true
        }
      },
      subscription: 'free',
      stats: {
        gamesPlayed: 0,
        winRate: 0,
        currentStreak: 0,
        longestStreak: 0,
        puzzlesSolved: 0,
        lessonsCompleted: 0,
        totalStudyTime: 0,
        weakestOpenings: [],
        strongestTactics: []
      }
    };
    
    mockUsers.push(newUser);
    
    // Mock JWT token
    const token = 'mock-jwt-token';
    
    res.status(201).json({
      success: true,
      data: {
        user: newUser,
        token
      }
    } as ApiResponse<{ user: User; token: string }>);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    } as ApiResponse<null>);
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  } as ApiResponse<null>);
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  // Mock verification
  const mockUser = mockUsers[0] || null;
  
  if (mockUser) {
    res.json({
      success: true,
      data: mockUser
    } as ApiResponse<User>);
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    } as ApiResponse<null>);
  }
});

export default router;
