import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiBell, FiX, FiCheck, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchUserNotifications, 
  fetchNotificationStats, 
  markNotificationsAsRead, 
  deleteNotifications 
} from '../../store/slices/notificationSlice';
import toast from 'react-hot-toast';

export default function NotificationBell() {
  const dispatch = useDispatch();
  const { notifications, notificationStats, loading } = useSelector((state) => state.notifications);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  useEffect(() => {
    // Fetch notifications and stats when component mounts
    // Redux Toolkit's createAsyncThunk will handle duplicate prevention
    dispatch(fetchUserNotifications({ limit: 10 }));
    dispatch(fetchNotificationStats());
  }, [dispatch]);

  const handleMarkAsRead = async (notificationIds = []) => {
    try {
      await dispatch(markNotificationsAsRead(notificationIds)).unwrap();
      setSelectedNotifications([]);
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleDeleteNotifications = async (notificationIds) => {
    if (window.confirm('Are you sure you want to delete these notifications?')) {
      try {
        await dispatch(deleteNotifications(notificationIds)).unwrap();
        setSelectedNotifications([]);
      } catch (error) {
        console.error('Failed to delete notifications:', error);
      }
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      dispatch(markNotificationsAsRead([notification._id]));
    }

    // Handle action URL if present
    if (notification.actionUrl) {
      // For now, just show a toast. In a real app, you'd navigate to the URL
      toast.success(`Action: ${notification.actionText || 'View details'}`);
    }
  };

  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'border-red-500 bg-red-500/10';
      case 'high':
        return 'border-orange-500 bg-orange-500/10';
      case 'medium':
        return 'border-blue-500 bg-blue-500/10';
      case 'low':
        return 'border-gray-500 bg-gray-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'booking_confirmed':
        return '🎉';
      case 'booking_cancelled':
        return '❌';
      case 'booking_reminder':
        return '⏰';
      case 'payment_success':
        return '💳';
      case 'payment_failed':
        return '⚠️';
      case 'review_request':
        return '⭐';
      case 'destination_update':
        return '📍';
      case 'promotion':
        return '🎁';
      case 'system':
        return '🔧';
      default:
        return '📢';
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white transition-colors"
      >
        <FiBell className="w-6 h-6" />
        {notificationStats.unread > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
          >
            {notificationStats.unread > 9 ? '9+' : notificationStats.unread}
          </motion.div>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              {notificationStats.unread > 0 && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleMarkAsRead([])}
                    className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <FiCheck className="w-4 h-4" />
                    Mark all as read
                  </button>
                  {selectedNotifications.length > 0 && (
                    <>
                      <button
                        onClick={() => handleMarkAsRead(selectedNotifications)}
                        className="text-sm text-green-400 hover:text-green-300 flex items-center gap-1"
                      >
                        <FiCheck className="w-4 h-4" />
                        Mark selected
                      </button>
                      <button
                        onClick={() => handleDeleteNotifications(selectedNotifications)}
                        className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Delete selected
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400 mx-auto"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <FiBell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.isRead ? 'bg-gray-700/30' : ''
                    } hover:bg-gray-700/50 transition-colors cursor-pointer`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification._id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleNotificationSelection(notification._id);
                        }}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{getTypeIcon(notification.type)}</span>
                          <h4 className="font-medium text-white truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-300 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{notification.age}</span>
                          {notification.actionUrl && (
                            <span className="flex items-center gap-1 text-blue-400">
                              <FiExternalLink className="w-3 h-3" />
                              {notification.actionText}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-700 text-center">
                <button
                  onClick={() => {
                    // In a real app, this would navigate to a full notifications page
                    toast.success('View all notifications');
                    setIsOpen(false);
                  }}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}