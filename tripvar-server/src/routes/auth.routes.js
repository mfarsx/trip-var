const express = require('express');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');
const { securityConfig } = require('../config/security');
const { validate, sanitize } = require('../middleware/validation');
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updatePasswordSchema,
  toggleFavoriteSchema,
  paginationSchema
} = require('../validation/auth.validation');

const router = express.Router();

// Public routes with strict rate limiting and validation
router.post('/register',
  securityConfig.authLimiter,
  sanitize(),
  validate(registerSchema),
  authController.register
);

router.post('/login',
  securityConfig.authLimiter,
  sanitize(),
  validate(loginSchema),
  authController.login
);

// Protected routes (everything after this middleware requires authentication)
router.use(protect);

// Logout route
router.post('/logout', authController.logout);

// Get all users
router.get('/users',
  sanitize(),
  validate(paginationSchema),
  authController.getAllUsers
);

// Profile routes
router
  .route('/profile')
  .get(authController.getProfile)
  .patch(
    sanitize(),
    validate(updateProfileSchema),
    authController.updateProfile
  )
  .delete(authController.deleteAccount);

// Password update
router.patch('/password',
  sanitize(),
  validate(updatePasswordSchema),
  authController.updatePassword
);

// Favorites routes
router.get('/favorites', authController.getFavorites);
router.post('/favorites/:destinationId',
  sanitize(),
  validate(toggleFavoriteSchema),
  authController.toggleFavorite
);

module.exports = router;
