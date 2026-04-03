import api from './api';

export const wishlistService = {
  get:    ()          => api.get('/wishlist'),
  toggle: (productId) => api.post(`/wishlist/toggle/${productId}`),
};
