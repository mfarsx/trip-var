// Test-specific app configuration that doesn't connect to external services
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Mock external services before importing routes
jest.mock('../config/redis', () => ({
  connectRedis: jest.fn().mockResolvedValue(),
  disconnectRedis: jest.fn().mockResolvedValue(),
  getRedisClient: jest.fn(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
    flushall: jest.fn().mockResolvedValue('OK'),
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue('OK'),
    status: 'ready'
  })),
  redisUtils: {
    deleteCache: jest.fn().mockResolvedValue(true),
    getCache: jest.fn().mockResolvedValue(null),
    setCache: jest.fn().mockResolvedValue('OK'),
    exists: jest.fn().mockResolvedValue(false),
    expire: jest.fn().mockResolvedValue(true),
    flushall: jest.fn().mockResolvedValue('OK')
  }
}));

// Mock security config with relaxed rate limiting for tests
jest.mock('../config/security', () => ({
  securityConfig: {
    authLimiter: (req, res, next) => next(), // Skip rate limiting in tests
    generalLimiter: (req, res, next) => next() // Skip rate limiting in tests
  },
  validationRules: {
    // Auth validation rules
    email: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    password: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    name: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    
    // Destination validation rules
    destinationTitle: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    destinationDescription: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    destinationImageUrl: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    destinationRating: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    destinationPrice: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    destinationLocation: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    destinationCategory: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    
    // Review validation rules
    destinationId: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    reviewTitle: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    reviewContent: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    reviewRating: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    
    // Payment validation rules
    paymentMethod: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    paymentDetails: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    refundReason: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    
    // Notification validation rules
    notificationIds: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    notificationUserId: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    notificationTitle: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    notificationMessage: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    notificationType: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() }),
    notificationPriority: Object.assign((req, res, next) => next(), { optional: () => (req, res, next) => next() })
  },
  validateRequest: (req, res, next) => next()
}));

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
    info: jest.fn().mockResolvedValue('redis_version:6.0.0')
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
  credentials: true
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