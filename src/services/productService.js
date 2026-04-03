// productService.js
import api from './api';

export const productService = {
  getAll:      (params) => api.get('/products', { params }),
  getById:     (id)     => api.get(`/products/${id}`),
  search:      (params) => api.get('/products/search', { params }),
  getMyListings:(params)=> api.get('/products/seller/my-listings', { params }),
  create:      (form)   => api.post('/products', form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:      (id, form)=> api.put(`/products/${id}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:      (id)     => api.delete(`/products/${id}`),
};
