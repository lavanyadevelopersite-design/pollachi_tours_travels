import api from './api';
import { buildParams } from '../utils/apiParams';

const leadService = {
  list: (params) => api.get('/leads', { params: buildParams(params) }),
  get: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  remove: (id) => api.delete(`/leads/${id}`),
  convert: (id) => api.post(`/leads/${id}/convert`),
};

export default leadService;
