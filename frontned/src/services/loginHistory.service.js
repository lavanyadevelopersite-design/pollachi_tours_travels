import api from './api';
import { buildParams } from '../utils/apiParams';

const loginHistoryService = {
  list: (params) => api.get('/login-history', { params: buildParams(params) }),
  summary: (params) => api.get('/login-history/summary', { params: buildParams(params) }),
  userReport: (params) => api.get('/login-history/user-report', { params: buildParams(params) }),
};

export default loginHistoryService;
