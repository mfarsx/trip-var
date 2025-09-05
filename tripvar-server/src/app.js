// Enhanced error handling for app initialization
let express, cors, compression, errorHandler, requestLogger, addRequestId, redisSession, NotFoundError, error, securityConfig, specs, swaggerUi, swaggerOptions, routes, healthRoutes, initializeServices, connectDB, connectRedis;

try {
  express = require('express');
  cors = require('cors');
  compression = require('compression');

  // Core middleware
  errorHandler = require('./middleware/errorHandler');
  const logger = require('./utils/logger');
  requestLogger = logger.requestLogger;
  addRequestId = logger.addRequestId;
  error = logger.error;
  
  const redisCache = require('./middleware/redisCache');
  redisSession = redisCache.redisSession;
  
  const errors = require('./utils/errors');
  NotFoundError = errors.NotFoundError;

  // Configuration
  const security = require('./config/security');
  securityConfig = security.securityConfig;
  
  const swagger = require('./config/swagger');
  specs = swagger.specs;
  swaggerUi = swagger.swaggerUi;
  swaggerOptions = swagger.swaggerOptions;

  // Routes
  routes = require('./routes');
  healthRoutes = require('./routes/health.routes');

  // Services
  const serviceRegistry = require('./container/serviceRegistry');
  initializeServices = serviceRegistry.initialize;
  connectDB = require('./config/database');
  const redis = require('./config/redis');
  connectRedis = redis.connectRedis;
} catch (err) {
  console.error('🚨 FAILED TO LOAD APP MODULES:', err.message);
  console.error('Stack trace:', err.stack);
  throw err;
}

const app = express();

// Initialize service registry with error handling
try {
  initializeServices();
  console.log('✅ Service registry initialized successfully');
} catch (err) {
  console.error('🚨 FAILED TO INITIALIZE SERVICE REGISTRY:', err.message);
  console.error('Stack trace:', err.stack);
  throw err;
}

// Connect to MongoDB with error handling
try {
  connectDB();
  console.log('✅ MongoDB connection initiated');
} catch (err) {
  console.error('🚨 FAILED TO INITIALIZE MONGODB CONNECTION:', err.message);
  console.error('Stack trace:', err.stack);
  throw err;
}

// Connect to Redis with error handling
connectRedis().catch((err) => {
  console.error('🚨 FAILED TO CONNECT TO REDIS:', err.message);
  console.error('Stack trace:', err.stack);
  error('Failed to connect to Redis', { error: err.message });
  // Don't exit the process, continue without Redis
});

// Security middleware
app.use(securityConfig.helmet);
app.use(compression());
app.use(cors(securityConfig.corsOptions));
app.use(securityConfig.generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure proper Content-Type headers for API responses
app.use('/api', (req, res, next) => {
  // Set default Content-Type for API responses
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Logging and session middleware
app.use(addRequestId);
app.use(requestLogger);
app.use(redisSession());

// Health check routes (outside of versioned API)
app.use('/health', healthRoutes);

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// API routes
app.use('/api/v1', routes);

// 404 handler for undefined routes
app.use((req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

// Global error handler
app.use((err, req, res, next) => {
  error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  errorHandler(err, req, res, next);
});

module.exports = app;
