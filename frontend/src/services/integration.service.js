import api from './api';

const integrationService = {
  getWhatsApp: () => api.get('/integrations/whatsapp'),
  saveWhatsApp: (payload) => api.put('/integrations/whatsapp', payload),
  connectWhatsApp: (payload) =>
    api.post('/integrations/whatsapp/connect', payload, { timeout: 60000 }),
  refreshWhatsAppQr: () => api.post('/integrations/whatsapp/refresh-qr', {}, { timeout: 60000 }),
  syncWhatsAppSession: () => api.post('/integrations/whatsapp/sync'),
  disconnectWhatsApp: () => api.post('/integrations/whatsapp/disconnect'),
  getMail: () => api.get('/integrations/mail'),
  saveMail: (payload) => api.put('/integrations/mail', payload),
  testMail: (payload) => api.post('/integrations/mail/test', payload),
};

export default integrationService;
