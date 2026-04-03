import api from './api';

export const userService = {
  getProfile:      ()        => api.get('/users/profile'),
  updateProfile:   (form)    => api.put('/users/profile', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getSellerProfile:(id)      => api.get(`/users/seller/${id}`),
};
