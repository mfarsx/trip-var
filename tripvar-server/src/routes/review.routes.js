const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRequest, validationRules } = require('../config/security');
const {
  createReview,
  getDestinationReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getAllReviews,
  updateReviewStatus
} = require('../controllers/review.controller');

const router = express.Router();

// Public routes
router.get('/destination/:destinationId', getDestinationReviews);

// Protected routes (require authentication)
router.use(authenticate);

// User review routes
router.get('/', getUserReviews);
router.post('/',
  [
    validationRules.destinationId,
    validationRules.reviewTitle,
    validationRules.reviewContent,
    validationRules.reviewRating
  ],
  validateRequest,
  createReview
);

// Note: Individual review retrieval can be added later if needed
router.put('/:reviewId',
  [
    validationRules.reviewTitle.optional(),
    validationRules.reviewContent.optional(),
    validationRules.reviewRating.optional()
  ],
  validateRequest,
  updateReview
);

router.delete('/:reviewId', deleteReview);

router.post('/:reviewId/likes', markReviewHelpful);

// Admin routes moved to /admin/reviews

module.exports = router;