import axios from 'axios'
import type { LoginForm, RegisterForm, User, ApiResponse } from '../../shared/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure JSON serialization is handled properly
  transformRequest: [function (data) {
    // Only transform if data exists and is an object
    if (data && typeof data === 'object') {
      return JSON.stringify(data);
    }
    return data;
  }],
})

// Add request interceptor for debugging
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage')
  if (token) {
    try {
      const authData = JSON.parse(token)
      if (authData.state?.token) {
        config.headers.Authorization = `Bearer ${authData.state.token}`
      }
    } catch (error) {
      console.error('Error parsing auth token:', error)
    }
  }
  
  // Log request for debugging
  console.log('Request config:', {
    url: config.url,
    method: config.method,
    data: config.data,
    headers: config.headers
  });
  
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const authService = {
  async login(credentials: LoginForm): Promise<{ user: User; token: string }> {
    // Ensure credentials are properly formatted
    const cleanCredentials = {
      email: String(credentials.email).trim(),
      password: String(credentials.password)
    };
    
    console.log('Sending login request with:', cleanCredentials);
    
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', cleanCredentials)
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Login failed')
    }
    
    return response.data.data!
  },

  async register(userData: RegisterForm): Promise<{ user: User; token: string }> {
    // Ensure user data is properly formatted
    const cleanUserData = {
      email: String(userData.email).trim(),
      password: String(userData.password),
      username: userData.username ? String(userData.username).trim() : undefined,
      firstName: userData.firstName ? String(userData.firstName).trim() : undefined,
      lastName: userData.lastName ? String(userData.lastName).trim() : undefined
    };
    
    // Remove undefined values
    Object.keys(cleanUserData).forEach(key => {
      if (cleanUserData[key as keyof typeof cleanUserData] === undefined) {
        delete cleanUserData[key as keyof typeof cleanUserData];
      }
    });
    
    console.log('Sending register request with:', cleanUserData);
    
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', cleanUserData)
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Registration failed')
    }
    
    return response.data.data!
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async verifyToken(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/verify')
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Token verification failed')
    }
    
    return response.data.data!
  },
}
