import api from './api';

const multipartConfig = {
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

const driverPortalService = {
  login: (payload) => api.post('/driver/auth/login', payload),
  me: () => api.get('/driver/me'),
  listTrips: (params) => api.get('/driver/trips', { params }),
  getTrip: (id) => api.get(`/driver/trips/${id}`),
  getTripByEnquiry: (enquiryKey) =>
    api.get(`/driver/trips/by-enquiry/${encodeURIComponent(enquiryKey)}`),
  getTripByShareCode: (code) =>
    api.get(`/driver/trips/by-share/${encodeURIComponent(code)}`),
  getTripRoute: (id) => api.get(`/driver/trips/${id}/route`),
  updateTrip: (id, payload) =>
    payload instanceof FormData
      ? api.patch(`/driver/trips/${id}`, payload, multipartConfig)
      : api.patch(`/driver/trips/${id}`, payload),
  statusOptions: () => api.get('/driver/status-options'),
};

export default driverPortalService;