import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

// Read from environment variable. Set NEXT_PUBLIC_API_URL in .env.local
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
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
  (error) => Promise.reject(error),
);

export const authAPI = {
  login: (identifier: string, password: string) =>
    api.post("/auth/login", { identifier, password }),
  // In a real production app, Admin creation should be locked down. For the thesis prototype, we can use the open register route.
  registerAdmin: (data: any) =>
    api.post("/auth/register", { ...data, role: "admin" }),
  registerTeacher: (data: any) =>
    api.post("/auth/register", { ...data, role: "teacher" }),
};

export const teacherAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data: any) => api.patch("/users/profile", data),
  getMyStudents: () => api.get("/users/my-students"),
  getMyModules: () => api.get("/modules/my-content"),
  createModule: (data: any) => api.post("/modules", data),
  getStudentProgress: (studentId: string) =>
    api.get(`/progress/student/${studentId}`),
};

export const adminAPI = {
  getTeachers: () => api.get("/users/teachers"),
  getStudents: () => api.get("/users/students"),
  assignStudent: (studentId: string, teacherId: string) =>
    api.patch(`/users/${studentId}/assign-teacher/${teacherId}`),
  getAllProgress: () => api.get("/progress/all"),
};

export const uploadAPI = {
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default api;
