import axios from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '../store/useAuthStore';

// API URL is set in .env as API_URL and injected via app.config.js extra.apiUrl
// Change the value in .env to match your environment (device IP, emulator, or production URL)
const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api/v1';

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
  login: (identifier, password) => api.post('/auth/login', { identifier, password }),
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
