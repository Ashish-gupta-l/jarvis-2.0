import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('caretrail_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired/invalid
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('caretrail_token');
        localStorage.removeItem('caretrail_user');
        window.location.href = '/login?session_expired=true';
      }
    }
    let message = error.response?.data?.message;
    if (!message) {
      const rawData = typeof error.response?.data === 'string' ? error.response.data : '';
      if (rawData.includes('ECONNREFUSED') || error.message?.includes('Network Error') || error.response?.status === 504 || (error.response?.status === 500 && rawData.includes('proxy'))) {
        message = 'Cannot connect to CareTrail backend server on port 8080. Please make sure the backend is running (run start-backend.bat).';
      } else {
        message = error.message || 'An unexpected error occurred';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
