import { api } from './api.js';

export const jobCardAssignmentService = {
  getAssignmentQueue: async (params = {}) => {
    const response = await api.get('/job-cards/assignment-queue', { params });
    return response.data?.data || { jobCards: [], pagination: {} };
  },

  getAssignmentWorkspace: async (id) => {
    const response = await api.get(`/job-cards/${id}/assignment-workspace`);
    return response.data?.data || null;
  },
};

export default jobCardAssignmentService;
