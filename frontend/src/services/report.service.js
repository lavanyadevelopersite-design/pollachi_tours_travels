import api from './api';
import { buildParams } from '../utils/apiParams';

const reportService = {
  sales: (params) => api.get('/reports/sales', { params }),
  leadConversion: (params) => api.get('/reports/lead-conversion', { params }),
  financial: (params) => api.get('/reports/financial', { params }),
  profitAndLoss: (params) => api.get('/reports/profit-loss', { params: buildParams(params) }),
  enquiries: (params) => api.get('/reports/enquiries', { params: buildParams(params) }),
  expenses: (params) => api.get('/reports/expenses', { params: buildParams(params) }),
  customers: (params) => api.get('/reports/customers', { params: buildParams(params) }),
  vehicles: (params) => api.get('/reports/vehicles', { params: buildParams(params) }),
  drivers: (params) => api.get('/reports/drivers', { params: buildParams(params) }),
  followUps: (params) => api.get('/reports/follow-ups', { params: buildParams(params) }),
  attendance: (params) => api.get('/reports/attendance', { params: buildParams(params) }),
  mis: (params) => api.get('/reports/mis', { params: buildParams(params) }),
  tours: (params) => api.get('/reports/tours', { params: buildParams(params) }),
};

export default reportService;
