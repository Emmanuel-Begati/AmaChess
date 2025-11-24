import axios from 'axios';
import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Enhanced puzzle service with PostgreSQL backend integration
export class EnhancedPuzzleService {
  private authToken: string | null = null;

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private getAuthHeaders() {
    return this.authToken ? {
      'Authorization': `Bearer ${this.authToken}`
    } : {};
  }

  // Get random puzzle with advanced filtering
  async getRandomPuzzle(filters?: {
    minRating?: number;
    maxRating?: number;
    themes?: string[];
    difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  }) {
    try {
      const params = new URLSearchParams();
      
      if (filters?.minRating) params.append('minRating', filters.minRating.toString());
      if (filters?.maxRating) params.append('maxRating', filters.maxRating.toString());
      if (filters?.themes) params.append('themes', filters.themes.join(','));
      if (filters?.difficulty) params.append('difficulty', filters.difficulty);

      const response = await axios.get(`${API_BASE_URL}/puzzles/random?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error loading puzzle:', error);
      throw error;
    }
  }

  // Record puzzle attempt (requires authentication)
  async recordPuzzleAttempt(attemptData: {
    puzzleId: string;
    isCompleted: boolean;
    isSolved: boolean;
    movesPlayed: string[];
    timeSpent: number;
    hintsUsed: number;
    solutionShown: boolean;
    accuracy?: number;
  }) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/puzzles/attempts`,
        attemptData,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error recording attempt:', error);
      throw error;
    }
  }

  // Get user puzzle statistics
  async getUserStats() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/user/puzzles/stats`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error loading user stats:', error);
      throw error;
    }
  }

  // Get personalized puzzle recommendations
  async getRecommendations() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/user/puzzles/recommendations`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error loading recommendations:', error);
      throw error;
    }
  }

  // Start a new puzzle training session
  async startPuzzleSession(sessionConfig: {
    sessionType?: 'daily' | 'training' | 'themed' | 'custom';
    themes?: string[];
    difficulty?: string;
    targetPuzzleCount?: number;
  }) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/puzzles/sessions`,
        sessionConfig,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  // Update puzzle session progress
  async updatePuzzleSession(sessionId: string, progress: {
    puzzlesSolved: number;
    totalTime: number;
    accuracy: number;
    isCompleted: boolean;
  }) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/user/puzzles/sessions/${sessionId}`,
        progress,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  // Get puzzle database statistics
  async getPuzzleStats() {
    try {
      const response = await axios.get(`${API_BASE_URL}/puzzles/stats`);
      return response.data.data;
    } catch (error) {
      console.error('Error loading puzzle stats:', error);
      throw error;
    }
  }

  // Get available puzzle themes
  async getAvailableThemes() {
    try {
      const response = await axios.get(`${API_BASE_URL}/puzzles/themes`);
      return response.data.data;
    } catch (error) {
      console.error('Error loading themes:', error);
      throw error;
    }
  }

  // Get puzzles by specific theme
  async getPuzzlesByTheme(theme: string, limit: number = 10) {
    try {
      const response = await axios.get(`${API_BASE_URL}/puzzles/theme/${theme}?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error loading themed puzzles:', error);
      throw error;
    }
  }

  // Get user's puzzle attempt history
  async getUserAttempts(page: number = 1, limit: number = 20, completed?: boolean) {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (completed !== undefined) {
        params.append('completed', completed.toString());
      }

      const response = await axios.get(
        `${API_BASE_URL}/user/puzzles/attempts?${params}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error loading user attempts:', error);
      throw error;
    }
  }
}

// Usage example in a React component
export const usePuzzleWithProgress = () => {
  const [puzzleService] = useState(() => new EnhancedPuzzleService());
  
  // Set auth token when user logs in
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      puzzleService.setAuthToken(token);
    }
  }, []);

  const loadPuzzleWithProgress = async (filters?: any) => {
    try {
      // Load puzzle
      const puzzle = await puzzleService.getRandomPuzzle(filters);
      
      // If user is authenticated, also load their stats for context
      const userStats = await puzzleService.getUserStats().catch(() => null);
      
      return { puzzle, userStats };
    } catch (error) {
      console.error('Error in loadPuzzleWithProgress:', error);
      throw error;
    }
  };

  const completePuzzle = async (puzzleId: string, attemptData: any) => {
    try {
      // Record the attempt
      await puzzleService.recordPuzzleAttempt({
        puzzleId,
        ...attemptData
      });
      
      // Get updated user stats
      const updatedStats = await puzzleService.getUserStats();
      
      return updatedStats;
    } catch (error) {
      console.error('Error in completePuzzle:', error);
      throw error;
    }
  };

  return {
    puzzleService,
    loadPuzzleWithProgress,
    completePuzzle
  };
};
