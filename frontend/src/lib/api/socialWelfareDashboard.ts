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

export const socialWelfareDashboardApi = {
  getPendingCases: async () => {
    const response = await api.get('/cases/social-welfare/pending');
    return response.data;
  },
  getApprovedCases: async () => {
    const response = await api.get('/cases/social-welfare/approved');
    return response.data;
  },
  approveCase: async (caseId: string) => {
    const response = await api.post(`/cases/social-welfare/${caseId}/approve`);
    return response.data;
  },

  getCaseDetails: async (caseId: string) => {
    const response = await api.get(`/cases/social-welfare/case/${caseId}`);
    return response.data;
  },
};
