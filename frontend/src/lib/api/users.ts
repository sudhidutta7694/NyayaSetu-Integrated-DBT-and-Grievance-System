import axios from 'axios'
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
      if (typeof window !== 'undefined') {
        tokenStorage.removeToken()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export interface BankAccount {
  id: string
  account_number: string
  ifsc_code: string
  bank_name: string
  branch_name: string
  account_holder_name: string
  is_verified: boolean
  created_at: string
}

export interface UserProfile {
  id: string
  full_name: string
  father_name?: string
  mother_name?: string
  email: string
  phone_number: string
  aadhaar_number?: string
  date_of_birth?: string
  age?: number
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  category?: 'SC' | 'ST' | 'OBC' | 'GENERAL' | 'OTHER'
  address?: string
  district?: string
  state?: string
  pincode?: string
  profile_image?: string
  role: string
  is_active: boolean
  is_verified: boolean
  is_onboarded: boolean
  onboarding_step: number
  created_at: string
  updated_at: string
  bank_accounts?: BankAccount[]
}

export interface UserUpdateData {
  // Only editable fields (non-UIDAI fields)
  // UIDAI fields (cannot be updated): full_name, father_name, date_of_birth, age, gender, address, phone_number
  mother_name?: string
  category?: 'SC' | 'ST' | 'OBC' | 'GENERAL' | 'OTHER'
  district?: string
  state?: string
  pincode?: string
  profile_image?: string
}

export const usersApi = {
  // Get current user's profile
  getMyProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/users/me')
    return response.data
  },

  // Update current user's profile
  updateMyProfile: async (data: UserUpdateData): Promise<UserProfile> => {
    const response = await api.put('/users/me', data)
    return response.data
  },

  // Upload profile image
  uploadProfileImage: async (file: File): Promise<{ message: string; file_path: string }> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/users/me/upload-profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Save or update bank account
  saveBankAccount: async (bankDetails: {
    account_number: string
    ifsc_code: string
    bank_name: string
    branch_name: string
    account_holder_name: string
  }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/users/me/bank-account', bankDetails)
    return response.data
  },
}
