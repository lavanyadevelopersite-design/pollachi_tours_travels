import api from './api';
import { buildParams } from '../utils/apiParams';

const itineraryService = {
  list: (params) => api.get('/itineraries', { params: buildParams(params) }),
  get: (id) => api.get(`/itineraries/${id}`),
  create: (data) => api.post('/itineraries', data),
  update: (id, data) => api.put(`/itineraries/${id}`, data),
  remove: (id) => api.delete(`/itineraries/${id}`),
  generate: (data) => api.post('/itineraries/generate', data),
  searchPlaces: (q, limit = 8) =>
    api.get('/itineraries/meta/places', { params: { q, limit } }),
  searchImages: (params) => api.get('/itineraries/meta/images', { params }),
  updateDay: (id, dayId, data) => api.put(`/itineraries/${id}/days/${dayId}`, data),
  createEvent: (id, dayId, data) => api.post(`/itineraries/${id}/days/${dayId}/events`, data),
  updateEvent: (id, eventId, data) => api.put(`/itineraries/${id}/events/${eventId}`, data),
  deleteEvent: (id, eventId) => api.delete(`/itineraries/${id}/events/${eventId}`),
  reorderEvents: (id, dayId, orderedIds) =>
    api.put(`/itineraries/${id}/days/${dayId}/events/reorder`, { ordered_ids: orderedIds }),
  uploadCover: (id, file) => {
    const form = new FormData();
    form.append('cover_image', file);
    return api.post(`/itineraries/${id}/cover`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadEventImage: (id, eventId, file) => {
    const form = new FormData();
    form.append('event_image', file);
    return api.post(`/itineraries/${id}/events/${eventId}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  assignEnquiry: (id, enquiryId) =>
    api.post(`/itineraries/${id}/assign-enquiry`, { enquiry_id: enquiryId }),
  unassignEnquiry: (id) => api.post(`/itineraries/${id}/unassign-enquiry`),
  confirm: (id) => api.post(`/itineraries/${id}/confirm`),
  sendWhatsApp: (id) => api.post(`/itineraries/${id}/send-whatsapp`),
  getPublic: (token) => api.get(`/public/itineraries/${token}`),
};

export default itineraryService;
