const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest, validationRules } = require('../config/security');
const authController = require('../controllers/auth.controller');
const destinationController = require('../controllers/destination.controller');
const {
  getAllBookings,
  updateBookingStatus
} = require('../controllers/booking.controller');
const {
  getAllReviews,
  updateReviewStatus
} = require('../controllers/review.controller');
const {
  getAllNotifications,
  createNotification
} = require('../controllers/notification.controller');

const router = express.Router();

// All admin routes require authentication and admin authorization
router.use(authenticate);
router.use(authorize('admin'));

// User management
router.get('/users', authController.getAllUsers);

// Destination management
router.get('/destinations', destinationController.getAllDestinations);
router.post('/destinations', destinationController.createDestination);
router.put('/destinations/:id', destinationController.updateDestination);
router.patch('/destinations/:id', destinationController.updateDestination);
router.delete('/destinations/:id', destinationController.deleteDestination);

// Booking management
router.get('/bookings', getAllBookings);
router.patch('/bookings/:id/status', updateBookingStatus);

// Review management
router.get('/reviews', getAllReviews);
router.patch('/reviews/:id/status', updateReviewStatus);

// Notification management
router.get('/notifications', getAllNotifications);
router.post('/notifications', createNotification);

module.exports = router;