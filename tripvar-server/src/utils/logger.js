const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config');

// Ensure logs directory exists
const logsDir = path.dirname(config.logging.filePath);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for structured logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const logEntry = {
      timestamp,
      level,
      message,
      service: 'tripvar-server',
      environment: config.server.nodeEnv,
      pid: process.pid,
      ...meta
    };
    
    if (stack) {
      logEntry.stack = stack;
    }
    
    return JSON.stringify(logEntry);
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// Create transports array
const transports = [];

// Console transport
transports.push(
  new winston.transports.Console({
    format: config.server.isDevelopment ? consoleFormat : structuredFormat,
    stderrLevels: ['error'],
    level: config.logging.level
  })
);

// File transport for production
if (config.server.isProduction) {
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: structuredFormat,
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      tailable: true
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: config.logging.filePath,
      format: structuredFormat,
      maxsize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      tailable: true
    })
  );

  // Daily rotating file transport
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDir, 'application-%DATE%.log'),
      datePattern: config.logging.datePattern,
      format: structuredFormat,
      maxSize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      zippedArchive: true
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: structuredFormat,
  transports,
  exitOnError: false,
  silent: config.server.isTest
});

// Add request ID to logs
const addRequestId = (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || 
    req.headers['x-correlation-id'] || 
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Enhanced logging functions with context
const createLoggerWithContext = (context = {}) => ({
  info: (message, meta = {}) => logger.info(message, { ...context, ...meta }),
  error: (message, meta = {}) => logger.error(message, { ...context, ...meta }),
  warn: (message, meta = {}) => logger.warn(message, { ...context, ...meta }),
  debug: (message, meta = {}) => logger.debug(message, { ...context, ...meta }),
  http: (message, meta = {}) => logger.http(message, { ...context, ...meta })
});

// Request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = req.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  const logContext = {
    requestId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: req.user?.id
  };

  logger.info('Request started', logContext);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const responseContext = {
      ...logContext,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length')
    };

    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', responseContext);
    } else {
      logger.info('Request completed', responseContext);
    }
  });

  next();
};

// Performance logger
const performanceLogger = (operation, startTime, meta = {}) => {
  const duration = Date.now() - startTime;
  logger.info(`Performance: ${operation}`, {
    operation,
    duration: `${duration}ms`,
    ...meta
  });
};

// Security logger
const securityLogger = {
  loginAttempt: (email, success, ip, userAgent) => {
    logger.warn('Login attempt', {
      event: 'login_attempt',
      email,
      success,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
  },
  
  suspiciousActivity: (activity, ip, userAgent, userId) => {
    logger.error('Suspicious activity detected', {
      event: 'suspicious_activity',
      activity,
      ip,
      userAgent,
      userId,
      timestamp: new Date().toISOString()
    });
  },
  
  rateLimitExceeded: (ip, endpoint, limit) => {
    logger.warn('Rate limit exceeded', {
      event: 'rate_limit_exceeded',
      ip,
      endpoint,
      limit,
      timestamp: new Date().toISOString()
    });
  }
};

// Create wrapper functions for common log levels
const info = (message, meta = {}) => logger.info(message, meta);
const error = (message, meta = {}) => logger.error(message, meta);
const warn = (message, meta = {}) => logger.warn(message, meta);
const debug = (message, meta = {}) => logger.debug(message, meta);
const http = (message, meta = {}) => logger.http(message, meta);

module.exports = {
  logger,
  info,
  error,
  warn,
  debug,
  http,
  addRequestId,
  requestLogger,
  performanceLogger,
  securityLogger,
  createLoggerWithContext
};
