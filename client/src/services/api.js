import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  getColleges: () => api.get('/auth/colleges'),
  sendOTP: (data) => api.post('/auth/send-otp', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
};

// Users
export const usersAPI = {
  onboarding: (data) => api.put('/users/onboarding', data),
  updateProfile: (data) => api.put('/users/profile', data),
  getUser: (id) => api.get(`/users/${id}`),
  bookmark: (oppId) => api.post(`/users/bookmark/${oppId}`),
};

// Queries
export const queriesAPI = {
  getAll: (params) => api.get('/queries', { params }),
  getById: (id) => api.get(`/queries/${id}`),
  create: (data) => api.post('/queries', data),
  upvote: (id) => api.put(`/queries/${id}/upvote`),
  dislike: (id) => api.put(`/queries/${id}/dislike`),
  addComment: (id, data) => api.post(`/queries/${id}/comments`, data),
  delete: (id) => api.delete(`/queries/${id}`),
};

// Resources
export const resourcesAPI = {
  getAll: (params) => api.get('/resources', { params }),
  create: (formData) => api.post('/resources', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  approve: (id) => api.put(`/resources/${id}/approve`),
  delete: (id) => api.delete(`/resources/${id}`),
};

// Opportunities
export const opportunitiesAPI = {
  getAll: (params) => api.get('/opportunities', { params }),
  create: (data) => api.post('/opportunities', data),
  delete: (id) => api.delete(`/opportunities/${id}`),
};

// Experiences
export const experiencesAPI = {
  getAll: (params) => api.get('/experiences', { params }),
  create: (data) => api.post('/experiences', data),
  upvote: (id) => api.put(`/experiences/${id}/upvote`),
  delete: (id) => api.delete(`/experiences/${id}`),
};

// Mentor Sessions
export const mentorSessionsAPI = {
  getAll: (params) => api.get('/mentor-sessions', { params }),
  getAllAdmin: () => api.get('/mentor-sessions/all'),
  create: (data) => api.post('/mentor-sessions', data),
  approve: (id, data) => api.put(`/mentor-sessions/${id}/approve`, data),
  reject: (id, data) => api.put(`/mentor-sessions/${id}/reject`, data),
  delete: (id) => api.delete(`/mentor-sessions/${id}`),
};

// Admin
export const adminAPI = {
  analytics: () => api.get('/admin/analytics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getPendingResources: () => api.get('/resources/pending'),
  approveResource: (id) => api.put(`/resources/${id}/approve`),
  getQueries: () => api.get('/admin/queries'),
  deleteQuery: (id) => api.delete(`/admin/queries/${id}`),
};

// Products (Student Marketplace)
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (formData) => api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.patch(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  toggleWishlist: (id) => api.post(`/products/${id}/wishlist`),
};

export default api;
