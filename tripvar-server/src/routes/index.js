const express = require('express');
const authRoutes = require('./auth.routes');
const destinationRoutes = require('./destination.routes');
const bookingRoutes = require('./booking.routes');
const reviewRoutes = require('./review.routes');
const paymentRoutes = require('./payment.routes');
const notificationRoutes = require('./notification.routes');
const router = express.Router();

// Mount auth routes
router.use('/auth', authRoutes);
router.use('/destinations', destinationRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);


module.exports = router;
