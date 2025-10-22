import api from "./api";

export const notificationApi = {
  // Get user notifications
  getUserNotifications: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page);
    if (params.limit) searchParams.append("limit", params.limit);
    if (params.type) searchParams.append("type", params.type);
    if (params.isRead !== undefined) searchParams.append("isRead", params.isRead);
    if (params.priority) searchParams.append("priority", params.priority);

    const response = await api.get(`/notifications?${searchParams.toString()}`);
    return response.data;
  },

  // Get notification statistics
  getNotificationStats: async () => {
    const response = await api.get("/notifications/stats");
    return response.data;
  },

  // Get notification by ID
  getNotificationById: async (notificationId) => {
    const response = await api.get(`/notifications/${notificationId}`);
    return response.data;
  },

  // Mark notifications as read
  markNotificationsAsRead: async (notificationIds = []) => {
    const response = await api.patch("/notifications/read", {
      notificationIds,
    });
    return response.data;
  },

  // Delete notifications
  deleteNotifications: async (notificationIds) => {
    const response = await api.delete("/notifications", {
      data: { notificationIds },
    });
    return response.data;
  },

  // Create notification (admin only)
  createNotification: async (notificationData) => {
    const response = await api.post("/admin/notifications", notificationData);
    return response.data;
  },

  // Get all notifications (admin only)
  getAllNotifications: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append("page", params.page);
    if (params.limit) searchParams.append("limit", params.limit);
    if (params.userId) searchParams.append("userId", params.userId);
    if (params.type) searchParams.append("type", params.type);
    if (params.isRead !== undefined) searchParams.append("isRead", params.isRead);
    if (params.priority) searchParams.append("priority", params.priority);

    const response = await api.get(`/admin/notifications?${searchParams.toString()}`);
    return response.data;
  },
};

export default notificationApi;