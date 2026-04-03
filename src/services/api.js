import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('rewear-token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired / invalid — force logout
    if (error.response?.status === 401) {
      const message = error.response?.data?.message || '';
      if (
        message.includes('expired') ||
        message.includes('invalid') ||
        message.includes('no token')
      ) {
        localStorage.removeItem('rewear-token');
        // Don't redirect here — let AuthContext handle it on next render
      }
    }
    return Promise.reject(error);
  }
);

export default api;
