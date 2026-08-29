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



const userService = {

  list: (params) => api.get('/users', { params: buildParams(params) }),

  get: (id) => api.get(`/users/${id}`),

  create: (data) =>

    data instanceof FormData

      ? api.post('/users', data, multipartConfig)

      : api.post('/users', data),

  update: (id, data) =>

    data instanceof FormData

      ? api.put(`/users/${id}`, data, multipartConfig)

      : api.put(`/users/${id}`, data),

  remove: (id) => api.delete(`/users/${id}`),

  roles: () => api.get('/roles'),

};



export default userService;

