import api from './api';

export const authService = {
  async register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
