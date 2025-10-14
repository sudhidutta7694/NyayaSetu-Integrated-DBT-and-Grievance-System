import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: `${API_BASE_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const socialWelfareDashboardApi = {
  // Get applications with APPROVED status (district approved, pending social welfare review)
  getPendingCases: async () => {
    const response = await api.get('/cases/social-welfare/pending');
    return response.data;
  },
  // Get all processed applications by social welfare (approved + rejected)
  getApprovedCases: async () => {
    const response = await api.get('/cases/social-welfare/approved');
    return response.data;
  },
  // Approve case with amount (changes status from APPROVED to SOCIAL_WELFARE_APPROVED)
  approveCase: async (caseId: string, amountApproved: number, comments?: string) => {
    const response = await api.post(`/cases/social-welfare/${caseId}/approve`, {
      amount_approved: amountApproved,
      comments: comments || undefined,
    });
    return response.data;
  },
  // Reject case with mandatory reason
  rejectCase: async (caseId: string, rejectionReason: string) => {
    const response = await api.post(`/cases/social-welfare/${caseId}/reject`, {
      rejection_reason: rejectionReason,
    });
    return response.data;
  },
  // Get full case details for review
  getCaseDetails: async (caseId: string) => {
    const response = await api.get(`/cases/social-welfare/case/${caseId}`);
    return response.data;
  },
};
