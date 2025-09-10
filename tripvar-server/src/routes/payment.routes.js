const express = require('express');
const { authenticate } = require('../middleware/auth');
const { validateRequest, validationRules } = require('../config/security');
const {
  processPayment,
  getPaymentStatus,
  processRefund,
  getPaymentHistory
} = require('../controllers/payment.controller');

const router = express.Router();

// All payment routes require authentication
router.use(authenticate);

// Payment routes
router.get('/', getPaymentHistory);
router.get('/history', getPaymentHistory);
router.post('/',
  [
    validationRules.paymentMethod,
    validationRules.paymentDetails
  ],
  validateRequest,
  processPayment
);

router.get('/:bookingId/status', getPaymentStatus);
router.post('/:bookingId/refund',
  [
    validationRules.refundReason
  ],
  validateRequest,
  processRefund
);

module.exports = router;