import { api } from './api.js';

export const settingService = {
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data?.data || { settings: {}, categories: {} };
  },

  updateSettings: async (settingsMap) => {
    const response = await api.put('/settings', { settings: settingsMap });
    return response.data;
  },

  resetSettings: async () => {
    const response = await api.post('/settings/reset');
    return response.data;
  },

  getNextNumberSeries: async (type) => {
    const response = await api.get(`/settings/number-series/${type}`);
    return response.data?.data?.number || '';
  },

  getCompanyProfile: async () => {
    const response = await api.get('/company');
    return response.data?.data?.company || {};
  },

  updateCompanyProfile: async (companyData) => {
    const response = await api.put('/company', companyData);
    return response.data;
  },

  getRolePermissions: async () => {
    const response = await api.get('/roles');
    return response.data?.data?.roles || {};
  },

  downloadBackup: async () => {
    const response = await api.get('/settings/backup', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kurti_erp_backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  getWorkflowSettings: async (companyId = null) => {
    const params = companyId ? { company_id: companyId } : {};
    const response = await api.get('/settings/workflow', { params });
    return response.data?.data?.settings || {
      skip_cutting: false,
      skip_bundle: false,
      direct_worker_assignment: false,
    };
  },

  updateWorkflowSettings: async (payload) => {
    const response = await api.put('/settings/workflow', payload);
    return response.data;
  },
};

export default settingService;
