import { api } from './api.js';

export const archiveService = {
  getArchivedRecords: async () => {
    const response = await api.get('/archive');
    return response.data?.data || { jobCards: [], employees: [], bundles: [], totalArchived: 0 };
  },

  restoreRecord: async (type, id) => {
    const response = await api.post(`/archive/${type}/${id}/restore`);
    return response.data;
  },

  permanentDeleteRecord: async (type, id) => {
    const response = await api.delete(`/archive/${type}/${id}/permanent`);
    return response.data;
  },
};

export default archiveService;
