import api from './api';

export const authService = {
  register: (body) => api.post('/auth/register', body),
  login:    (body) => api.post('/auth/login', body),
  getMe:    ()     => api.get('/auth/me'),
};
