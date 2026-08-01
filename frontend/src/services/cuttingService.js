import { api } from './api.js';

export const cuttingService = {
  getCuttingQueue: async (params = {}) => {
    const response = await api.get('/cutting', { params });
    return response.data?.data || { jobCards: [], pagination: {} };
  },

  getCuttingDetails: async (id) => {
    const response = await api.get(`/cutting/${id}`);
    return response.data?.data || { jobCard: null, components_list: [], colors_matrix: [] };
  },

  startCutting: async (job_card_id) => {
    const response = await api.post('/cutting/start', { job_card_id });
    return response.data;
  },

  updateComponentStatus: async (payload) => {
    const response = await api.post('/cutting/component', payload);
    return response.data;
  },

  completeColorAndGenerateBundle: async (payload) => {
    const response = await api.post('/cutting/complete', payload);
    return response.data;
  },

  getBundles: async (params = {}) => {
    const response = await api.get('/bundles', { params });
    return response.data?.data || { bundles: [], pagination: {} };
  },
};

export default cuttingService;
