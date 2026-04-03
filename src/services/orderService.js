import api from './api';

export const orderService = {
  getMyOrders:    ()          => api.get('/orders/my-orders'),
  getSellerOrders:()          => api.get('/orders/seller-orders'),
  getById:        (id)        => api.get(`/orders/${id}`),
  updateStatus:   (id, body)  => api.put(`/orders/${id}/status`, body),
  cancel:         (id)        => api.put(`/orders/${id}/cancel`),
};
