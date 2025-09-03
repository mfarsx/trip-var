import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX, FiCheck, FiAlertCircle, FiInfo } from 'react-icons/fi';
import { useWebSocketNotification } from '../../hooks/useWebSocket';

const RealTimeNotifications = () => {
  const notifications = useWebSocketNotification();
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      setVisibleNotifications(prev => [latestNotification, ...prev.slice(0, 4)]);
      
      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        setVisibleNotifications(prev => 
          prev.filter(notif => notif.id !== latestNotification.id)
        );
      }, 5000);
    }
  }, [notifications]);

  const handleDismiss = (notificationId) => {
    setVisibleNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking_confirmed':
      case 'payment_success':
        return <FiCheck className="w-5 h-5 text-green-400" />;
      case 'booking_cancelled':
      case 'payment_failed':
        return <FiAlertCircle className="w-5 h-5 text-red-400" />;
      case 'system':
      case 'maintenance':
        return <FiInfo className="w-5 h-5 text-blue-400" />;
      default:
        return <FiBell className="w-5 h-5 text-purple-400" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking_confirmed':
      case 'payment_success':
        return 'border-green-400/50 bg-green-400/10';
      case 'booking_cancelled':
      case 'payment_failed':
        return 'border-red-400/50 bg-red-400/10';
      case 'system':
      case 'maintenance':
        return 'border-blue-400/50 bg-blue-400/10';
      default:
        return 'border-purple-400/50 bg-purple-400/10';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {visibleNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`max-w-sm p-4 rounded-lg border backdrop-blur-sm ${getNotificationColor(notification.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white mb-1">
                  {notification.title}
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {notification.message}
                </p>
                
                {notification.actionUrl && (
                  <a
                    href={notification.actionUrl}
                    className="inline-block mt-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    View Details →
                  </a>
                )}
              </div>
              
              <button
                onClick={() => handleDismiss(notification.id)}
                className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
              >
                <FiX className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RealTimeNotifications;