/**
 * Validation utilities for common input validation patterns
 */

const { body, param, query, validationResult } = require('express-validator');
const { sendBadRequest } = require('./response');

/**
 * Handle validation errors and send appropriate response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    return sendBadRequest(res, 'Validation failed', formattedErrors);
  }
  
  next();
};

/**
 * Common validation rules
 */
const commonValidations = {
  // ObjectId validation
  objectId: (field = 'id') => param(field)
    .isMongoId()
    .withMessage(`${field} must be a valid MongoDB ObjectId`),

  // Email validation
  email: (field = 'email') => body(field)
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  // Password validation
  password: (field = 'password') => body(field)
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

  // Name validation
  name: (field = 'name') => body(field)
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage(`${field} must be between 2 and 50 characters`)
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage(`${field} can only contain letters, spaces, hyphens, and apostrophes`),

  // Phone validation
  phone: (field = 'phone') => body(field)
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),

  // Date validation
  date: (field = 'date') => body(field)
    .isISO8601()
    .withMessage(`${field} must be a valid ISO 8601 date`)
    .custom((value) => {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error(`${field} must be a valid date`);
      }
      return true;
    }),

  // Future date validation
  futureDate: (field = 'date') => body(field)
    .isISO8601()
    .withMessage(`${field} must be a valid ISO 8601 date`)
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date <= now) {
        throw new Error(`${field} must be in the future`);
      }
      return true;
    }),

  // Positive number validation
  positiveNumber: (field = 'number') => body(field)
    .isNumeric()
    .withMessage(`${field} must be a number`)
    .isFloat({ min: 0 })
    .withMessage(`${field} must be a positive number`),

  // Integer validation
  integer: (field = 'number') => body(field)
    .isInt()
    .withMessage(`${field} must be an integer`),

  // Positive integer validation
  positiveInteger: (field = 'number') => body(field)
    .isInt({ min: 1 })
    .withMessage(`${field} must be a positive integer`),

  // String length validation
  stringLength: (field = 'string', min = 1, max = 255) => body(field)
    .trim()
    .isLength({ min, max })
    .withMessage(`${field} must be between ${min} and ${max} characters`),

  // URL validation
  url: (field = 'url') => body(field)
    .isURL()
    .withMessage(`${field} must be a valid URL`),

  // Pagination validation
  pagination: () => [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],

  // Search query validation
  searchQuery: (field = 'search') => query(field)
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
    .escape(),

  // Sort validation
  sort: (allowedFields = []) => query('sort')
    .optional()
    .isIn(allowedFields)
    .withMessage(`Sort field must be one of: ${allowedFields.join(', ')}`),

  // Order validation
  order: () => query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be either "asc" or "desc"')
};

/**
 * Validation middleware factory
 * @param {Array} validations - Array of validation rules
 * @returns {Array} - Array of middleware functions
 */
const validate = (validations) => {
  return [...validations, handleValidationErrors];
};

/**
 * Sanitize input data
 * @param {Object} data - Input data to sanitize
 * @returns {Object} - Sanitized data
 */
const sanitizeInput = (data) => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Trim whitespace and escape HTML
      sanitized[key] = value.trim().replace(/[<>]/g, '');
    } else if (typeof value === 'object' && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Validate and sanitize request body
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const sanitizeBody = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  next();
};

/**
 * Validate and sanitize query parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const sanitizeQuery = (req, res, next) => {
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  next();
};

module.exports = {
  handleValidationErrors,
  commonValidations,
  validate,
  sanitizeInput,
  sanitizeBody,
  sanitizeQuery
};