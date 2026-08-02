import { api } from './api.js';

const BASE = '/company-users';

export const companyUserService = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.limit) query.set('limit', params.limit);
    if (params.search) query.set('search', params.search);
    if (params.role && params.role !== 'ALL') query.set('role', params.role);
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    return api.get(`${BASE}?${query.toString()}`);
  },

  create: (data) => api.post(BASE, data),

  update: (id, data) => api.put(`${BASE}/${id}`, data),

  resetPassword: (id, data) => api.post(`${BASE}/${id}/reset-password`, data),

  toggleStatus: (id, status) => api.patch(`${BASE}/${id}/status`, { status }),

  delete: (id) => api.delete(`${BASE}/${id}`),
};

export default companyUserService;
