import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth API
export const authApi = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  validate: (token) =>
    api.get("/auth/validate", {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// Token Helper Functions
export const tokenService = {
  setToken: (token) => localStorage.setItem("token", token),
  getToken: () => localStorage.getItem("token"),
  removeToken: () => localStorage.removeItem("token"),

  setUser: (user) => localStorage.setItem("user", JSON.stringify(user)),
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  removeUser: () => localStorage.removeItem("user"),

  logout: () => {
    tokenService.removeToken();
    tokenService.removeUser();
  },
};

// Axios Interceptor - Token automatisch zu Requests hinzufügen
api.interceptors.request.use((config) => {
  const token = tokenService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Admin API
export const adminApi = {
  getAllUsers: (adminId) => api.get(`/admin/users?adminId=${adminId}`),
  updateUserRole: (userId, adminId, role) =>
    api.put(`/admin/users/${userId}/role`, { adminId, role }),
  resetPassword: (userId, adminId, newPassword) =>
    api.put(`/admin/users/${userId}/reset-password`, { adminId, newPassword }),
};

// Weight Measurement API
export const weightApi = {
  create: (measurementData) => api.post("/weight", measurementData),
  getUserMeasurements: (userId) => api.get(`/weight/user/${userId}`),
};

// Exercise API
export const exerciseApi = {
  getAll: () => api.get("/exercises"),
  create: (exerciseData) => api.post("/exercises", exerciseData),
  getById: (id) => api.get(`/exercises/${id}`),
};

// Workout API
export const workoutApi = {
  create: (workoutData) => api.post("/workouts", workoutData),
  getUserWorkouts: (userId) => api.get(`/workouts/user/${userId}`),
  getById: (id) => api.get(`/workouts/${id}`),
  addExercise: (workoutId, workoutExerciseData) =>
    api.post(`/workouts/${workoutId}/exercises`, workoutExerciseData),
  addSet: (workoutExerciseId, setData) =>
    api.post(`/workouts/exercises/${workoutExerciseId}/sets`, setData),
  getLastPerformance: (exerciseId, userId) =>
    api.get(`/workouts/exercises/${exerciseId}/last`, { params: { userId } }),
  saveComplete: (workoutData) =>
    api.post("/workouts/save-complete", workoutData),
};

// Template API
export const templateApi = {
  create: (templateData) => api.post("/templates", templateData),
  getUserTemplates: (userId) => api.get(`/templates/user/${userId}`),
  getById: (id) => api.get(`/templates/${id}`),
  update: (id, templateData) => api.put(`/templates/${id}`, templateData),
  delete: (id) => api.delete(`/templates/${id}`),
};

// User Preferences API
export const preferencesApi = {
  getUserPreferences: (userId) => api.get(`/preferences/user/${userId}`),
  updateUserPreferences: (userId, updates) =>
    api.put(`/preferences/user/${userId}`, updates),
};

export default api;
