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

export const districtAuthApi = {
  register: async (data: { email: string; password: string; full_name: string; district: string }) => {
    const response = await api.post('/auth/district-authority/register', data);
    return response.data;
  },
};
