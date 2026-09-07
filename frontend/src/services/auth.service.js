import api from './api';

const authService = {
  login: (payload) => api.post('/auth/login', payload),
  logout: (payload = {}) => api.post('/auth/logout', payload),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
  me: () => api.get('/auth/me'),
  updateProfile: (payload) => api.put('/auth/profile', payload),
  changePassword: (payload) => api.post('/auth/change-password', payload),
};

export default authService;
