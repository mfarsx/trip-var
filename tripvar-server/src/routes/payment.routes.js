const express = require("express");
const { authenticate } = require("../middleware/auth");
const { validateRequest, validationRules } = require("../config/security");
const {
  processPayment,
  getPaymentStatus,
  processRefund,
  getPaymentHistory
} = require("../controllers/payment.controller");

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

// Payment processing routes
router.post("/booking/:bookingId/process", 
  [
    validationRules.paymentMethod,
    validationRules.paymentDetails
  ],
  validateRequest,
  processPayment
);

router.get("/booking/:bookingId/status", getPaymentStatus);

router.post("/booking/:bookingId/refund", 
  [
    validationRules.refundReason
  ],
  validateRequest,
  processRefund
);

router.get("/history", getPaymentHistory);

module.exports = router;