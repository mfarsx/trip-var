const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

/**
 * Validation middleware factory
 * @param {Array} validations - Array of validation rules
 * @returns {Function} Express middleware function
 */
const validate = (validations) => {
  return async (req, res, next) => {
    try {
      // Run all validations
      await Promise.all(validations.map(validation => validation.run(req)));
      
      // Check for validation errors
      const errors = validationResult(req);
      
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        const errorDetails = errors.array().map(error => ({
          field: error.param,
          message: error.msg,
          value: error.value,
          location: error.location
        }));
        
        const validationError = new ValidationError(
          `Validation failed: ${errorMessages.join(', ')}`,
          errorDetails
        );
        
        return next(validationError);
      }
      
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Sanitization middleware
 * @param {Object} options - Sanitization options
 * @returns {Function} Express middleware function
 */
const sanitize = (options = {}) => {
  const {
    removeHtml = true,
    removeScripts = true,
    trimStrings = true,
    allowedTags = [],
    maxLength = 1000
  } = options;
  
  return (req, res, next) => {
    const sanitizeString = (str) => {
      if (typeof str !== 'string') return str;
      
      let sanitized = str;
      
      // Trim whitespace
      if (trimStrings) {
        sanitized = sanitized.trim();
      }
      
      // Remove HTML tags
      if (removeHtml) {
        sanitized = sanitized.replace(/<[^>]*>/g, '');
      }
      
      // Remove script tags and javascript: protocols
      if (removeScripts) {
        sanitized = sanitized
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
      
      // Limit length
      if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
      }
      
      return sanitized;
    };
    
    // Sanitize request body
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeString(req.body[key]);
        } else if (Array.isArray(req.body[key])) {
          req.body[key] = req.body[key].map(item => 
            typeof item === 'string' ? sanitizeString(item) : item
          );
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
    
    // Sanitize URL parameters
    if (req.params) {
      Object.keys(req.params).forEach(key => {
        if (typeof req.params[key] === 'string') {
          req.params[key] = sanitizeString(req.params[key]);
        }
      });
    }
    
    next();
  };
};

/**
 * Rate limiting validation
 * @param {Object} options - Rate limiting options
 * @returns {Function} Express middleware function
 */
const rateLimitValidation = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests from this IP, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;
  
  const requests = new Map();
  
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    if (requests.has(key)) {
      const userRequests = requests.get(key).filter(timestamp => timestamp > windowStart);
      requests.set(key, userRequests);
    } else {
      requests.set(key, []);
    }
    
    const userRequests = requests.get(key);
    
    // Check if limit exceeded
    if (userRequests.length >= max) {
      return res.status(429).json({
        status: 'error',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request
    userRequests.push(now);
    requests.set(key, userRequests);
    
    next();
  };
};

/**
 * File upload validation
 * @param {Object} options - File validation options
 * @returns {Function} Express middleware function
 */
const fileValidation = (options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
    maxFiles = 1
  } = options;
  
  return (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        return next();
      }
      
      const files = Array.isArray(req.files) ? req.files : [req.files];
      
      // Check number of files
      if (files.length > maxFiles) {
        const error = new ValidationError(`Maximum ${maxFiles} file(s) allowed`);
        return next(error);
      }
      
      // Validate each file
      for (const file of files) {
        // Check file size
        if (file.size > maxSize) {
          const error = new ValidationError(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
          return next(error);
        }
        
        // Check file type
        if (!allowedTypes.includes(file.mimetype)) {
          const error = new ValidationError(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
          return next(error);
        }
      }
      
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * MongoDB ObjectId validation
 * @param {string} paramName - Parameter name to validate
 * @returns {Function} Express middleware function
 */
const validateObjectId = (paramName) => {
  return (req, res, next) => {
    try {
      const id = req.params[paramName];
      
      if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
        const error = new ValidationError(`Invalid ${paramName} format`);
        return next(error);
      }
      
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Pagination validation
 * @returns {Function} Express middleware function
 */
const validatePagination = () => {
  return (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      if (page < 1) {
        const error = new ValidationError('Page must be a positive integer');
        return next(error);
      }
      
      if (limit < 1 || limit > 100) {
        const error = new ValidationError('Limit must be between 1 and 100');
        return next(error);
      }
      
      req.pagination = {
        page,
        limit,
        skip: (page - 1) * limit
      };
      
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = {
  validate,
  sanitize,
  rateLimitValidation,
  fileValidation,
  validateObjectId,
  validatePagination
};