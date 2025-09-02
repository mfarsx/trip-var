const { body, param, query } = require('express-validator');
const { ValidationError } = require('../utils/errors');

// Common validation rules
const emailRule = body('email')
  .isEmail()
  .withMessage('Please provide a valid email address')
  .normalizeEmail()
  .toLowerCase();

const passwordRule = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number');

const nameRule = body('name')
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters')
  .matches(/^[a-zA-Z\s]+$/)
  .withMessage('Name can only contain letters and spaces');

const dateOfBirthRule = body('dateOfBirth')
  .optional()
  .isISO8601()
  .withMessage('Date of birth must be a valid date')
  .custom((value) => {
    if (value) {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ? age - 1
        : age;

      if (actualAge < 20) {
        throw new Error('User must be at least 20 years old');
      }
    }
    return true;
  });

const nationalityRule = body('nationality')
  .optional()
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Nationality must be between 2 and 50 characters');

const currentPasswordRule = body('currentPassword')
  .notEmpty()
  .withMessage('Current password is required');

const newPasswordRule = body('newPassword')
  .isLength({ min: 6 })
  .withMessage('New password must be at least 6 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number');

const destinationIdRule = param('destinationId')
  .isMongoId()
  .withMessage('Invalid destination ID format');

// Validation schemas
const registerSchema = [
  emailRule,
  passwordRule,
  nameRule,
  dateOfBirthRule,
  nationalityRule
];

const loginSchema = [
  emailRule,
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileSchema = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .toLowerCase(),
  dateOfBirthRule,
  nationalityRule,
  body('password')
    .not()
    .exists()
    .withMessage('Password updates are not allowed in this route')
];

const updatePasswordSchema = [
  currentPasswordRule,
  newPasswordRule,
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    })
];

const toggleFavoriteSchema = [
  destinationIdRule
];

const paginationSchema = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Custom validation middleware
const validateRequest = (req, res, next) => {
  const errors = [];

  // Check for validation errors
  if (req.validationErrors) {
    errors.push(...req.validationErrors);
  }

  if (errors.length > 0) {
    const errorMessages = errors.map(error => error.msg);
    const errorDetails = errors.map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    throw new ValidationError(
      `Validation failed: ${errorMessages.join(', ')}`,
      errorDetails
    );
  }

  next();
};

// Sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potential XSS attempts
  const sanitizeString = (str) => {
    if (typeof str !== 'string') {
      return str;
    }
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };

  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key]);
      }
    });
  }

  next();
};

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updatePasswordSchema,
  toggleFavoriteSchema,
  paginationSchema,
  validateRequest,
  sanitizeInput
};