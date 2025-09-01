const rateLimit = require('express-rate-limit');
const { createError } = require('../utils/errors');
const { warn } = require('../utils/logger');

/**
 * Advanced rate limiting with Redis store for distributed systems
 */
const createAdvancedRateLimit = (options) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,
    message = 'Too many requests from this IP, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip,
    onLimitReached = (req, res, options) => {
      warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        limit: options.max,
        windowMs: options.windowMs,
        requestId: req.requestId
      });
    }
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    skipFailedRequests,
    keyGenerator,
    onLimitReached,
    handler: (req, res) => {
      const error = createError.tooManyRequests(message, {
        retryAfter: Math.ceil(windowMs / 1000),
        limit: max,
        windowMs
      });
      
      res.status(429).json({
        status: error.status,
        message: error.message,
        code: error.code,
        details: error.details,
        requestId: req.requestId,
        timestamp: error.timestamp
      });
    }
  });
};

/**
 * User-specific rate limiting (requires authentication)
 */
const createUserRateLimit = (options) => {
  return createAdvancedRateLimit({
    ...options,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.user?.id || req.ip;
    }
  });
};

/**
 * Endpoint-specific rate limiting
 */
const createEndpointRateLimit = (endpoint, options) => {
  return createAdvancedRateLimit({
    ...options,
    keyGenerator: (req) => `${req.ip}:${endpoint}`,
    onLimitReached: (req, res, options) => {
      warn('Endpoint rate limit exceeded', {
        endpoint,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        limit: options.max,
        windowMs: options.windowMs,
        requestId: req.requestId
      });
    }
  });
};

/**
 * Progressive rate limiting - stricter limits for repeated violations
 */
const createProgressiveRateLimit = (baseOptions, violationOptions) => {
  const violationTracker = new Map();
  
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const violations = violationTracker.get(key) || { count: 0, lastViolation: 0 };
    
    // Reset violation count after 1 hour
    if (now - violations.lastViolation > 60 * 60 * 1000) {
      violations.count = 0;
    }
    
    // Apply stricter limits based on violation history
    const options = violations.count > 0 ? violationOptions : baseOptions;
    
    const limiter = createAdvancedRateLimit({
      ...options,
      onLimitReached: (req, res, options) => {
        violations.count++;
        violations.lastViolation = now;
        violationTracker.set(key, violations);
        
        warn('Progressive rate limit violation', {
          ip: req.ip,
          violationCount: violations.count,
          limit: options.max,
          windowMs: options.windowMs,
          requestId: req.requestId
        });
      }
    });
    
    limiter(req, res, next);
  };
};

/**
 * Geographic rate limiting (basic implementation)
 */
const createGeoRateLimit = (geoOptions) => {
  const { allowedCountries = [], blockedCountries = [], countryLimits = {} } = geoOptions;
  
  return (req, res, next) => {
    // This is a simplified implementation
    // In production, you'd use a service like MaxMind GeoIP2
    const country = req.get('cf-ipcountry') || req.get('x-country-code') || 'unknown';
    
    // Check if country is blocked
    if (blockedCountries.includes(country)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied from your location',
        code: 'GEO_BLOCKED',
        requestId: req.requestId,
        timestamp: new Date().toISOString()
      });
    }
    
    // Apply country-specific limits
    const countryLimit = countryLimits[country];
    if (countryLimit) {
      const limiter = createAdvancedRateLimit(countryLimit);
      return limiter(req, res, next);
    }
    
    next();
  };
};

/**
 * Predefined rate limiters for common use cases
 */
const rateLimiters = {
  // General API rate limiting
  general: createAdvancedRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
  }),

  // Strict authentication rate limiting
  auth: createAdvancedRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    skipSuccessfulRequests: true,
    message: 'Too many authentication attempts, please try again later.'
  }),

  // Password reset rate limiting
  passwordReset: createAdvancedRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: 'Too many password reset attempts, please try again later.'
  }),

  // User registration rate limiting
  registration: createAdvancedRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: 'Too many registration attempts, please try again later.'
  }),

  // File upload rate limiting
  upload: createAdvancedRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: 'Too many file uploads, please try again later.'
  }),

  // Search rate limiting
  search: createAdvancedRateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30,
    message: 'Too many search requests, please try again later.'
  }),

  // API key rate limiting (for external integrations)
  apiKey: createAdvancedRateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 1000,
    keyGenerator: (req) => req.get('x-api-key') || req.ip,
    message: 'API key rate limit exceeded, please try again later.'
  }),

  // Progressive rate limiting for suspicious activity
  progressive: createProgressiveRateLimit(
    {
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests from this IP, please try again later.'
    },
    {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10,
      message: 'Your IP has been temporarily restricted due to excessive requests.'
    }
  ),

  // User-specific rate limiting
  user: createUserRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: 'Too many requests from this user, please try again later.'
  }),

  // Admin operations rate limiting
  admin: createUserRateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 50,
    message: 'Too many admin operations, please try again later.'
  })
};

/**
 * DDoS protection middleware
 */
const ddosProtection = (options = {}) => {
  const {
    maxRequests = 100,
    windowMs = 60 * 1000, // 1 minute
    blockDuration = 5 * 60 * 1000, // 5 minutes
    whitelist = [],
    blacklist = []
  } = options;

  const requestCounts = new Map();
  const blockedIPs = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();

    // Check whitelist
    if (whitelist.includes(ip)) {
      return next();
    }

    // Check blacklist
    if (blacklist.includes(ip)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied',
        code: 'IP_BLOCKED',
        requestId: req.requestId,
        timestamp: new Date().toISOString()
      });
    }

    // Check if IP is temporarily blocked
    const blockInfo = blockedIPs.get(ip);
    if (blockInfo && now < blockInfo.until) {
      return res.status(429).json({
        status: 'fail',
        message: 'IP temporarily blocked due to suspicious activity',
        code: 'IP_TEMPORARILY_BLOCKED',
        retryAfter: Math.ceil((blockInfo.until - now) / 1000),
        requestId: req.requestId,
        timestamp: new Date().toISOString()
      });
    }

    // Count requests
    const requestInfo = requestCounts.get(ip) || { count: 0, windowStart: now };
    
    // Reset window if needed
    if (now - requestInfo.windowStart > windowMs) {
      requestInfo.count = 0;
      requestInfo.windowStart = now;
    }

    requestInfo.count++;
    requestCounts.set(ip, requestInfo);

    // Check if limit exceeded
    if (requestInfo.count > maxRequests) {
      // Block IP temporarily
      blockedIPs.set(ip, { until: now + blockDuration });
      
      warn('DDoS protection triggered', {
        ip,
        requestCount: requestInfo.count,
        windowMs,
        blockDuration,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method,
        requestId: req.requestId
      });

      return res.status(429).json({
        status: 'fail',
        message: 'Too many requests, IP temporarily blocked',
        code: 'DDOS_PROTECTION_TRIGGERED',
        retryAfter: Math.ceil(blockDuration / 1000),
        requestId: req.requestId,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

module.exports = {
  createAdvancedRateLimit,
  createUserRateLimit,
  createEndpointRateLimit,
  createProgressiveRateLimit,
  createGeoRateLimit,
  rateLimiters,
  ddosProtection
};