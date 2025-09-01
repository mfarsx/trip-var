const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

// Security middleware configuration
const securityConfig = {
  // Helmet configuration for security headers
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }),

  // Rate limiting configuration
  generalLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
      });
    }
  }),

  // Strict rate limiting for auth endpoints
  authLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
      });
    }
  }),

  // CORS configuration
  corsOptions: {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:5173', 'http://localhost:3000'];
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
  }
};

// Input validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Common validation rules
const validationRules = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  // Destination validation rules
  destinationTitle: body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  destinationDescription: body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  destinationImageUrl: body('imageUrl')
    .isURL()
    .withMessage('Please provide a valid image URL'),
  
  destinationRating: body('rating')
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be between 0 and 5'),
  
  destinationPrice: body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  destinationLocation: body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  
  destinationCategory: body('category')
    .isIn(['Beach', 'Mountain', 'City', 'Cultural', 'Adventure'])
    .withMessage('Category must be one of: Beach, Mountain, City, Cultural, Adventure'),
  
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
  
  // Payment validation rules
  paymentMethod: body('paymentMethod')
    .isIn(['credit-card', 'paypal', 'bank-transfer'])
    .withMessage('Payment method must be credit-card, paypal, or bank-transfer'),
  
  paymentDetails: body('paymentDetails')
    .isObject()
    .withMessage('Payment details must be provided'),
  
  refundReason: body('reason')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Refund reason must be between 5 and 200 characters'),
  
  // Notification validation rules
  notificationIds: body('notificationIds')
    .isArray({ min: 1 })
    .withMessage('Notification IDs must be provided as an array'),
  
  notificationUserId: body('userId')
    .isMongoId()
    .withMessage('Please provide a valid user ID'),
  
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
      'system'
    ])
    .withMessage('Invalid notification type'),
  
  notificationPriority: body('priority')
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent')
};

module.exports = {
  securityConfig,
  validateRequest,
  validationRules
};