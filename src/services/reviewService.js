// reviewService.js
import api from './api';
export const reviewService = {
  create:         (form)       => api.post('/reviews', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getByProduct:   (productId)  => api.get(`/reviews/product/${productId}`),
  getBySeller:    (sellerId)   => api.get(`/reviews/seller/${sellerId}`),
};
