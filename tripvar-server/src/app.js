const express = require('express');
const cors = require('cors');
const compression = require('compression');

// Core middleware
const errorHandler = require('./middleware/errorHandler');
const { requestLogger, addRequestId } = require('./utils/logger');
const { redisSession } = require('./middleware/redisCache');
const { NotFoundError } = require('./utils/errors');
const { error } = require('./utils/logger');

// Configuration
const { securityConfig } = require('./config/security');
const { specs, swaggerUi, swaggerOptions } = require('./config/swagger');

// Routes
const routes = require('./routes');
const healthRoutes = require('./routes/health.routes');

// Services
const { initialize: initializeServices } = require('./container/serviceRegistry');
const connectDB = require('./config/database');
const { connectRedis } = require('./config/redis');

const app = express();

// Initialize service registry
initializeServices();

// Connect to MongoDB
connectDB();

// Connect to Redis
connectRedis().catch((err) => {
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
app.all('*', (req, res, next) => {
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
