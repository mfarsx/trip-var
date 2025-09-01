const express = require("express");
const authController = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");
const { securityConfig, validateRequest, validationRules } = require("../config/security");

const router = express.Router();

// Public routes with strict rate limiting and validation
router.post("/register", 
  securityConfig.authLimiter,
  [validationRules.email, validationRules.password, validationRules.name],
  validateRequest,
  authController.register
);

router.post("/login", 
  securityConfig.authLimiter,
  [validationRules.email],
  validateRequest,
  authController.login
);

// Protected routes (everything after this middleware requires authentication)
router.use(protect);

// Logout route
router.post("/logout", authController.logout);

// Get all users
router.get("/users", authController.getAllUsers);

// Profile routes
router
  .route("/profile")
  .get(authController.getProfile)
  .patch(authController.updateProfile)
  .delete(authController.deleteAccount);

// Password update
router.patch("/update-password", authController.updatePassword);

// Favorites routes
router.get("/favorites", authController.getFavorites);
router.post("/favorites/:destinationId", authController.toggleFavorite);

module.exports = router;
