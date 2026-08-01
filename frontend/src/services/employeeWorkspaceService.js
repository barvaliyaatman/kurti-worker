import { api } from './api.js';

export const employeeWorkspaceService = {
  getWorkspace: async (id) => {
    const response = await api.get(`/employees/${id}/workspace`);
    return response.data?.data || null;
  },

  getCurrentWork: async (id) => {
    const response = await api.get(`/employees/${id}/current-work`);
    return response.data?.data?.assignments || [];
  },

  getCompletedWork: async (id) => {
    const response = await api.get(`/employees/${id}/completed-work`);
    return response.data?.data?.assignments || [];
  },

  getSalary: async (id) => {
    const response = await api.get(`/employees/${id}/salary`);
    return response.data?.data || null;
  },

  getAdvances: async (id) => {
    const response = await api.get(`/employees/${id}/advances`);
    return response.data?.data?.advances || [];
  },

  createAdvance: async (id, data) => {
    const response = await api.post(`/employees/${id}/advances`, data);
    return response.data;
  },

  getPayments: async (id) => {
    const response = await api.get(`/employees/${id}/payments`);
    return response.data?.data?.payments || [];
  },

  createPayment: async (id, data) => {
    const response = await api.post(`/employees/${id}/payments`, data);
    return response.data;
  },

  getTimeline: async (id) => {
    const response = await api.get(`/employees/${id}/timeline`);
    return response.data?.data?.timeline || [];
  },
};

export default employeeWorkspaceService;
