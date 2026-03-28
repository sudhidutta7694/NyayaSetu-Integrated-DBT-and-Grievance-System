'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types/user'
import { authApi } from '@/lib/api/auth'
import { tokenStorage } from '@/lib/tokenStorage'
import { socialWelfareAuthApi } from '@/lib/api/socialWelfareAuth'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (user: User, token: string) => void
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }
    
    try {
      const token = tokenStorage.getToken()
      console.log('Checking auth, token:', token ? token.substring(0, 30) + '...' : 'NO TOKEN')
      
      if (token) {
        if (token.startsWith('mock-token-')) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
             // Fallback if user object isn't in local storage
             throw new Error("Mock user not found in storage");
          }
        } else {
          // Your existing logic for real API calls
          try {
            const userData = await authApi.getCurrentUser()
            setUser(userData)
          } catch (e) {
            const userData = await socialWelfareAuthApi.getCurrentUser()
            setUser(userData)
          }
        }
      }
    } catch (error: any) {
      console.error('Auth check failed:', error)
      tokenStorage.removeToken() // Clear bad token
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // --- NEW LOGIN FUNCTION ---
  const login = (userData: User, token: string) => {
    tokenStorage.setToken(token);
    // Also store the mock user for refresh purposes
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  }

  const logout = () => {
    tokenStorage.removeToken()
    localStorage.removeItem('user')
    localStorage.removeItem('authToken')
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  const refreshUser = async () => {
    await checkAuth();
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}