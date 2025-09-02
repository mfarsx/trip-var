const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const config = require('../config/config');

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    return log;
  })
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (config.server.isDevelopment ? 'warn' : 'info'),
  format: logFormat,
  defaultMeta: { service: 'tripvar-server' },
  transports: [
    // Console transport - only show warnings and errors in development
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || (config.server.isDevelopment ? 'warn' : 'info'),
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // Error log file
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    }),
    
    // Combined log file
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true
    }),
    
    // Access log file
    new DailyRotateFile({
      filename: path.join(logsDir, 'access-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      maxSize: '20m',
      maxFiles: '7d',
      zippedArchive: true
    })
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'exceptions.log') 
    })
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: path.join(logsDir, 'rejections.log') 
    })
  ]
});

// Remove duplicate console transport - already configured above

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  logger.http('Incoming request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    requestId: req.requestId
  });
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    logger.http('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.requestId
    });
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

// Add request ID middleware
const addRequestId = (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || 
                  req.headers['x-correlation-id'] || 
                  `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Structured logging methods
const info = (message, meta = {}) => {
  logger.info(message, meta);
};

const error = (message, meta = {}) => {
  logger.error(message, meta);
};

const warn = (message, meta = {}) => {
  logger.warn(message, meta);
};

const debug = (message, meta = {}) => {
  logger.debug(message, meta);
};

const http = (message, meta = {}) => {
  logger.http(message, meta);
};

// Performance logging
const performance = (operation, duration, meta = {}) => {
  logger.info('Performance metric', {
    operation,
    duration: `${duration}ms`,
    ...meta
  });
};

// Security logging
const security = (event, meta = {}) => {
  logger.warn('Security event', {
    event,
    ...meta
  });
};

// Business logic logging
const business = (event, meta = {}) => {
  logger.info('Business event', {
    event,
    ...meta
  });
};

// Database logging
const database = (operation, duration, meta = {}) => {
  logger.debug('Database operation', {
    operation,
    duration: `${duration}ms`,
    ...meta
  });
};

// API logging
const api = (endpoint, method, statusCode, duration, meta = {}) => {
  logger.info('API call', {
    endpoint,
    method,
    statusCode,
    duration: `${duration}ms`,
    ...meta
  });
};

// Error logging with context
const logError = (error, context = {}) => {
  logger.error('Application error', {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...context
  });
};

// Audit logging
const audit = (action, user, resource, meta = {}) => {
  logger.info('Audit log', {
    action,
    user: user?.id || 'anonymous',
    resource,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

// Health check logging
const health = (component, status, meta = {}) => {
  logger.info('Health check', {
    component,
    status,
    ...meta
  });
};

// Custom stream for Morgan HTTP logging
const morganStream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

module.exports = {
  logger,
  requestLogger,
  addRequestId,
  info,
  error,
  warn,
  debug,
  http,
  performance,
  security,
  business,
  database,
  api,
  logError,
  audit,
  health,
  morganStream
};