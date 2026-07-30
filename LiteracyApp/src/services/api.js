import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Your computer's local IP address so the phone can connect to the local NestJS backend
const API_URL = 'http://192.168.0.26:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add the Authorization token from Zustand in-memory store
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
};

export const progressAPI = {
  getProgress: () => api.get('/progress'),
  submitProgress: (moduleId, score, attempts, isCompleted) => 
    api.post('/progress', { moduleId, score, attempts, isCompleted }),
};

export const modulesAPI = {
  getMyModules: () => api.get('/modules/my-modules'),
};

export default api;
