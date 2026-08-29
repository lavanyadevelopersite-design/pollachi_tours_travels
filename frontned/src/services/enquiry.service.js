import api from './api';
import { buildParams } from '../utils/apiParams';

const enquiryService = {
  list: (params) => api.get('/enquiries', { params: buildParams(params) }),
  get: (id) => api.get(`/enquiries/${id}`),
  create: (data) => api.post('/enquiries', data),
  update: (id, data) => api.put(`/enquiries/${id}`, data),
  remove: (id) => api.delete(`/enquiries/${id}`),
  convert: (id) => api.post(`/enquiries/${id}/convert`),
  updateStatus: (id, data) => api.patch(`/enquiries/${id}/status`, data),
  listNotes: (id) => api.get(`/enquiries/${id}/notes`),
  addNote: (id, data) => api.post(`/enquiries/${id}/notes`, data),
  getHistory: (id) => api.get(`/enquiries/${id}/history`),
  listVehicleAssignments: (id) => api.get(`/enquiries/${id}/vehicles`),
  createFeedbackLink: (id) => api.post(`/enquiries/${id}/feedback-link`),
  shareFeedbackWhatsApp: (id, data = {}) =>
    api.post(`/enquiries/${id}/feedback-link/share-whatsapp`, data),
  addVehicleAssignment: (id, data) => api.post(`/enquiries/${id}/vehicles`, data),
  updateVehicleAssignment: (id, subId, data) =>
    api.put(`/enquiries/${id}/vehicles/${subId}`, data),
  removeVehicleAssignment: (id, subId) => api.delete(`/enquiries/${id}/vehicles/${subId}`),
  shareDriverLoginWhatsApp: (id, subId, data) =>
    api.post(`/enquiries/${id}/vehicles/${subId}/share-driver-login`, data),
  shareInvoiceWhatsApp: (id, formData) =>
    api.post(`/enquiries/${id}/invoice/share-whatsapp`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: [
        (body, headers) => {
          if (body instanceof FormData) delete headers['Content-Type'];
          return body;
        },
      ],
    }),
  getMonthlyTrips: (params) => api.get('/enquiries/services/monthly-trips', { params }),
  getAssignableResources: () => api.get('/enquiries/services/assignable-resources'),
  getAssignedTrips: (params) => api.get('/enquiries/services/assigned-trips', { params }),
  calculateDistance: (data) => api.post('/enquiries/services/distance', data),
  calculateTripCost: (data) => api.post('/enquiries/services/trip-cost', data),

  // Public (no auth)
  publicSubmit: (data) => api.post('/public/enquiries', data),
  publicMasters: () => api.get('/public/enquiries/masters'),
  publicStates: (countryId) =>
    api.get('/public/enquiries/states', { params: { country_id: countryId } }),
  publicCities: (stateId) =>
    api.get('/public/enquiries/cities', { params: { state_id: stateId } }),
  publicPlaces: (q) => api.get('/public/enquiries/places', { params: { q } }),
  publicDistance: (data) => api.post('/public/enquiries/distance', data),
  publicTripCost: (data) => api.post('/public/enquiries/trip-cost', data),
};

export default enquiryService;
