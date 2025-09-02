const Notification = require('../models/notification.model');
const { createSystemNotification } = require('../controllers/notification.controller');
const { info, error } = require('../utils/logger');

class NotificationService {
  /**
   * Create booking confirmation notification
   * @param {string} userId - User ID
   * @param {Object} booking - Booking object
   * @returns {Promise<Object>} Created notification
   */
  static async createBookingConfirmationNotification(userId, booking) {
    try {
      const notification = await createSystemNotification(
        userId,
        'booking_confirmed',
        'Booking Confirmed! 🎉',
        `Your booking for ${booking.destination.title} has been confirmed. Check-in: ${booking.checkInDate.toLocaleDateString()}`,
        {
          priority: 'high',
          actionUrl: `/bookings/${booking._id}`,
          actionText: 'View Booking',
          booking: booking._id,
          destination: booking.destination._id
        }
      );

      info('Booking confirmation notification created', {
        notificationId: notification._id,
        userId,
        bookingId: booking._id
      });

      return notification;
    } catch (err) {
      error('Error creating booking confirmation notification', {
        error: err.message,
        userId,
        bookingId: booking._id
      });
      throw err;
    }
  }

  /**
   * Create booking reminder notification
   * @param {string} userId - User ID
   * @param {Object} booking - Booking object
   * @param {number} daysUntilCheckIn - Days until check-in
   * @returns {Promise<Object>} Created notification
   */
  static async createBookingReminderNotification(userId, booking, daysUntilCheckIn) {
    try {
      const notification = await createSystemNotification(
        userId,
        'booking_reminder',
        `Check-in Reminder - ${daysUntilCheckIn} day${daysUntilCheckIn > 1 ? 's' : ''} to go!`,
        `Don't forget! Your stay at ${booking.destination.title} starts in ${daysUntilCheckIn} day${daysUntilCheckIn > 1 ? 's' : ''}.`,
        {
          priority: daysUntilCheckIn <= 1 ? 'urgent' : 'medium',
          actionUrl: `/bookings/${booking._id}`,
          actionText: 'View Details',
          booking: booking._id,
          destination: booking.destination._id
        }
      );

      info('Booking reminder notification created', {
        notificationId: notification._id,
        userId,
        bookingId: booking._id,
        daysUntilCheckIn
      });

      return notification;
    } catch (err) {
      error('Error creating booking reminder notification', {
        error: err.message,
        userId,
        bookingId: booking._id
      });
      throw err;
    }
  }

  /**
   * Create booking cancellation notification
   * @param {string} userId - User ID
   * @param {Object} booking - Booking object
   * @param {number} refundAmount - Refund amount
   * @returns {Promise<Object>} Created notification
   */
  static async createBookingCancellationNotification(userId, booking, refundAmount) {
    try {
      const refundMessage = refundAmount > 0 
        ? `A refund of $${refundAmount} will be processed within 5-7 business days.`
        : 'No refund is available for this cancellation.';

      const notification = await createSystemNotification(
        userId,
        'booking_cancelled',
        'Booking Cancelled',
        `Your booking for ${booking.destination.title} has been cancelled. ${refundMessage}`,
        {
          priority: 'medium',
          actionUrl: `/bookings/${booking._id}`,
          actionText: 'View Details',
          booking: booking._id,
          destination: booking.destination._id
        }
      );

      info('Booking cancellation notification created', {
        notificationId: notification._id,
        userId,
        bookingId: booking._id,
        refundAmount
      });

      return notification;
    } catch (err) {
      error('Error creating booking cancellation notification', {
        error: err.message,
        userId,
        bookingId: booking._id
      });
      throw err;
    }
  }

  /**
   * Create review request notification
   * @param {string} userId - User ID
   * @param {Object} booking - Booking object
   * @returns {Promise<Object>} Created notification
   */
  static async createReviewRequestNotification(userId, booking) {
    try {
      const notification = await createSystemNotification(
        userId,
        'review_request',
        'How was your stay?',
        `We hope you enjoyed your stay at ${booking.destination.title}! Please share your experience with other travelers.`,
        {
          priority: 'low',
          actionUrl: `/destinations/${booking.destination._id}/review`,
          actionText: 'Write Review',
          booking: booking._id,
          destination: booking.destination._id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      );

      info('Review request notification created', {
        notificationId: notification._id,
        userId,
        bookingId: booking._id
      });

      return notification;
    } catch (err) {
      error('Error creating review request notification', {
        error: err.message,
        userId,
        bookingId: booking._id
      });
      throw err;
    }
  }

  /**
   * Create destination update notification
   * @param {Array} userIds - Array of user IDs to notify
   * @param {Object} destination - Destination object
   * @param {string} updateType - Type of update
   * @returns {Promise<Array>} Created notifications
   */
  static async createDestinationUpdateNotification(userIds, destination, updateType) {
    try {
      const notifications = await Promise.all(
        userIds.map(async (userId) => {
          return await createSystemNotification(
            userId,
            'destination_update',
            `${destination.title} - ${updateType}`,
            `There's been an update to ${destination.title}. Check out what's new!`,
            {
              priority: 'low',
              actionUrl: `/destinations/${destination._id}`,
              actionText: 'View Destination',
              destination: destination._id
            }
          );
        })
      );

      info('Destination update notifications created', {
        notificationCount: notifications.length,
        destinationId: destination._id,
        updateType
      });

      return notifications;
    } catch (err) {
      error('Error creating destination update notifications', {
        error: err.message,
        destinationId: destination._id
      });
      throw err;
    }
  }

  /**
   * Create promotion notification
   * @param {Array} userIds - Array of user IDs to notify
   * @param {Object} promotion - Promotion object
   * @returns {Promise<Array>} Created notifications
   */
  static async createPromotionNotification(userIds, promotion) {
    try {
      const notifications = await Promise.all(
        userIds.map(async (userId) => {
          return await createSystemNotification(
            userId,
            'promotion',
            promotion.title,
            promotion.message,
            {
              priority: 'medium',
              actionUrl: promotion.actionUrl,
              actionText: promotion.actionText,
              expiresAt: promotion.expiresAt ? new Date(promotion.expiresAt) : undefined
            }
          );
        })
      );

      info('Promotion notifications created', {
        notificationCount: notifications.length,
        promotionId: promotion._id
      });

      return notifications;
    } catch (err) {
      error('Error creating promotion notifications', {
        error: err.message,
        promotionId: promotion._id
      });
      throw err;
    }
  }

  /**
   * Create system notification
   * @param {Array} userIds - Array of user IDs to notify
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Created notifications
   */
  static async createSystemNotification(userIds, title, message, options = {}) {
    try {
      const notifications = await Promise.all(
        userIds.map(async (userId) => {
          return await createSystemNotification(
            userId,
            'system',
            title,
            message,
            {
              priority: options.priority || 'medium',
              actionUrl: options.actionUrl,
              actionText: options.actionText,
              expiresAt: options.expiresAt ? new Date(options.expiresAt) : undefined
            }
          );
        })
      );

      info('System notifications created', {
        notificationCount: notifications.length,
        title
      });

      return notifications;
    } catch (err) {
      error('Error creating system notifications', {
        error: err.message,
        title
      });
      throw err;
    }
  }

  /**
   * Clean up expired notifications
   * @returns {Promise<number>} Number of notifications cleaned up
   */
  static async cleanupExpiredNotifications() {
    try {
      const result = await Notification.cleanupExpired();
      
      info('Expired notifications cleaned up', {
        deletedCount: result.deletedCount
      });

      return result.deletedCount;
    } catch (err) {
      error('Error cleaning up expired notifications', {
        error: err.message
      });
      throw err;
    }
  }

  /**
   * Get notification statistics for a user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Notification statistics
   */
  static async getUserNotificationStats(userId) {
    try {
      const stats = await Notification.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: {
              $sum: { $cond: [{ $eq: ["$isRead", false] }, 1, 0] }
            },
            byType: {
              $push: {
                type: "$type",
                isRead: "$isRead"
              }
            },
            byPriority: {
              $push: {
                priority: "$priority",
                isRead: "$isRead"
              }
            }
          }
        }
      ]);

      let notificationStats = {
        total: 0,
        unread: 0,
        byType: {},
        byPriority: {}
      };

      if (stats.length > 0) {
        const stat = stats[0];
        notificationStats.total = stat.total;
        notificationStats.unread = stat.unread;

        // Calculate by type
        stat.byType.forEach(item => {
          if (!notificationStats.byType[item.type]) {
            notificationStats.byType[item.type] = { total: 0, unread: 0 };
          }
          notificationStats.byType[item.type].total++;
          if (!item.isRead) {
            notificationStats.byType[item.type].unread++;
          }
        });

        // Calculate by priority
        stat.byPriority.forEach(item => {
          if (!notificationStats.byPriority[item.priority]) {
            notificationStats.byPriority[item.priority] = { total: 0, unread: 0 };
          }
          notificationStats.byPriority[item.priority].total++;
          if (!item.isRead) {
            notificationStats.byPriority[item.priority].unread++;
          }
        });
      }

      return notificationStats;
    } catch (err) {
      error('Error getting user notification stats', {
        error: err.message,
        userId
      });
      throw err;
    }
  }
}

module.exports = NotificationService;