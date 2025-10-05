export interface User {
  id: string
  email: string
  phone_number: string
  full_name: string
  aadhaar_number?: string
  date_of_birth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  category?: 'SC' | 'ST' | 'OBC' | 'GENERAL' | 'OTHER'
  address?: string
  district?: string
  state?: string
  pincode?: string
  role: 'PUBLIC' | 'DISTRICT_AUTHORITY' | 'SOCIAL_WELFARE' | 'FINANCIAL_INSTITUTION' | 'ADMIN'
  is_active: boolean
  is_verified: boolean
  profile_image?: string
  created_at: string
  updated_at: string
  last_login?: string
}

export interface UserCreate {
  email: string
  phone_number: string
  full_name: string
  aadhaar_number?: string
  date_of_birth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  category?: 'SC' | 'ST' | 'OBC' | 'GENERAL' | 'OTHER'
  address?: string
  district?: string
  state?: string
  pincode?: string
}

export interface UserUpdate {
  full_name?: string
  date_of_birth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  category?: 'SC' | 'ST' | 'OBC' | 'GENERAL' | 'OTHER'
  address?: string
  district?: string
  state?: string
  pincode?: string
  profile_image?: string
}

export interface LoginRequest {
  phone_number?: string
  email?: string
}

export interface OTPVerify {
  phone_number?: string
  email?: string
  otp_code: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

