import { api } from './api.js';

export const garmentSizeService = {
  getGarmentSizes: async (activeOnly = false) => {
    const response = await api.get('/garment-sizes', {
      params: { active_only: activeOnly },
    });
    return response.data?.data?.sizes || [];
  },

  createGarmentSize: async (sizeData) => {
    const response = await api.post('/garment-sizes', sizeData);
    return response.data;
  },

  updateGarmentSize: async (id, sizeData) => {
    const response = await api.put(`/garment-sizes/${id}`, sizeData);
    return response.data;
  },

  deleteGarmentSize: async (id) => {
    const response = await api.delete(`/garment-sizes/${id}`);
    return response.data;
  },
};

export default garmentSizeService;
