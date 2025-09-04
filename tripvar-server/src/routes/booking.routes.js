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
router.post('/', createBooking);
router.get('/', getUserBookings); // Main route for getting user bookings
router.get('/my-bookings', getUserBookings); // Alternative route

router.get('/:id', getBookingById);
router.delete('/:id', cancelBooking); // DELETE method for cancellation
router.put('/:id/cancel', cancelBooking); // Alternative PUT method

// Admin routes
router.get('/admin/all', authorize('admin'), getAllBookings);
router.patch('/:id/status', authorize('admin'), updateBookingStatus);
router.put('/admin/:id/status', authorize('admin'), updateBookingStatus); // Alternative PUT method

module.exports = router;