import { api } from './api.js';

export const jobCardService = {
  getJobCards: async (params = {}) => {
    const response = await api.get('/job-cards', { params });
    return response.data?.data || { jobCards: [], pagination: {} };
  },

  getJobCardById: async (id) => {
    const response = await api.get(`/job-cards/${id}`);
    return response.data?.data?.jobCard || null;
  },

  createJobCard: async (data) => {
    const response = await api.post('/job-cards', data);
    return response.data;
  },

  updateJobCard: async (id, data) => {
    const response = await api.put(`/job-cards/${id}`, data);
    return response.data;
  },

  sendToCutting: async (id) => {
    const response = await api.post(`/job-cards/${id}/send-to-cutting`);
    return response.data;
  },

  deleteJobCard: async (id) => {
    const response = await api.delete(`/job-cards/${id}`);
    return response.data;
  },
};

export default jobCardService;
