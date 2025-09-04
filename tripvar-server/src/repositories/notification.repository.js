const BaseRepository = require('./base.repository');

class NotificationRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  // Find notifications by user
  async findByUser(userId) {
    try {
      return await this.model
        .find({ user: userId })
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Find unread notifications by user
  async findUnreadByUser(userId) {
    try {
      return await this.model
        .find({ user: userId, isRead: false })
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Find notifications by type
  async findByType(type) {
    try {
      return await this.model
        .find({ type })
        .populate('user')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Find notifications by date range
  async findByDateRange(startDate, endDate) {
    try {
      return await this.model
        .find({
          createdAt: { $gte: startDate, $lte: endDate }
        })
        .populate('user')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      return await this.model.findByIdAndUpdate(
        notificationId,
        { $set: { isRead: true, readAt: new Date() } },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      return await this.model.updateMany(
        { user: userId, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
      );
    } catch (error) {
      throw error;
    }
  }

  // Delete old notifications
  async deleteOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      return await this.model.deleteMany({
        createdAt: { $lt: cutoffDate },
        isRead: true
      });
    } catch (error) {
      throw error;
    }
  }

  // Get notification count for user
  async getUnreadCount(userId) {
    try {
      return await this.model.countDocuments({
        user: userId,
        isRead: false
      });
    } catch (error) {
      throw error;
    }
  }

  // Create bulk notifications
  async createBulk(notifications) {
    try {
      return await this.model.insertMany(notifications);
    } catch (error) {
      throw error;
    }
  }

  // Find notifications by priority
  async findByPriority(priority) {
    try {
      return await this.model
        .find({ priority })
        .populate('user')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Get notification statistics
  async getStatistics() {
    try {
      const stats = await this.model.aggregate([
        {
          $group: {
            _id: null,
            totalNotifications: { $sum: 1 },
            unreadCount: {
              $sum: {
                $cond: ['$isRead', 0, 1]
              }
            },
            byType: {
              $push: {
                type: '$type',
                isRead: '$isRead'
              }
            }
          }
        }
      ]);
      return stats[0] || { totalNotifications: 0, unreadCount: 0, byType: [] };
    } catch (error) {
      throw error;
    }
  }

  // Find notifications with pagination
  async findWithPagination(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;
      const notifications = await this.model
        .find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await this.model.countDocuments({ user: userId });

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = NotificationRepository;