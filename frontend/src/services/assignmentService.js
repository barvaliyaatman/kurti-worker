import { api } from './api.js';

export const assignmentService = {
  getAssignments: async (params = {}) => {
    const response = await api.get('/assignments', { params });
    return response.data?.data || { assignments: [], pagination: {} };
  },

  getAssignmentById: async (id) => {
    const response = await api.get(`/assignments/${id}`);
    return response.data?.data?.assignment || null;
  },

  createAssignment: async (data) => {
    const response = await api.post('/assignments', data);
    return response.data;
  },

  updateAssignment: async (id, data) => {
    const response = await api.put(`/assignments/${id}`, data);
    return response.data;
  },

  updateProgress: async (id, data) => {
    const response = await api.patch(`/assignments/${id}/progress`, data);
    return response.data;
  },

  completeAssignment: async (id) => {
    const response = await api.patch(`/assignments/${id}/complete`);
    return response.data;
  },

  cancelAssignment: async (id) => {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
  },

  startAssignment: async (id) => {
    const response = await api.patch(`/assignments/${id}/start`);
    return response.data;
  },
};

export default assignmentService;
