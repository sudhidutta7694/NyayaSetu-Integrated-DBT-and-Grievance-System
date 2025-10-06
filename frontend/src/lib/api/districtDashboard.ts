import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
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
    const response = await api.get('/documents/pending');
    return response.data;
  },
  verifyDocument: async (documentId: string) => {
    const response = await api.post(`/documents/pending/${documentId}/verify`);
    return response.data;
  },
  commentOnDocument: async (documentId: string, comment: string, status: string = 'PENDING') => {
    const response = await api.post(`/documents/pending/${documentId}/comment`, null, {
      params: { comment, status },
    });
    return response.data;
  },

  // Cases
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
