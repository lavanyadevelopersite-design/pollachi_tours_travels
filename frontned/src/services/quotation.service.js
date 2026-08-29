import api from './api';
import { buildParams } from '../utils/apiParams';

const quotationService = {
  list: (params) => api.get('/quotations', { params: buildParams(params) }),
  get: (id) => api.get(`/quotations/${id}`),
  create: (data) => api.post('/quotations', data),
  update: (id, data) => api.put(`/quotations/${id}`, data),
  remove: (id) => api.delete(`/quotations/${id}`),
  send: (id) => api.post(`/quotations/${id}/send`),
  listByEnquiry: (enquiryId) => api.get(`/quotations/by-enquiry/${enquiryId}`),
  getByEnquiryItinerary: (enquiryId, itineraryId) =>
    api.get(`/quotations/by-enquiry/${enquiryId}/itinerary/${itineraryId}`),
  getStandalone: (enquiryId) => api.get(`/quotations/by-enquiry/${enquiryId}/standalone`),
  upsertForItinerary: (data) => api.post('/quotations/upsert-itinerary', data),
  upsertForEnquiry: (data) => api.post('/quotations/upsert-enquiry', data),
};

export default quotationService;
