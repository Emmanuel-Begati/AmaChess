import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';
import { User, AuthContextType, RegisterData } from '../types';

interface AuthProviderProps {
  children: ReactNode;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

// API base URL - adjust this to match your backend
const API_BASE_URL = 'http://localhost:3001/api';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));

  // Set up axios interceptor for authorization
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Verify token on app load
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await axios.get<ApiResponse<{ user: User }>>('/auth/verify');
          setUser(response.data.data?.user || null);
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post<ApiResponse<{ user: User; token: string }>>('/auth/login', { 
        email, 
        password 
      });
      const { user: userData, token: authToken } = response.data.data || {};
      
      if (userData && authToken) {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userAuthenticated', 'true');
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data?.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await axios.post<ApiResponse<{ user: User; token: string }>>('/auth/register', userData);
      const { user: responseUser, token: authToken } = response.data.data || {};
      
      if (responseUser && authToken) {
        setUser(responseUser);
        setToken(authToken);
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('userAuthenticated', 'true');
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data?.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userAuthenticated');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      const response = await axios.put<ApiResponse<{ user: User }>>('/auth/profile', userData);
      const updatedUser = response.data.data?.user;
      
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data?.message || 'Profile update failed';
      throw new Error(errorMessage);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
