import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kurti_token') || sessionStorage.getItem('kurti_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Network error occurred';

    if (status === 401) {
      // Clear invalid/expired session tokens
      localStorage.removeItem('kurti_token');
      sessionStorage.removeItem('kurti_token');
      localStorage.removeItem('kurti_user');
      sessionStorage.removeItem('kurti_user');
    } else {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);
