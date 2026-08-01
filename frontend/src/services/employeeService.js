import { api } from './api.js';

export const employeeService = {
  getEmployees: async (params = {}) => {
    const response = await api.get('/employees', { params });
    return response.data?.data || { employees: [], pagination: {} };
  },

  getEmployeeById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data?.data?.employee || null;
  },

  createEmployee: async (data) => {
    const response = await api.post('/employees', data);
    return response.data;
  },

  updateEmployee: async (id, data) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  toggleEmployeeStatus: async (id, status) => {
    const response = await api.patch(`/employees/${id}/status`, { status });
    return response.data;
  },

  deleteEmployee: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },
};

export default employeeService;
