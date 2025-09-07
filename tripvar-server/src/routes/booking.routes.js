const express = require('express');
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  checkAvailability
} = require('../controllers/booking.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Availability check (public route, must come before authentication middleware)
router.get('/availability', checkAvailability);

// All other booking routes require authentication
router.use(authenticate);

// User booking routes
router.get('/', getUserBookings);
router.post('/', createBooking);
router.get('/:id', getBookingById);
router.delete('/:id', cancelBooking);

// Admin routes moved to /admin/bookings

module.exports = router;