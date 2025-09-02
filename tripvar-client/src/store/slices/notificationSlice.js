import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationApi } from '../../services/notificationApi';
import toast from 'react-hot-toast';

// Async thunks
export const fetchUserNotifications = createAsyncThunk(
  'notifications/fetchUserNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getUserNotifications(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchNotificationStats = createAsyncThunk(
  'notifications/fetchNotificationStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getNotificationStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notification stats');
    }
  }
);

export const markNotificationsAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationIds = [], { rejectWithValue }) => {
    try {
      const response = await notificationApi.markNotificationsAsRead(notificationIds);
      return { response: response.data, notificationIds };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark notifications as read');
    }
  }
);

export const deleteNotifications = createAsyncThunk(
  'notifications/deleteNotifications',
  async (notificationIds, { rejectWithValue }) => {
    try {
      const response = await notificationApi.deleteNotifications(notificationIds);
      return { response: response.data, notificationIds };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete notifications');
    }
  }
);

export const getNotificationById = createAsyncThunk(
  'notifications/getById',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getNotificationById(notificationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notification');
    }
  }
);

// Admin thunks
export const createNotification = createAsyncThunk(
  'notifications/createNotification',
  async (notificationData, { rejectWithValue }) => {
    try {
      const response = await notificationApi.createNotification(notificationData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create notification');
    }
  }
);

export const fetchAllNotifications = createAsyncThunk(
  'notifications/fetchAllNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getAllNotifications(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all notifications');
    }
  }
);

const initialState = {
  notifications: [],
  notificationStats: {
    total: 0,
    unread: 0,
    byType: {},
    byPriority: {}
  },
  currentNotification: null,
  pagination: {
    current: 1,
    pages: 0,
    total: 0
  },
  loading: false,
  error: null,
  markingAsRead: false,
  deleting: false,
  creating: false
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentNotification: (state) => {
      state.currentNotification = null;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.notificationStats.total += 1;
      state.notificationStats.unread += 1;
      
      // Update by type stats
      const type = action.payload.type;
      if (!state.notificationStats.byType[type]) {
        state.notificationStats.byType[type] = { total: 0, unread: 0 };
      }
      state.notificationStats.byType[type].total += 1;
      state.notificationStats.byType[type].unread += 1;
      
      // Update by priority stats
      const priority = action.payload.priority;
      if (!state.notificationStats.byPriority[priority]) {
        state.notificationStats.byPriority[priority] = { total: 0, unread: 0 };
      }
      state.notificationStats.byPriority[priority].total += 1;
      state.notificationStats.byPriority[priority].unread += 1;
    },
    markNotificationAsRead: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        state.notificationStats.unread -= 1;
        
        // Update by type stats
        const type = notification.type;
        if (state.notificationStats.byType[type]) {
          state.notificationStats.byType[type].unread -= 1;
        }
        
        // Update by priority stats
        const priority = notification.priority;
        if (state.notificationStats.byPriority[priority]) {
          state.notificationStats.byPriority[priority].unread -= 1;
        }
      }
    },
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      const notificationIndex = state.notifications.findIndex(n => n._id === notificationId);
      if (notificationIndex !== -1) {
        const notification = state.notifications[notificationIndex];
        state.notifications.splice(notificationIndex, 1);
        state.notificationStats.total -= 1;
        
        if (!notification.isRead) {
          state.notificationStats.unread -= 1;
        }
        
        // Update by type stats
        const type = notification.type;
        if (state.notificationStats.byType[type]) {
          state.notificationStats.byType[type].total -= 1;
          if (!notification.isRead) {
            state.notificationStats.byType[type].unread -= 1;
          }
        }
        
        // Update by priority stats
        const priority = notification.priority;
        if (state.notificationStats.byPriority[priority]) {
          state.notificationStats.byPriority[priority].total -= 1;
          if (!notification.isRead) {
            state.notificationStats.byPriority[priority].unread -= 1;
          }
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch user notifications
      .addCase(fetchUserNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Fetch notification stats
      .addCase(fetchNotificationStats.fulfilled, (state, action) => {
        state.notificationStats = action.payload.notificationStats;
      })
      
      // Mark notifications as read
      .addCase(markNotificationsAsRead.pending, (state) => {
        state.markingAsRead = true;
      })
      .addCase(markNotificationsAsRead.fulfilled, (state, action) => {
        state.markingAsRead = false;
        const { notificationIds } = action.payload;
        
        if (notificationIds.length === 0) {
          // Mark all as read
          state.notifications.forEach(notification => {
            if (!notification.isRead) {
              notification.isRead = true;
              notification.readAt = new Date().toISOString();
            }
          });
          state.notificationStats.unread = 0;
          Object.keys(state.notificationStats.byType).forEach(type => {
            state.notificationStats.byType[type].unread = 0;
          });
          Object.keys(state.notificationStats.byPriority).forEach(priority => {
            state.notificationStats.byPriority[priority].unread = 0;
          });
        } else {
          // Mark specific notifications as read
          notificationIds.forEach(notificationId => {
            const notification = state.notifications.find(n => n._id === notificationId);
            if (notification && !notification.isRead) {
              notification.isRead = true;
              notification.readAt = new Date().toISOString();
              state.notificationStats.unread -= 1;
              
              // Update by type stats
              const type = notification.type;
              if (state.notificationStats.byType[type]) {
                state.notificationStats.byType[type].unread -= 1;
              }
              
              // Update by priority stats
              const priority = notification.priority;
              if (state.notificationStats.byPriority[priority]) {
                state.notificationStats.byPriority[priority].unread -= 1;
              }
            }
          });
        }
        
        toast.success('Notifications marked as read');
      })
      .addCase(markNotificationsAsRead.rejected, (state, action) => {
        state.markingAsRead = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Delete notifications
      .addCase(deleteNotifications.pending, (state) => {
        state.deleting = true;
      })
      .addCase(deleteNotifications.fulfilled, (state, action) => {
        state.deleting = false;
        const { notificationIds } = action.payload;
        
        notificationIds.forEach(notificationId => {
          const notificationIndex = state.notifications.findIndex(n => n._id === notificationId);
          if (notificationIndex !== -1) {
            const notification = state.notifications[notificationIndex];
            state.notifications.splice(notificationIndex, 1);
            state.notificationStats.total -= 1;
            
            if (!notification.isRead) {
              state.notificationStats.unread -= 1;
            }
            
            // Update by type stats
            const type = notification.type;
            if (state.notificationStats.byType[type]) {
              state.notificationStats.byType[type].total -= 1;
              if (!notification.isRead) {
                state.notificationStats.byType[type].unread -= 1;
              }
            }
            
            // Update by priority stats
            const priority = notification.priority;
            if (state.notificationStats.byPriority[priority]) {
              state.notificationStats.byPriority[priority].total -= 1;
              if (!notification.isRead) {
                state.notificationStats.byPriority[priority].unread -= 1;
              }
            }
          }
        });
        
        toast.success('Notifications deleted');
      })
      .addCase(deleteNotifications.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Get notification by ID
      .addCase(getNotificationById.fulfilled, (state, action) => {
        state.currentNotification = action.payload.notification;
      })
      
      // Create notification (admin)
      .addCase(createNotification.pending, (state) => {
        state.creating = true;
      })
      .addCase(createNotification.fulfilled, (state) => {
        state.creating = false;
        toast.success('Notification created successfully');
      })
      .addCase(createNotification.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  }
});

export const {
  clearError,
  clearCurrentNotification,
  addNotification,
  markNotificationAsRead,
  removeNotification
} = notificationSlice.actions;

export default notificationSlice.reducer;