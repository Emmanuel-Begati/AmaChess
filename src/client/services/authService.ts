import axios from 'axios'
import type { LoginForm, RegisterForm, User, ApiResponse } from '../../shared/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
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
  return config
})

export const authService = {
  async login(credentials: LoginForm): Promise<{ user: User; token: string }> {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials)
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Login failed')
    }
    
    return response.data.data!
  },

  async register(userData: RegisterForm): Promise<{ user: User; token: string }> {
    const response = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', userData)
    
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
