const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Enhanced validation middleware with better error handling
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      type: 'field',
      value: error.value,
      msg: error.msg,
      path: error.path,
      location: error.location
    }));

    return next(new ValidationError('Validation failed', formattedErrors));
  }
  next();
};

/**
 * Sanitize input data to prevent XSS and injection attacks
 */
const sanitizeInput = (req, res, next) => {
  // Sanitize string inputs
  const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  };

  // Recursively sanitize object properties
  const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    return obj;
  };

  // Sanitize request body, query, and params
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);

  next();
};

/**
 * Common validation rules
 */
const validationRules = {
  // User validation rules
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 254 })
    .withMessage('Email address is too long'),

  password: body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),

  dateOfBirth: body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      if (age < 18 || age > 120) {
        throw new Error('Age must be between 18 and 120 years');
      }
      return true;
    }),

  nationality: body('nationality')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nationality must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Nationality can only contain letters and spaces'),

  // Destination validation rules
  destinationTitle: body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-',.()]+$/)
    .withMessage('Title contains invalid characters'),

  destinationDescription: body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),

  destinationImageUrl: body('imageUrl')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid image URL')
    .custom((value) => {
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const hasValidExtension = allowedExtensions.some(ext => 
        value.toLowerCase().includes(ext)
      );
      if (!hasValidExtension) {
        throw new Error('Image URL must point to a valid image file');
      }
      return true;
    }),

  destinationRating: body('rating')
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),

  destinationPrice: body('price')
    .isFloat({ min: 0, max: 100000 })
    .withMessage('Price must be between 0 and 100,000'),

  destinationLocation: body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-',.()]+$/)
    .withMessage('Location contains invalid characters'),

  destinationCategory: body('category')
    .isIn(['Beach', 'Mountain', 'City', 'Cultural', 'Adventure', 'Nature', 'Historical'])
    .withMessage('Category must be one of: Beach, Mountain, City, Cultural, Adventure, Nature, Historical'),

  // Review validation rules
  destinationId: body('destinationId')
    .isMongoId()
    .withMessage('Please provide a valid destination ID'),

  reviewTitle: body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Review title must be between 3 and 100 characters'),

  reviewContent: body('content')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Review content must be between 10 and 1000 characters'),

  reviewRating: body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  // Booking validation rules
  bookingStartDate: body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),

  bookingEndDate: body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      const endDate = new Date(value);
      const startDate = new Date(req.body.startDate);
      if (endDate <= startDate) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  bookingGuests: body('guests')
    .isInt({ min: 1, max: 20 })
    .withMessage('Number of guests must be between 1 and 20'),

  // Payment validation rules
  paymentMethod: body('paymentMethod')
    .isIn(['credit-card', 'paypal', 'bank-transfer', 'stripe'])
    .withMessage('Payment method must be credit-card, paypal, bank-transfer, or stripe'),

  paymentAmount: body('amount')
    .isFloat({ min: 0.01, max: 100000 })
    .withMessage('Payment amount must be between 0.01 and 100,000'),

  // Notification validation rules
  notificationTitle: body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Notification title must be between 3 and 100 characters'),

  notificationMessage: body('message')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Notification message must be between 5 and 500 characters'),

  notificationType: body('type')
    .isIn([
      'booking_confirmed',
      'booking_cancelled', 
      'booking_reminder',
      'payment_success',
      'payment_failed',
      'review_request',
      'destination_update',
      'promotion',
      'system',
      'security_alert'
    ])
    .withMessage('Invalid notification type'),

  notificationPriority: body('priority')
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent'),

  // Query parameter validation
  page: query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be between 1 and 1000'),

  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  sort: query('sort')
    .optional()
    .matches(/^[a-zA-Z0-9_]+:(asc|desc)$/)
    .withMessage('Sort must be in format field:asc or field:desc'),

  // Parameter validation
  mongoId: param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),

  // Password update validation
  currentPassword: body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  newPassword: body('newPassword')
    .isLength({ min: 8, max: 128 })
    .withMessage('New password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    })
};

/**
 * Validation rule combinations for common use cases
 */
const validationSchemas = {
  userRegistration: [
    validationRules.email,
    validationRules.password,
    validationRules.name,
    validationRules.dateOfBirth,
    validationRules.nationality
  ],

  userLogin: [
    validationRules.email,
    body('password').notEmpty().withMessage('Password is required')
  ],

  userUpdate: [
    validationRules.name.optional(),
    validationRules.dateOfBirth,
    validationRules.nationality
  ],

  passwordUpdate: [
    validationRules.currentPassword,
    validationRules.newPassword
  ],

  destinationCreate: [
    validationRules.destinationTitle,
    validationRules.destinationDescription,
    validationRules.destinationImageUrl,
    validationRules.destinationRating,
    validationRules.destinationPrice,
    validationRules.destinationLocation,
    validationRules.destinationCategory
  ],

  destinationUpdate: [
    validationRules.destinationTitle.optional(),
    validationRules.destinationDescription.optional(),
    validationRules.destinationImageUrl.optional(),
    validationRules.destinationRating.optional(),
    validationRules.destinationPrice.optional(),
    validationRules.destinationLocation.optional(),
    validationRules.destinationCategory.optional()
  ],

  reviewCreate: [
    validationRules.destinationId,
    validationRules.reviewTitle,
    validationRules.reviewContent,
    validationRules.reviewRating
  ],

  bookingCreate: [
    validationRules.destinationId,
    validationRules.bookingStartDate,
    validationRules.bookingEndDate,
    validationRules.bookingGuests
  ],

  paymentCreate: [
    validationRules.paymentMethod,
    validationRules.paymentAmount,
    body('currency')
      .isIn(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'])
      .withMessage('Currency must be USD, EUR, GBP, JPY, CAD, or AUD')
  ],

  notificationCreate: [
    validationRules.notificationTitle,
    validationRules.notificationMessage,
    validationRules.notificationType,
    validationRules.notificationPriority.optional()
  ],

  pagination: [
    validationRules.page,
    validationRules.limit,
    validationRules.sort
  ]
};

module.exports = {
  validateRequest,
  sanitizeInput,
  validationRules,
  validationSchemas
};