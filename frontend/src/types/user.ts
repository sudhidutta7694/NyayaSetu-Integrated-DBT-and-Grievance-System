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
  is_onboarded: boolean
  onboarding_step?: number
  profile_image?: string
  created_at: string
  updated_at: string
  last_login?: string
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

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface PersonalInfoData {
  fullName: string
  fatherName: string
  motherName: string
  dateOfBirth: string // DD/MM/YYYY format
  age: number
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  category: 'SC' | 'ST' | 'OBC' | 'GENERAL'
  mobileNumber: string
  address: string
  district: string
  state: string
  pincode: string
}

/**
 * Bank details form data (frontend format - camelCase)
 * Used in Step 3 of onboarding
 */
export interface BankDetailsData {
  accountNumber: string
  ifscCode: string
  bankName: string
  branchName: string
  accountHolderName: string
}

/**
 * Onboarding status response
 * Shows current progress and next step
 */
export interface OnboardingStatus {
  is_onboarded: boolean
  current_step: number
  total_steps: number
  progress_percentage: number
  next_step_name: string | null
  can_proceed: boolean
}

/**
 * Single onboarding step details
 */
export interface OnboardingStep {
  id: string
  user_id: string
  step_number: number
  step_name: string
  is_completed: boolean
  data: any
  completed_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Detailed onboarding progress
 * Includes all steps with their completion status
 */
export interface OnboardingProgress {
  user_id: string
  current_step: number
  total_steps: number
  is_completed: boolean
  steps: OnboardingStep[]
}

/**
 * Allowed document types - each user can have only ONE of each
 */
export type DocumentType = 
  | 'AADHAAR_CARD'
  | 'PAN_CARD'
  | 'BIRTH_CERTIFICATE'
  | 'BANK_PASSBOOK'
  | 'CATEGORY_CERTIFICATE'
  | 'INCOME_CERTIFICATE'
  | 'MARRIAGE_CERTIFICATE'

/**
 * Document from backend API response
 */
export interface Document {
  id: string
  user_id: string
  document_type: DocumentType
  file_name: string  // Backend returns 'file_name' not 'document_name'
  file_path: string  // S3 key/path
  file_url?: string  // Presigned URL for viewing/downloading
  file_size: string
  mime_type?: string
  status?: string  // PENDING, VERIFIED, REJECTED, EXPIRED
  is_digilocker: boolean
  digilocker_uri?: string
  created_at: string
  updated_at?: string
  verified_at?: string
}

/**
 * Application for benefits/schemes
 */
export interface Application {
  id: string
  user_id: string
  application_number: string
  scheme_type: string
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'DISBURSED'
  amount_requested?: number
  amount_approved?: number
  created_at: string
  updated_at: string
}
