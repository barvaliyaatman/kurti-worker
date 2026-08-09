import { api } from './api.js';

export const bundleService = {
  getBundles: async (params = {}) => {
    const response = await api.get('/bundles', { params });
    return response.data?.data || { bundles: [], pagination: {} };
  },

  sendToBundle: async (jobCardId) => {
    const response = await api.post('/bundles/send-to-bundle', { job_card_id: jobCardId });
    return response.data;
  },
};

export default bundleService;
