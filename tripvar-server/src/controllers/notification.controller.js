const Notification = require("../models/notification.model");
const { ValidationError, NotFoundError } = require("../utils/errors");
const { successResponse } = require("../utils/response");
const { info, error } = require("../utils/logger");

// Get user's notifications
const getUserNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type, isRead, priority } = req.query;

    // Build query
    const query = { user: userId };
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (priority) query.priority = priority;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .populate("booking", "bookingReference checkInDate checkOutDate")
      .populate("destination", "title location imageUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Notification.countDocuments(query);

    // Get unread count
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json(
      successResponse(
        {
          notifications,
          unreadCount,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            total
          }
        },
        "Notifications retrieved successfully"
      )
    );

  } catch (err) {
    error("Error fetching notifications", { error: err.message, userId: req.user?.id });
    next(err);
  }
};

// Mark notifications as read
const markNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { notificationIds } = req.body;

    // If no specific IDs provided, mark all as read
    const result = await Notification.markAsRead(userId, notificationIds);

    info("Notifications marked as read", {
      userId,
      notificationIds,
      modifiedCount: result.modifiedCount
    });

    res.json(
      successResponse(
        {
          modifiedCount: result.modifiedCount
        },
        "Notifications marked as read successfully"
      )
    );

  } catch (err) {
    error("Error marking notifications as read", { error: err.message, userId: req.user?.id });
    next(err);
  }
};

// Delete notifications
const deleteNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { notificationIds } = req.body;

    if (!notificationIds || notificationIds.length === 0) {
      throw new ValidationError("Notification IDs are required");
    }

    const result = await Notification.deleteMany({
      _id: { $in: notificationIds },
      user: userId
    });

    info("Notifications deleted", {
      userId,
      notificationIds,
      deletedCount: result.deletedCount
    });

    res.json(
      successResponse(
        {
          deletedCount: result.deletedCount
        },
        "Notifications deleted successfully"
      )
    );

  } catch (err) {
    error("Error deleting notifications", { error: err.message, userId: req.user?.id });
    next(err);
  }
};

// Get notification by ID
const getNotificationById = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId
    })
      .populate("booking", "bookingReference checkInDate checkOutDate totalAmount")
      .populate("destination", "title location imageUrl");

    if (!notification) {
      throw new NotFoundError("Notification not found");
    }

    // Mark as read if not already read
    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();
    }

    res.json(
      successResponse(
        { notification },
        "Notification retrieved successfully"
      )
    );

  } catch (err) {
    error("Error fetching notification", { error: err.message, notificationId: req.params.notificationId });
    next(err);
  }
};

// Get notification statistics
const getNotificationStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

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

    res.json(
      successResponse(
        { notificationStats },
        "Notification statistics retrieved successfully"
      )
    );

  } catch (err) {
    error("Error fetching notification stats", { error: err.message, userId: req.user?.id });
    next(err);
  }
};

// Create notification (admin only)
const createNotification = async (req, res, next) => {
  try {
    const {
      userId,
      title,
      message,
      type,
      priority = "medium",
      actionUrl,
      actionText,
      expiresAt
    } = req.body;

    // Validate required fields
    if (!userId || !title || !message || !type) {
      throw new ValidationError("Missing required notification information");
    }

    const notification = await Notification.createNotification({
      user: userId,
      title,
      message,
      type,
      priority,
      actionUrl,
      actionText,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    info("Notification created", {
      notificationId: notification._id,
      userId,
      type,
      priority
    });

    res.status(201).json(
      successResponse(
        { notification },
        "Notification created successfully"
      )
    );

  } catch (err) {
    error("Error creating notification", { error: err.message });
    next(err);
  }
};

// Get all notifications (admin only)
const getAllNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, userId, type, isRead, priority } = req.query;

    // Build query
    const query = {};
    if (userId) query.user = userId;
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (priority) query.priority = priority;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .populate("user", "name email")
      .populate("booking", "bookingReference")
      .populate("destination", "title location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Notification.countDocuments(query);

    res.json(
      successResponse(
        {
          notifications,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            total
          }
        },
        "All notifications retrieved successfully"
      )
    );

  } catch (err) {
    error("Error fetching all notifications", { error: err.message });
    next(err);
  }
};

// Helper function to create system notifications
const createSystemNotification = async (userId, type, title, message, options = {}) => {
  try {
    const notification = await Notification.createNotification({
      user: userId,
      title,
      message,
      type,
      priority: options.priority || "medium",
      actionUrl: options.actionUrl,
      actionText: options.actionText,
      expiresAt: options.expiresAt ? new Date(options.expiresAt) : undefined
    });

    info("System notification created", {
      notificationId: notification._id,
      userId,
      type
    });

    return notification;
  } catch (err) {
    error("Error creating system notification", { error: err.message, userId, type });
    throw err;
  }
};

module.exports = {
  getUserNotifications,
  markNotificationsAsRead,
  deleteNotifications,
  getNotificationById,
  getNotificationStats,
  createNotification,
  getAllNotifications,
  createSystemNotification
};