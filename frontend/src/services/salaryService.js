import { api } from './api.js';

export const salaryService = {
  getPayrollDashboard: async (params = {}) => {
    const response = await api.get('/salary', { params });
    return response.data?.data || { summary: {}, payroll: [], pagination: {} };
  },

  getEmployeeSalaryDetails: async (employeeId) => {
    const response = await api.get(`/salary/${employeeId}`);
    return response.data?.data || null;
  },

  disbursePayment: async (payload) => {
    const response = await api.post('/salary/pay', payload);
    return response.data;
  },

  getSalaryHistory: async (params = {}) => {
    const response = await api.get('/salary/history', { params });
    return response.data?.data?.history || [];
  },

  getPayrollReports: async () => {
    const response = await api.get('/salary/reports');
    return response.data?.data?.report || [];
  },
};

export default salaryService;
