import api from './api';

export const chatService = {
  start:       (productId)  => api.post('/chat/start', { productId }),
  getMyChats:  ()           => api.get('/chat/my-chats'),
  getMessages: (chatId, params) => api.get(`/chat/${chatId}/messages`, { params }),
};
