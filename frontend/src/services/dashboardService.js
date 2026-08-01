import { api } from './api.js';

export const dashboardService = {
  getMetrics: async () => {
    const response = await api.get('/dashboard');
    return response.data?.data || {};
  },
};

export default dashboardService;
