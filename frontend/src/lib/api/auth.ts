import axios from 'axios'
import { User, UserCreate, LoginRequest, OTPVerify, TokenResponse } from '@/types/user'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  register: async (userData: UserCreate): Promise<User> => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  login: async (loginData: LoginRequest): Promise<{ message: string; requires_otp: boolean }> => {
    const response = await api.post('/auth/login', loginData)
    return response.data
  },

  verifyOtp: async (phoneNumber: string, otp: string): Promise<TokenResponse> => {
    const response = await api.post('/auth/verify-otp', {
      phone_number: phoneNumber,
      otp_code: otp,
    })
    return response.data
  },

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

