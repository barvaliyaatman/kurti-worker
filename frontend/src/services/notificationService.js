import { api } from './api.js';

export const notificationService = {
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data?.data || { notifications: [], unread_count: 0, pagination: {} };
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread');
    return response.data?.data?.unread_count || 0;
  },

  markAsRead: async (id) => {
    const response = await api.post('/notifications/read', { id });
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.post('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

export default notificationService;
