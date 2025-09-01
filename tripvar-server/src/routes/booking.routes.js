const express = require("express");
const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  checkAvailability
} = require("../controllers/booking.controller");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

// User booking routes
router.post("/", createBooking);
router.get("/my-bookings", getUserBookings);

// Availability check (must come before /:id route)
router.get("/check/availability", checkAvailability);

router.get("/:id", getBookingById);
router.put("/:id/cancel", cancelBooking);

// Admin routes
router.get("/admin/all", authorize("admin"), getAllBookings);
router.put("/admin/:id/status", authorize("admin"), updateBookingStatus);

module.exports = router;