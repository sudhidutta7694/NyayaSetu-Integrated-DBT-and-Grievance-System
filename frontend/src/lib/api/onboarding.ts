/**
 * Onboarding API client - Service layer for onboarding operations
 * All interfaces are defined in @/types/user
 */

import { 
  User, 
  PersonalInfoData, 
  BankDetailsData, 
  OnboardingStatus, 
  OnboardingProgress 
} from '@/types/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Get authorization header with token
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

/**
 * Initialize onboarding process
 */
export const initializeOnboarding = async (): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/onboarding/initialize`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to initialize onboarding');
  }

  return response.json();
};

/**
 * Get onboarding status
 */
export const getOnboardingStatus = async (): Promise<OnboardingStatus> => {
  const response = await fetch(`${API_BASE_URL}/onboarding/status`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get onboarding status');
  }

  return response.json();
};

/**
 * Get detailed onboarding progress
 */
export const getOnboardingProgress = async (): Promise<OnboardingProgress> => {
  const response = await fetch(`${API_BASE_URL}/onboarding/progress`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get onboarding progress');
  }

  return response.json();
};

/**
 * Convert frontend format to backend format for personal info
 */
const convertPersonalInfoToBackend = (data: PersonalInfoData) => {
  // Convert DD/MM/YYYY to ISO datetime
  const [day, month, year] = data.dateOfBirth.split('/');
  const paddedMonth = month.length === 1 ? '0' + month : month;
  const paddedDay = day.length === 1 ? '0' + day : day;
  const isoDate = `${year}-${paddedMonth}-${paddedDay}T00:00:00Z`;

  return {
    full_name: data.fullName,
    father_name: data.fatherName,
    mother_name: data.motherName,
    date_of_birth: isoDate,
    age: data.age,
    gender: data.gender,
    category: data.category,
    mobile_number: data.mobileNumber,
    address: data.address,
    district: data.district,
    state: data.state,
    pincode: data.pincode,
  };
};

/**
 * Convert backend format to frontend format for personal info
 */
export const convertPersonalInfoToFrontend = (data: any): Partial<PersonalInfoData> => {
  if (!data) return {};

  // Convert ISO datetime to DD/MM/YYYY
  let dateOfBirth = '';
  if (data.date_of_birth) {
    const date = new Date(data.date_of_birth);
    const dayNum = date.getDate();
    const monthNum = date.getMonth() + 1;
    const day = dayNum < 10 ? '0' + dayNum : dayNum.toString();
    const month = monthNum < 10 ? '0' + monthNum : monthNum.toString();
    const year = date.getFullYear();
    dateOfBirth = `${day}/${month}/${year}`;
  }

  return {
    fullName: data.full_name || '',
    fatherName: data.father_name || '',
    motherName: data.mother_name || '',
    dateOfBirth: dateOfBirth,
    age: data.age || 0,
    gender: data.gender || undefined,
    category: data.category || undefined,
    mobileNumber: data.phone_number || '',
    address: data.address || '',
    district: data.district || '',
    state: data.state || '',
    pincode: data.pincode || '',
  };
};

/**
 * Complete personal information step
 */
export const completePersonalInfoStep = async (
  data: PersonalInfoData
): Promise<{ message: string }> => {
  const backendData = convertPersonalInfoToBackend(data);

  const response = await fetch(`${API_BASE_URL}/onboarding/step/1/personal-info`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(backendData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to save personal information');
  }

  return response.json();
};

/**
 * Upload document
 */
export const uploadDocument = async (
  documentType: string,
  file: File,
  isDigilocker: boolean = false,
  digilockerId: string | null = null
): Promise<{ message: string; document: any }> => {
  const formData = new FormData();
  formData.append('document_type', documentType);
  formData.append('file', file);
  formData.append('is_digilocker', isDigilocker.toString());
  if (digilockerId) {
    formData.append('digilocker_id', digilockerId);
  }

  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE_URL}/onboarding/step/2/documents`, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to upload document');
  }

  return response.json();
};

/**
 * Complete document upload step
 */
export const completeDocumentUploadStep = async (): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/onboarding/step/2/complete`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to complete document upload step');
  }

  return response.json();
};

/**
 * Complete bank details step
 */
export const completeBankDetailsStep = async (
  data: BankDetailsData
): Promise<{ message: string }> => {
  const backendData = {
    account_number: data.accountNumber,
    ifsc_code: data.ifscCode,
    bank_name: data.bankName,
    branch_name: data.branchName,
    account_holder_name: data.accountHolderName,
  };

  const response = await fetch(`${API_BASE_URL}/onboarding/step/3/bank-details`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(backendData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to save bank details');
  }

  return response.json();
};

/**
 * Complete verification step
 */
export const completeVerificationStep = async (): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/onboarding/step/4/verification`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to complete verification step');
  }

  return response.json();
};

/**
 * Get user documents
 */
export const getUserDocuments = async (): Promise<{ documents: any[] }> => {
  const response = await fetch(`${API_BASE_URL}/onboarding/documents`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get user documents');
  }

  return response.json();
};

/**
 * Get user bank accounts
 */
export const getUserBankAccounts = async (): Promise<{ bank_accounts: any[] }> => {
  const response = await fetch(`${API_BASE_URL}/onboarding/bank-accounts`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get bank accounts');
  }

  return response.json();
};

/**
 * Delete document
 */
export const deleteDocument = async (documentId: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/onboarding/documents/${documentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to delete document');
  }

  return response.json();
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to get user profile');
  }

  return response.json();
};

/**
 * Fetch user profile from UIDAI
 */
export const fetchUidaiProfile = async (): Promise<any> => {
  const response = await fetch(`${API_BASE_URL}/onboarding/uidai-profile`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch UIDAI profile');
  }

  return response.json();
};

/**
 * Complete entire onboarding in one API call
 */
export const completeOnboarding = async (data: {
  personal_info: PersonalInfoData;
  bank_details?: BankDetailsData;
  uploaded_documents: Array<{
    s3_key: string;
    document_type: string;
    filename: string;
    file_size: number;
    content_type: string;
    is_digilocker?: boolean;
    digilocker_id?: string | null;
  }>;
}): Promise<{ success: boolean; message: string; data: any }> => {
  const response = await fetch(`${API_BASE_URL}/onboarding/complete`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to complete onboarding');
  }

  return response.json();
};

// Re-export types for convenience
export type { 
  PersonalInfoData, 
  BankDetailsData, 
  OnboardingStatus, 
  OnboardingProgress,
  OnboardingStep
} from '@/types/user';
