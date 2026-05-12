import axios from 'axios';
import { toast } from 'react-hot-toast';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Unauthorized: Clear session and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (status === 403) {
      // Forbidden: User doesn't have the right role
      toast.error('Access Denied: You do not have permission to perform this action.');
    } else if (status === 429) {
      // Too Many Requests: Rate limiting
      toast.error('Too many requests. Please slow down and try again in a minute.');
    }

    return Promise.reject(error);
  }
);

export default apiClient;