const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const { validateRequest, validationRules } = require("../config/security");
const destinationController = require("../controllers/destination.controller");

const router = express.Router();

// Public routes
router.get("/", destinationController.getAllDestinations);
router.get("/:id", destinationController.getDestinationById);
router.get("/:id/availability", destinationController.checkAvailability);

// Admin only routes
router.post(
  "/",
  authenticate,
  authorize("admin"),
  [
    validationRules.destinationTitle,
    validationRules.destinationDescription,
    validationRules.destinationImageUrl,
    validationRules.destinationRating,
    validationRules.destinationPrice,
    validationRules.destinationLocation,
    validationRules.destinationCategory,
  ],
  validateRequest,
  destinationController.createDestination
);

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  [
    validationRules.destinationTitle.optional(),
    validationRules.destinationDescription.optional(),
    validationRules.destinationImageUrl.optional(),
    validationRules.destinationRating.optional(),
    validationRules.destinationPrice.optional(),
    validationRules.destinationLocation.optional(),
    validationRules.destinationCategory.optional(),
  ],
  validateRequest,
  destinationController.updateDestination
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin"),
  [
    validationRules.destinationTitle.optional(),
    validationRules.destinationDescription.optional(),
    validationRules.destinationImageUrl.optional(),
    validationRules.destinationRating.optional(),
    validationRules.destinationPrice.optional(),
    validationRules.destinationLocation.optional(),
    validationRules.destinationCategory.optional(),
  ],
  validateRequest,
  destinationController.updateDestination
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  destinationController.deleteDestination
);

module.exports = router;
