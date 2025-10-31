interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    expiresIn: string;
  };
}

interface User {
  id: string;
  email: string;
  name: string;
  lichessUsername?: string;
  country?: string;
  fideRating?: string;
  createdAt: string;
}

interface UserProfileUpdate {
  name?: string;
  lichessUsername?: string;
  country?: string;
  fideRating?: string;
}

interface LichessStats {
  username: string;
  rating: {
    rapid?: number;
    blitz?: number;
    bullet?: number;
    classical?: number;
    puzzle?: number;
  };
  gameCount: {
    rapid: number;
    blitz: number;
    bullet: number;
    classical: number;
    total: number;
  };
  winRate: number;
  online: boolean;
  title?: string;
  patron: boolean;
  verified: boolean;
  playTime: number;
  createdAt: string;
  language: string;
  country?: string;
}

class AuthApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    lichessUsername?: string;
    country?: string;
    fideRating?: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('userData', JSON.stringify(data.data.user));
    }

    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('userData', JSON.stringify(data.data.user));
    }

    return data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  async getProfile(): Promise<{ success: boolean; data: { user: User } }> {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      headers: this.getAuthHeaders()
    });

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('userData', JSON.stringify(data.data.user));
    }

    return data;
  }

  async updateProfile(updates: UserProfileUpdate): Promise<{ success: boolean; data: { user: User } }> {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updates)
    });

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('userData', JSON.stringify(data.data.user));
    }

    return data;
  }

  async verifyToken(): Promise<{ success: boolean; data: { user: User } }> {
    const response = await fetch(`${this.baseURL}/auth/verify`, {
      headers: this.getAuthHeaders()
    });

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('userData', JSON.stringify(data.data.user));
    }

    return data;
  }

  // Lichess integration methods
  async getMyLichessStats(): Promise<{ success: boolean; stats: LichessStats; username: string }> {
    const response = await fetch(`${this.baseURL}/lichess/me/stats`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async getMyLichessGames(maxGames: number = 10): Promise<{
    success: boolean;
    username: string;
    games: any[];
    analysis: any;
  }> {
    const response = await fetch(`${this.baseURL}/lichess/me/games?max=${maxGames}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  // Public Lichess methods (for any username)
  async getLichessStats(username: string): Promise<{ success: boolean; stats: LichessStats }> {
    const response = await fetch(`${this.baseURL}/games/${username}/stats`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async getLichessGames(username: string, maxGames: number = 10): Promise<{
    success: boolean;
    username: string;
    games: any[];
    analysis: any;
  }> {
    const response = await fetch(`${this.baseURL}/games/${username}/analyze?max=${maxGames}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }
}

export const authApi = new AuthApiService();
export type { User, LichessStats, UserProfileUpdate, AuthResponse };
