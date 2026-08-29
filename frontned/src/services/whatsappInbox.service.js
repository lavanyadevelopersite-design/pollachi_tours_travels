import api from './api';

const whatsappInboxService = {
  getStatus: () => api.get('/whatsapp-inbox/status'),
  listConversations: (params) => api.get('/whatsapp-inbox/conversations', { params }),
  getMessages: (id, params) => api.get(`/whatsapp-inbox/conversations/${id}/messages`, { params }),
  markRead: (id) => api.post(`/whatsapp-inbox/conversations/${id}/read`),
  sendMessage: (id, payload) => api.post(`/whatsapp-inbox/conversations/${id}/messages`, payload),
  startConversation: (payload) => api.post('/whatsapp-inbox/conversations/start', payload),
  syncInbox: () => api.post('/whatsapp-inbox/sync'),
};

export default whatsappInboxService;
