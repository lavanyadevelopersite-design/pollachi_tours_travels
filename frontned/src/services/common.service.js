import api from './api';
import { buildParams } from '../utils/apiParams';

export const followUpService = {
  list: (params) => api.get('/follow-ups', { params: buildParams(params) }),
  get: (id) => api.get(`/follow-ups/${id}`),
  create: (data) => api.post('/follow-ups', data),
  update: (id, data) => api.put(`/follow-ups/${id}`, data),
  remove: (id) => api.delete(`/follow-ups/${id}`),
};

export const paymentService = {
  list: (params) => api.get('/payments', { params: buildParams(params) }),
  get: (id) => api.get(`/payments/${id}`),
  create: (data) => {
    if (data instanceof FormData) {
      return api.post('/payments', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: [
          (body, headers) => {
            if (body instanceof FormData) delete headers['Content-Type'];
            return body;
          },
        ],
      });
    }
    return api.post('/payments', data);
  },
  update: (id, data) => {
    if (data instanceof FormData) {
      return api.put(`/payments/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        transformRequest: [
          (body, headers) => {
            if (body instanceof FormData) delete headers['Content-Type'];
            return body;
          },
        ],
      });
    }
    return api.put(`/payments/${id}`, data);
  },
  remove: (id) => api.delete(`/payments/${id}`),
  shareReceipt: (id, formData) =>
    api.post(`/payments/${id}/share-receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: [
        (body, headers) => {
          if (body instanceof FormData) delete headers['Content-Type'];
          return body;
        },
      ],
    }),
};

export const invoiceService = {
  list: (params) => api.get('/invoices', { params: buildParams(params) }),
  get: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  remove: (id) => api.delete(`/invoices/${id}`),
};

export const receiptService = {
  list: (params) => api.get('/receipts', { params: buildParams(params) }),
  get: (id) => api.get(`/receipts/${id}`),
  create: (data) => api.post('/receipts', data),
  remove: (id) => api.delete(`/receipts/${id}`),
};

export const expenseService = {
  list: (params) => api.get('/expenses', { params: buildParams(params) }),
  categories: () => api.get('/expenses/categories'),
  get: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  remove: (id) => api.delete(`/expenses/${id}`),
};

export const refundService = {
  list: (params) => api.get('/refunds', { params: buildParams(params) }),
  get: (id) => api.get(`/refunds/${id}`),
  create: (data) => api.post('/refunds', data),
  update: (id, data) => api.put(`/refunds/${id}`, data),
  remove: (id) => api.delete(`/refunds/${id}`),
};

export const feedbackService = {
  list: (params) => api.get('/feedback', { params: buildParams(params) }),
  get: (id) => api.get(`/feedback/${id}`),
  remove: (id) => api.delete(`/feedback/${id}`),
  getPublic: (token) => api.get(`/public/feedback/${token}`),
  submitPublic: (token, data) => api.post(`/public/feedback/${token}`, data),
};

export const roleService = {
  list: (params) => api.get('/roles', { params: buildParams(params) }),
  get: (id) => api.get(`/roles/${id}`),
  create: (data) => api.post('/roles', data),
  update: (id, data) => api.put(`/roles/${id}`, data),
  remove: (id) => api.delete(`/roles/${id}`),
  permissions: () => api.get('/roles/permissions'),
};

export const calendarService = {
  events: (params) => api.get('/calendar/events', { params }),
};

export const auditService = {
  list: (params) => api.get('/audit-logs', { params: buildParams(params) }),
};

const multipartFormConfig = {
  headers: { 'Content-Type': 'multipart/form-data' },
  transformRequest: [
    (data, headers) => {
      if (data instanceof FormData) {
        delete headers['Content-Type'];
      }
      return data;
    },
  ],
};

export const settingsService = {
  get: () => api.get('/masters/settings'),
  update: (data) => api.put('/masters/settings', data),
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post('/masters/settings/logo', formData, multipartFormConfig);
  },
  uploadSignature: (file) => {
    const formData = new FormData();
    formData.append('signature', file);
    return api.post('/masters/settings/signature', formData, multipartFormConfig);
  },
};

export const brandingService = {
  get: () => api.get('/auth/branding'),
};
