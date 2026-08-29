import api from './api';
import { buildParams } from '../utils/apiParams';

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

const createMasterService = (resource, { multipart = false } = {}) => ({
  list: (params) => api.get(`/${resource}`, { params: buildParams(params) }),
  get: (id) => api.get(`/${resource}/${id}`),
  create: (data) =>
    multipart && data instanceof FormData
      ? api.post(`/${resource}`, data, multipartConfig)
      : api.post(`/${resource}`, data),
  update: (id, data) =>
    multipart && data instanceof FormData
      ? api.put(`/${resource}/${id}`, data, multipartConfig)
      : api.put(`/${resource}/${id}`, data),
  updateStatus: (id, data) => api.patch(`/${resource}/${id}/status`, data),
  remove: (id) => api.delete(`/${resource}/${id}`),
  options: () => api.get(`/${resource}/options`),
});

const masterService = {
  branches: createMasterService('masters/branches'),
  destinations: createMasterService('masters/destinations'),
  packages: createMasterService('masters/packages'),
  hotels: createMasterService('masters/hotels'),
  vehicles: createMasterService('masters/vehicles', { multipart: true }),
  suppliers: createMasterService('masters/suppliers'),
  leadStatuses: createMasterService('masters/lead-statuses'),
  leadSourceTypes: createMasterService('masters/lead-source-types'),
  packageTerms: createMasterService('masters/package-terms'),
  inclusionExclusions: createMasterService('masters/inclusion-exclusions'),
  currencies: createMasterService('masters/currencies'),
  countries: createMasterService('masters/countries'),
  states: createMasterService('masters/states'),
  cities: createMasterService('masters/cities'),
  paymentModes: createMasterService('masters/payment-modes'),
  taxes: createMasterService('masters/taxes'),
  seasonPricing: createMasterService('masters/season-pricing'),
  expensesTypes: createMasterService('masters/expenses-types'),
  departments: createMasterService('masters/departments'),
  designations: createMasterService('masters/designations'),
  drivers: {
    ...createMasterService('masters/drivers', { multipart: true }),
    preparePortalShare: (id, data = {}) =>
      api.post(`/masters/drivers/${id}/portal-share`, data),
  },
  guides: createMasterService('masters/guides', { multipart: true }),
};

export default masterService;
