// Test-specific app configuration that doesn't connect to external services
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Mock external services before importing routes

// Mock security config with relaxed rate limiting for tests
jest.mock('../config/security', () => {
  const { body, validationResult } = require('express-validator');
  
  return {
    securityConfig: {
      authLimiter: (req, res, next) => next(), // Skip rate limiting in tests
      generalLimiter: (req, res, next) => next() // Skip rate limiting in tests
    },
    validationRules: {
      // Auth validation rules
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
      destinationTitle: Object.assign((req, res, next) => {
        body('title')
          .trim()
          .isLength({ min: 3, max: 100 })
          .withMessage('Title must be between 3 and 100 characters')
          .run(req)
          .then(() => next());
      }, {
        optional: () => (req, res, next) => {
          body('title')
            .optional()
            .trim()
            .isLength({ min: 3, max: 100 })
            .withMessage('Title must be between 3 and 100 characters')
            .run(req)
            .then(() => next());
        }
      }),
      destinationDescription: Object.assign((req, res, next) => {
        body('description')
          .trim()
          .isLength({ min: 10, max: 1000 })
          .withMessage('Description must be between 10 and 1000 characters')
          .run(req)
          .then(() => next());
      }, {
        optional: () => (req, res, next) => {
          body('description')
            .optional()
            .trim()
            .isLength({ min: 10, max: 1000 })
            .withMessage('Description must be between 10 and 1000 characters')
            .run(req)
            .then(() => next());
        }
      }),
      destinationImageUrl: Object.assign((req, res, next) => {
        body('imageUrl')
          .isURL()
          .withMessage('Please provide a valid image URL')
          .run(req)
          .then(() => next());
      }, {
        optional: () => (req, res, next) => {
          body('imageUrl')
            .optional()
            .isURL()
            .withMessage('Please provide a valid image URL')
            .run(req)
            .then(() => next());
        }
      }),
      destinationRating: Object.assign((req, res, next) => {
        body('rating')
          .isFloat({ min: 0, max: 5 })
          .withMessage('Rating must be between 0 and 5')
          .run(req)
          .then(() => next());
      }, {
        optional: () => (req, res, next) => {
          body('rating')
            .optional()
            .isFloat({ min: 0, max: 5 })
            .withMessage('Rating must be between 0 and 5')
            .run(req)
            .then(() => next());
        }
      }),
      destinationPrice: Object.assign((req, res, next) => {
        body('price')
          .isFloat({ min: 0 })
          .withMessage('Price must be a positive number')
          .run(req)
          .then(() => next());
      }, {
        optional: () => (req, res, next) => {
          body('price')
            .optional()
            .isFloat({ min: 0 })
            .withMessage('Price must be a positive number')
            .run(req)
            .then(() => next());
        }
      }),
      destinationLocation: Object.assign((req, res, next) => {
        body('location')
          .trim()
          .isLength({ min: 2, max: 100 })
          .withMessage('Location must be between 2 and 100 characters')
          .run(req)
          .then(() => next());
      }, {
        optional: () => (req, res, next) => {
          body('location')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Location must be between 2 and 100 characters')
            .run(req)
            .then(() => next());
        }
      }),
      destinationCategory: Object.assign((req, res, next) => {
        body('category')
          .isIn(['Beach', 'Mountain', 'City', 'Cultural', 'Adventure'])
          .withMessage('Category must be one of: Beach, Mountain, City, Cultural, Adventure')
          .run(req)
          .then(() => next());
      }, {
        optional: () => (req, res, next) => {
          body('category')
            .optional()
            .isIn(['Beach', 'Mountain', 'City', 'Cultural', 'Adventure'])
            .withMessage('Category must be one of: Beach, Mountain, City, Cultural, Adventure')
            .run(req)
            .then(() => next());
        }
      }),
      
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
    },
    validateRequest: (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        const errorDetails = errors.array().map(error => ({
          field: error.param,
          message: error.msg,
          value: error.value,
          location: error.location
        }));

        return res.status(400).json({
          status: 'fail',
          message: `Validation failed: ${errorMessages.join(', ')}`,
          details: errorDetails
        });
      }
      next();
    }
  };
});

// Mock redis config for tests
jest.mock('../config/redis', () => ({
  redisUtils: {
    setCache: jest.fn().mockResolvedValue(undefined),
    getCache: jest.fn().mockResolvedValue(null),
    deleteCache: jest.fn().mockResolvedValue(undefined),
    clearCache: jest.fn().mockResolvedValue(undefined),
    getCacheKeys: jest.fn().mockResolvedValue([]),
    getCacheInfo: jest.fn().mockResolvedValue({}),
    isConnected: jest.fn().mockReturnValue(true)
  },
  connectRedis: jest.fn().mockResolvedValue(undefined),
  getRedisClient: jest.fn().mockReturnValue({
    setex: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    flushdb: jest.fn().mockResolvedValue('OK'),
    keys: jest.fn().mockResolvedValue([]),
    info: jest.fn().mockResolvedValue('redis_version:6.0.0'),
    ping: jest.fn().mockResolvedValue('PONG'),
    set: jest.fn().mockResolvedValue('OK'),
    exists: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
    flushall: jest.fn().mockResolvedValue('OK'),
    quit: jest.fn().mockResolvedValue('OK'),
    status: 'ready'
  })
}));

// Import routes
const authRoutes = require('../routes/auth.routes');
const destinationRoutes = require('../routes/destination.routes');
const bookingRoutes = require('../routes/booking.routes');
const reviewRoutes = require('../routes/review.routes');
const paymentRoutes = require('../routes/payment.routes');
const notificationRoutes = require('../routes/notification.routes');
const healthRoutes = require('../routes/health.routes');

// Import middleware
const errorHandler = require('../middleware/errorHandler');

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for testing
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count', 'X-Request-ID']
}));

// Compression middleware
app.use(compression());

// Rate limiting (relaxed for testing)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for testing)
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Speed limiting (relaxed for testing)
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 500, // allow 500 requests per 15 minutes, then... (increased for testing)
  delayMs: () => 100, // begin adding 100ms of delay per request above 500 (reduced for testing)
  validate: { delayMs: false } // Disable validation warning
});
app.use('/api/', speedLimiter);

// Request ID middleware
app.use((req, res, next) => {
  req.requestId = req.id || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.set('X-Request-ID', req.requestId);
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



// Request validation middleware (disabled for tests)
// app.use(validateRequest);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/destinations', destinationRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/health', healthRoutes);

// 404 handler for undefined routes
app.use('*', (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  error.status = 'fail';
  error.code = 'ROUTE_NOT_FOUND';
  error.isOperational = true;
  next(error);
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;