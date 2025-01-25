const express = require('express');
const { ValidationError } = require('../utils/errors');
const authRoutes = require('./auth.routes');
const router = express.Router();

// Mount auth routes
router.use('/auth', authRoutes);

// Example error endpoint
router.get('/error-example', (req, res, next) => {
  try {
    // Simulating a validation error
    throw new ValidationError('This is an example validation error');
  } catch (error) {
    next(error);
  }
});

// Example async error
router.get('/async-error', async (req, res, next) => {
  try {
    // Simulating an async operation that fails
    await Promise.reject(new Error('Async operation failed'));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
