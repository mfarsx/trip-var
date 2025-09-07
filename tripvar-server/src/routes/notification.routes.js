const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest, validationRules } = require('../config/security');
const {
  getUserNotifications,
  markNotificationsAsRead,
  deleteNotifications,
  getNotificationById,
  getNotificationStats,
  createNotification,
  getAllNotifications
} = require('../controllers/notification.controller');

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

// User notification routes
router.get('/', getUserNotifications);
router.get('/stats', getNotificationStats);
router.get('/:notificationId', getNotificationById);

router.patch('/read',
  [
    validationRules.notificationIds.optional()
  ],
  validateRequest,
  markNotificationsAsRead
);

router.delete('/',
  [
    validationRules.notificationIds
  ],
  validateRequest,
  deleteNotifications
);

// Admin routes moved to /admin/notifications

module.exports = router;