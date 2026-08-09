import { api } from './api.js';

export const workflowSettingService = {
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

export default workflowSettingService;
