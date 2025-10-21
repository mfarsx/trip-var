const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const analyticsController = require("../controllers/analytics.controller");

const router = express.Router();

// Admin only routes
router.get(
  "/dashboard",
  authenticate,
  authorize("admin"),
  analyticsController.getDashboard
);

router.get(
  "/realtime",
  authenticate,
  authorize("admin"),
  analyticsController.getRealTimeStats
);

// User tracking routes (authenticated users)
router.post("/track/click", authenticate, analyticsController.trackClick);
router.post("/track/booking", authenticate, analyticsController.trackBooking);

module.exports = router;
