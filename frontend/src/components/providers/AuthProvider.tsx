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
    // Only run on client side
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }
    
    try {
      const token = tokenStorage.getToken()
      console.log('Checking auth, token exists:', !!token)
      console.log('Token value:', token ? token.substring(0, 30) + '...' : 'NO TOKEN')
      
      if (token) {
        // Try default user endpoint first
        try {
          const userData = await authApi.getCurrentUser()
          setUser(userData)
        } catch (e) {
          // If fails, try social welfare endpoint
          try {
            const userData = await socialWelfareAuthApi.getCurrentUser()
            setUser(userData)
          } catch (err) {
            localStorage.removeItem('access_token')
            setUser(null)
          }
        }
      }
    } catch (error: any) {
      console.error('Auth check failed:', error)
      console.error('Error details:', error.response?.data || error.message)
      
      // Only remove token if it's actually an auth error (401)
      if (error.response?.status === 401) {
        console.log('Token invalid, removing from storage')
        tokenStorage.removeToken()
      } else {
        console.log('Auth check failed but keeping token (may be network error)')
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    tokenStorage.removeToken()
    setUser(null)
    router.push('/')
  }

  const refreshUser = async () => {
    try {
      const userData = await authApi.getCurrentUser()
      setUser(userData)
    } catch (error) {
      logout()
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
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

