import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Connect to the local NestJS backend
const API_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  // In a real production app, Admin creation should be locked down. For the thesis prototype, we can use the open register route.
  registerAdmin: (data: any) => api.post('/auth/register', { ...data, role: 'admin' }),
  registerTeacher: (data: any) => api.post('/auth/register', { ...data, role: 'teacher' }),
};

export const teacherAPI = {
  getProfile: () => api.get('/users/profile'),
  getMyStudents: () => api.get('/users/my-students'),
  getMyModules: () => api.get('/modules/my-content'),
  createModule: (data: any) => api.post('/modules', data),
  getStudentProgress: (studentId: string) => api.get(`/progress/student/${studentId}`),
};

export const adminAPI = {
  getTeachers: () => api.get('/users/teachers'),
  getStudents: () => api.get('/users/students'),
  assignStudent: (studentId: string, teacherId: string) => api.patch(`/users/${studentId}/assign-teacher/${teacherId}`),
};

export const uploadAPI = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

export default api;
