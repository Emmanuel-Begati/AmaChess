import { Router } from 'express';
import type { User, LoginForm, RegisterForm, ApiResponse } from '../../shared/types';

const router = Router();

// Mock user data for development
const mockUsers: User[] = [];

// Enhanced JSON validation middleware
const validateJSON = (req: any, res: any, next: any) => {
  if (req.method === 'POST' && req.get('Content-Type')?.includes('application/json')) {
    // Log the raw body for debugging
    console.log('Raw request body:', req.body);
    console.log('Body type:', typeof req.body);
    
    if (!req.body) {
      return res.status(400).json({
        success: false,
        error: 'Request body is empty. Please send a valid JSON object.'
      } as ApiResponse<null>);
    }
    
    // Check if body is a string (indicating malformed JSON)
    if (typeof req.body === 'string') {
      try {
        // Attempt to clean and parse the string
        let cleanedBody = req.body.trim();
        
        // Remove extra quotes if they exist
        if (cleanedBody.startsWith('"') && cleanedBody.endsWith('"')) {
          cleanedBody = cleanedBody.slice(1, -1);
        }
        
        // Try to parse as JSON
        req.body = JSON.parse(cleanedBody);
        console.log('Parsed body:', req.body);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        return res.status(400).json({
          success: false,
          error: 'Invalid JSON format. Please ensure you are sending valid JSON.',
          details: 'The request body contains malformed JSON. Check for extra quotes or escape characters.'
        } as ApiResponse<null>);
      }
    }
    
    // Validate that body is an object
    if (typeof req.body !== 'object' || Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        error: 'Request body must be a JSON object.'
      } as ApiResponse<null>);
    }
  }
  next();
};

// Apply JSON validation to all routes
router.use(validateJSON);

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    console.log('Login request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { email, password }: LoginForm = req.body;
    
    // Validate required fields
    if (!email || !password) {
      console.log('Missing credentials:', { email: !!email, password: !!password });
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      } as ApiResponse<null>);
    }
    
    // Check for "undefined" string values
    if (email === 'undefined' || password === 'undefined') {
      console.log('Received "undefined" string values');
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials format. Please ensure email and password are properly set.'
      } as ApiResponse<null>);
    }
    
    // Validate email format
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email and password must be strings'
      } as ApiResponse<null>);
    }
    
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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    } as ApiResponse<null>);
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const { username, email, password, firstName, lastName }: RegisterForm = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      } as ApiResponse<null>);
    }
    
    // Validate field types
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Email and password must be strings'
      } as ApiResponse<null>);
    }
    
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
