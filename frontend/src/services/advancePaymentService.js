import { api } from './api.js';

export const advancePaymentService = {
  getAdvancesOverview: async (params = {}) => {
    const response = await api.get('/advances', { params });
    return response.data?.data || { summary: {}, advances: [], pagination: {} };
  },

  createAdvance: async (payload) => {
    const response = await api.post('/advances', payload);
    return response.data;
  },

  updateAdvance: async (id, payload) => {
    const response = await api.put(`/advances/${id}`, payload);
    return response.data;
  },

  getPaymentsOverview: async (params = {}) => {
    const response = await api.get('/payments', { params });
    return response.data?.data || { payments: [], pagination: {} };
  },

  createPayment: async (payload) => {
    const response = await api.post('/payments', payload);
    return response.data;
  },

  getPaymentHistory: async (params = {}) => {
    const response = await api.get('/payments/history', { params });
    return response.data?.data?.history || [];
  },

  getAdvancePaymentReports: async () => {
    const response = await api.get('/payments/reports');
    return response.data?.data?.report || [];
  },
};

export default advancePaymentService;
