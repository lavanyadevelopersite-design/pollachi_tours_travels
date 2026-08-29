import api from './api';

const userTablePreferenceService = {
  list: () => api.get('/me/table-preferences'),
  get: (tableKey) => api.get(`/me/table-preferences/${encodeURIComponent(tableKey)}`),
  save: (tableKey, hiddenColumns) =>
    api.put(`/me/table-preferences/${encodeURIComponent(tableKey)}`, {
      hidden_columns: hiddenColumns,
    }),
};

export default userTablePreferenceService;
