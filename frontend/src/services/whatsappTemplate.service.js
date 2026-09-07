import api from './api';

const whatsappTemplateService = {
  list: () => api.get('/whatsapp-templates'),
  getById: (id) => api.get(`/whatsapp-templates/${id}`),
  create: (payload) => api.post('/whatsapp-templates', payload),
  update: (id, payload) => api.put(`/whatsapp-templates/${id}`, payload),
  updateStatus: (id, is_active) => api.patch(`/whatsapp-templates/${id}/status`, { is_active }),
  remove: (id) => api.delete(`/whatsapp-templates/${id}`),
};

export default whatsappTemplateService;
