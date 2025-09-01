const { info, warn, error } = require('../utils/logger');
const { createError } = require('../utils/errors');

/**
 * Audit logging middleware for tracking important user actions
 */
const auditLogger = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after response is sent
      const auditData = {
        action,
        userId: req.user?.id || null,
        userEmail: req.user?.email || null,
        userRole: req.user?.role || null,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        requestId: req.requestId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        success: res.statusCode < 400
      };

      // Add additional context based on action type
      switch (action) {
        case 'USER_LOGIN':
          auditData.loginSuccess = res.statusCode === 200;
          break;
        case 'USER_REGISTRATION':
          auditData.registrationSuccess = res.statusCode === 201;
          break;
        case 'PASSWORD_CHANGE':
          auditData.passwordChangeSuccess = res.statusCode === 200;
          break;
        case 'BOOKING_CREATE':
          auditData.bookingId = req.body?.destinationId || null;
          break;
        case 'BOOKING_UPDATE':
          auditData.bookingId = req.params?.id || null;
          break;
        case 'BOOKING_DELETE':
          auditData.bookingId = req.params?.id || null;
          break;
        case 'REVIEW_CREATE':
          auditData.destinationId = req.body?.destinationId || null;
          break;
        case 'PAYMENT_PROCESS':
          auditData.paymentAmount = req.body?.amount || null;
          auditData.paymentMethod = req.body?.paymentMethod || null;
          break;
        case 'ADMIN_ACTION':
          auditData.adminAction = req.body?.action || null;
          break;
      }

      // Log based on success/failure
      if (res.statusCode < 400) {
        info(`Audit: ${action}`, auditData);
      } else {
        warn(`Audit: ${action} - Failed`, auditData);
      }

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Security event logging middleware
 */
const securityLogger = (eventType) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      const securityData = {
        eventType,
        userId: req.user?.id || null,
        userEmail: req.user?.email || null,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        requestId: req.requestId,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        headers: {
          'x-forwarded-for': req.get('x-forwarded-for'),
          'x-real-ip': req.get('x-real-ip'),
          'referer': req.get('referer'),
          'origin': req.get('origin')
        }
      };

      // Log security events
      warn(`Security Event: ${eventType}`, securityData);

      originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Performance monitoring middleware
 */
const performanceLogger = (req, res, next) => {
  const startTime = Date.now();
  
  const originalSend = res.send;
  
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    const performanceData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
      slowRequest: duration > 1000 // Flag requests taking more than 1 second
    };

    // Log slow requests as warnings
    if (duration > 1000) {
      warn('Slow Request Detected', performanceData);
    } else if (duration > 500) {
      info('Request Performance', performanceData);
    }

    originalSend.call(this, data);
  };

  next();
};

/**
 * Database operation logging middleware
 */
const databaseLogger = (operation, collection) => {
  return (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      const dbData = {
        operation,
        collection,
        userId: req.user?.id || null,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
        success: res.statusCode < 400
      };

      // Add operation-specific data
      if (req.body && Object.keys(req.body).length > 0) {
        dbData.operationData = {
          fields: Object.keys(req.body),
          recordCount: Array.isArray(req.body) ? req.body.length : 1
        };
      }

      info(`Database Operation: ${operation}`, dbData);

      originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Error tracking middleware
 */
const errorTracker = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (res.statusCode >= 400) {
      const errorData = {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        requestId: req.requestId,
        userId: req.user?.id || null,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        errorResponse: data,
        requestBody: req.body,
        requestQuery: req.query,
        requestParams: req.params
      };

      error('API Error Occurred', errorData);
    }

    originalSend.call(this, data);
  };

  next();
};

module.exports = {
  auditLogger,
  securityLogger,
  performanceLogger,
  databaseLogger,
  errorTracker
};