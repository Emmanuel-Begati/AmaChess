import { useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import type { LoginForm, RegisterForm, User } from '../../shared/types'

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { user, setUser, setToken, logout: logoutStore } = useAuthStore()

  // Login mutation
  const loginMutation = useMutation(
    (credentials: LoginForm) => authService.login(credentials),
    {
      onSuccess: (data) => {
        setUser(data.user)
        setToken(data.token)
        toast.success('Welcome back!')
      },
      onError: (error: any) => {
        toast.error(error.message || 'Login failed')
      },
    }
  )

  // Register mutation
  const registerMutation = useMutation(
    (userData: RegisterForm) => authService.register(userData),
    {
      onSuccess: (data) => {
        setUser(data.user)
        setToken(data.token)
        toast.success('Account created successfully!')
      },
      onError: (error: any) => {
        toast.error(error.message || 'Registration failed')
      },
    }
  )

  // Verify token query
  const { data: verifiedUser, isLoading: isVerifying } = useQuery(
    'verifyToken',
    () => authService.verifyToken(),
    {
      enabled: !!useAuthStore.getState().token,
      retry: false,
      onSuccess: (data) => {
        if (data && !user) {
          setUser(data)
        }
      },
      onError: () => {
        logoutStore()
      },
    }
  )

  const login = async (credentials: LoginForm) => {
    return loginMutation.mutateAsync(credentials)
  }

  const register = async (userData: RegisterForm) => {
    return registerMutation.mutateAsync(userData)
  }

  const logout = async () => {
    try {
      await authService.logout()
      logoutStore()
      toast.success('Logged out successfully')
    } catch (error) {
      // Still logout locally even if server request fails
      logoutStore()
    }
  }

  return {
    user: user || verifiedUser,
    isLoading: isLoading || loginMutation.isLoading || registerMutation.isLoading || isVerifying,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }
}
