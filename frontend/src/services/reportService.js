import { api } from './api.js';

export const reportService = {
  getDashboard: async (params = {}) => {
    const response = await api.get('/reports/dashboard', { params });
    return response.data?.data?.summary || {};
  },

  getProductionReport: async (params = {}) => {
    const response = await api.get('/reports/production', { params });
    return response.data?.data || { metrics: {}, records: [] };
  },

  getEmployeeReport: async (params = {}) => {
    const response = await api.get('/reports/employees', { params });
    return response.data?.data?.records || [];
  },

  getJobCardReport: async (params = {}) => {
    const response = await api.get('/reports/job-cards', { params });
    return response.data?.data?.records || [];
  },

  getBundleReport: async (params = {}) => {
    const response = await api.get('/reports/bundles', { params });
    return response.data?.data?.records || [];
  },

  getSalaryReport: async (params = {}) => {
    const response = await api.get('/reports/salary', { params });
    return response.data?.data?.records || [];
  },

  getAdvanceReport: async (params = {}) => {
    const response = await api.get('/reports/advances', { params });
    return response.data?.data?.records || [];
  },

  getPaymentReport: async (params = {}) => {
    const response = await api.get('/reports/payments', { params });
    return response.data?.data?.records || [];
  },
};

export default reportService;
