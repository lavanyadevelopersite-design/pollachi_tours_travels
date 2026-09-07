import api from './api';
import { buildParams } from '../utils/apiParams';

const bookingService = {
  list: (params) => api.get('/bookings', { params: buildParams(params) }),
  get: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  remove: (id) => api.delete(`/bookings/${id}`),
};

export default bookingService;
