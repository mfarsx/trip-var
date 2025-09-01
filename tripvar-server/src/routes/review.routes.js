const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const { validateRequest, validationRules } = require("../config/security");
const {
  createReview,
  getDestinationReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getAllReviews,
  updateReviewStatus
} = require("../controllers/review.controller");

const router = express.Router();

// Public routes
router.get("/destination/:destinationId", getDestinationReviews);

// Protected routes (require authentication)
router.use(authenticate);

// User review routes
router.post("/", 
  [
    validationRules.destinationId,
    validationRules.reviewTitle,
    validationRules.reviewContent,
    validationRules.reviewRating
  ],
  validateRequest,
  createReview
);

router.get("/my-reviews", getUserReviews);

router.put("/:reviewId", 
  [
    validationRules.reviewTitle.optional(),
    validationRules.reviewContent.optional(),
    validationRules.reviewRating.optional()
  ],
  validateRequest,
  updateReview
);

router.delete("/:reviewId", deleteReview);

router.post("/:reviewId/helpful", markReviewHelpful);

// Admin routes
router.get("/admin/all", authorize("admin"), getAllReviews);
router.put("/admin/:reviewId/status", authorize("admin"), updateReviewStatus);

module.exports = router;