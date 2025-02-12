const express = require("express");
const authController = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

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

module.exports = router;
