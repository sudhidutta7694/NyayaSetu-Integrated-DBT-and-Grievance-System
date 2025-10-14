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

export const districtDashboardApi = {
  // Documents
  getPendingDocuments: async () => {
    const response = await api.get('/admin/verification/documents/pending');
    return response.data;
  },
  verifyDocument: async (documentId: string, status: string = 'VERIFIED', comments?: string) => {
    const response = await api.post(`/district-authority/documents/${documentId}/verify`, {
      status,
      comments
    });
    return response.data;
  },
  
  // Applications
  getPendingApplications: async () => {
    const response = await api.get('/district-authority/applications/pending');
    return response.data;
  },
  // Get all processed applications by district authority (approved + rejected)
  getApprovedApplications: async () => {
    const response = await api.get('/district-authority/applications/approved');
    return response.data;
  },
  getApplicationDetails: async (applicationId: string) => {
    const response = await api.get(`/district-authority/applications/${applicationId}`);
    return response.data;
  },
  cctnsVerifyApplication: async (applicationId: string, firNumber: string) => {
    const response = await api.post(`/district-authority/applications/${applicationId}/cctns-verify`, { 
      fir_number: firNumber 
    });
    return response.data;
  },
  reviewApplication: async (applicationId: string, action: string, comments?: string) => {
    const response = await api.post(`/district-authority/applications/${applicationId}/review`, {
      action,
      comments
    });
    return response.data;
  },

  // Cases (keeping for backward compatibility)
  getPendingCases: async () => {
    const response = await api.get('/cases/pending');
    return response.data;
  },
  getPendingCase: async (caseId: string) => {
    const response = await api.get(`/cases/pending/${caseId}`);
    return response.data;
  },
  cctnsVerifyCase: async (caseId: string, firNumber: string) => {
    const response = await api.post(`/cases/pending/${caseId}/cctns-verify`, { fir_number: firNumber });
    return response.data;
  },
  caseAction: async (caseId: string, action: string) => {
    const response = await api.post(`/cases/pending/${caseId}/action`, null, {
      params: { action },
    });
    return response.data;
  },
};
