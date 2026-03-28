import axios from 'axios'
import { User, TokenResponse } from '@/types/user'
import { tokenStorage } from '@/lib/tokenStorage'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

const api = axios.create({
  baseURL: `${API_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  // Only access token storage on the client side
  if (typeof window !== 'undefined') {
    const token = tokenStorage.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only access token storage on the client side
      if (typeof window !== 'undefined') {
        tokenStorage.removeToken()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me')
    return response.data
  },

  refreshToken: async (): Promise<TokenResponse> => {
    const response = await api.post('/auth/refresh-token')
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  verifyAadhaar: async (aadhaarNumber: string, otp: string): Promise<any> => {
    const response = await api.post('/auth/aadhaar-verify', {
      aadhaar_number: aadhaarNumber,
      otp: otp,
    })
    return response.data
  },
}

