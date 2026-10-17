import api from './api';

export const authService = {
  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.success && res.data.token) {
      localStorage.setItem('caretrail_token', res.data.token);
      localStorage.setItem('caretrail_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  register: async (registerData) => {
    const res = await api.post('/auth/register', registerData);
    if (res.success && res.data.token) {
      localStorage.setItem('caretrail_token', res.data.token);
      localStorage.setItem('caretrail_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('caretrail_token');
    localStorage.removeItem('caretrail_user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('caretrail_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  getToken: () => {
    return localStorage.getItem('caretrail_token');
  }
};
