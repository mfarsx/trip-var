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
router.post('/',
  [
    validationRules.paymentMethod,
    validationRules.paymentDetails
  ],
  validateRequest,
  processPayment
);

router.get('/:paymentId', getPaymentStatus);
router.post('/:paymentId/refunds',
  [
    validationRules.refundReason
  ],
  validateRequest,
  processRefund
);

module.exports = router;