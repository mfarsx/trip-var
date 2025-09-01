const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createError } = require('../utils/errors');
const { warn, error } = require('../utils/logger');

/**
 * Enhanced security middleware
 */
class SecurityManager {
  constructor() {
    this.suspiciousIPs = new Map();
    this.failedAttempts = new Map();
    this.blockedIPs = new Set();
  }

  /**
   * Create enhanced helmet configuration
   */
  createHelmetConfig() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          manifestSrc: ["'self'"],
          workerSrc: ["'self'", "blob:"],
          childSrc: ["'self'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: [],
        payment: [],
        usb: [],
        magnetometer: [],
        gyroscope: [],
        accelerometer: []
      }
    });
  }

  /**
   * IP-based security monitoring
   */
  trackSuspiciousActivity(req, res, next) {
    const ip = req.ip;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes

    // Check if IP is blocked
    if (this.blockedIPs.has(ip)) {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied',
        code: 'IP_BLOCKED',
        requestId: req.requestId,
        timestamp: new Date().toISOString()
      });
    }

    // Track suspicious patterns
    const suspiciousPatterns = [
      /\.\./, // Directory traversal
      /<script/i, // XSS attempts
      /union.*select/i, // SQL injection
      /javascript:/i, // JavaScript injection
      /eval\(/i, // Code injection
      /exec\(/i, // Command injection
    ];

    const requestString = JSON.stringify({
      url: req.originalUrl,
      body: req.body,
      query: req.query,
      headers: req.headers
    });

    let suspiciousScore = 0;
    suspiciousPatterns.forEach(pattern => {
      if (pattern.test(requestString)) {
        suspiciousScore++;
      }
    });

    if (suspiciousScore > 0) {
      const suspiciousData = this.suspiciousIPs.get(ip) || { count: 0, lastSeen: 0, score: 0 };
      
      // Reset if outside window
      if (now - suspiciousData.lastSeen > windowMs) {
        suspiciousData.count = 0;
        suspiciousData.score = 0;
      }

      suspiciousData.count++;
      suspiciousData.score += suspiciousScore;
      suspiciousData.lastSeen = now;
      this.suspiciousIPs.set(ip, suspiciousData);

      warn('Suspicious activity detected', {
        ip,
        suspiciousScore,
        totalScore: suspiciousData.score,
        count: suspiciousData.count,
        url: req.originalUrl,
        userAgent: req.get('User-Agent'),
        requestId: req.requestId
      });

      // Block IP if score is too high
      if (suspiciousData.score > 10 || suspiciousData.count > 20) {
        this.blockedIPs.add(ip);
        error('IP blocked due to suspicious activity', {
          ip,
          score: suspiciousData.score,
          count: suspiciousData.count,
          requestId: req.requestId
        });

        return res.status(403).json({
          status: 'fail',
          message: 'Access denied due to suspicious activity',
          code: 'SUSPICIOUS_ACTIVITY',
          requestId: req.requestId,
          timestamp: new Date().toISOString()
        });
      }
    }

    next();
  }

  /**
   * Request size limiting
   */
  createRequestSizeLimiter(maxSize = '10mb') {
    return (req, res, next) => {
      const contentLength = parseInt(req.get('content-length') || '0');
      const maxBytes = this.parseSize(maxSize);

      if (contentLength > maxBytes) {
        return res.status(413).json({
          status: 'fail',
          message: 'Request entity too large',
          code: 'REQUEST_TOO_LARGE',
          maxSize,
          requestId: req.requestId,
          timestamp: new Date().toISOString()
        });
      }

      next();
    };
  }

  /**
   * Parse size string to bytes
   */
  parseSize(size) {
    const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
    const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
    
    if (!match) return 10 * 1024 * 1024; // Default 10MB
    
    const value = parseFloat(match[1]);
    const unit = match[2] || 'b';
    
    return Math.floor(value * units[unit]);
  }

  /**
   * API key validation middleware
   */
  createApiKeyValidator(validKeys = []) {
    return (req, res, next) => {
      const apiKey = req.get('x-api-key');
      
      if (!apiKey) {
        return res.status(401).json({
          status: 'fail',
          message: 'API key required',
          code: 'API_KEY_REQUIRED',
          requestId: req.requestId,
          timestamp: new Date().toISOString()
        });
      }

      if (!validKeys.includes(apiKey)) {
        warn('Invalid API key attempt', {
          apiKey: apiKey.substring(0, 8) + '...',
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          requestId: req.requestId
        });

        return res.status(401).json({
          status: 'fail',
          message: 'Invalid API key',
          code: 'INVALID_API_KEY',
          requestId: req.requestId,
          timestamp: new Date().toISOString()
        });
      }

      next();
    };
  }

  /**
   * Request origin validation
   */
  createOriginValidator(allowedOrigins = []) {
    return (req, res, next) => {
      const origin = req.get('origin') || req.get('referer');
      
      if (!origin) {
        return next(); // Allow requests without origin (mobile apps, etc.)
      }

      const isAllowed = allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') {
          return origin === allowed || origin.startsWith(allowed);
        }
        if (allowed instanceof RegExp) {
          return allowed.test(origin);
        }
        return false;
      });

      if (!isAllowed) {
        warn('Request from unauthorized origin', {
          origin,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          requestId: req.requestId
        });

        return res.status(403).json({
          status: 'fail',
          message: 'Origin not allowed',
          code: 'ORIGIN_NOT_ALLOWED',
          requestId: req.requestId,
          timestamp: new Date().toISOString()
        });
      }

      next();
    };
  }

  /**
   * Request timing analysis
   */
  createTimingAnalyzer() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        
        // Log unusually slow requests
        if (duration > 5000) { // 5 seconds
          warn('Slow request detected', {
            method: req.method,
            url: req.originalUrl,
            duration: `${duration}ms`,
            statusCode: res.statusCode,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            requestId: req.requestId
          });
        }

        // Log suspiciously fast requests (potential automated attacks)
        if (duration < 10 && req.method !== 'GET') {
          warn('Unusually fast request', {
            method: req.method,
            url: req.originalUrl,
            duration: `${duration}ms`,
            statusCode: res.statusCode,
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            requestId: req.requestId
          });
        }
      });

      next();
    };
  }

  /**
   * User agent analysis
   */
  createUserAgentAnalyzer() {
    const suspiciousUserAgents = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
      /php/i,
      /^$/ // Empty user agent
    ];

    return (req, res, next) => {
      const userAgent = req.get('User-Agent') || '';
      
      const isSuspicious = suspiciousUserAgents.some(pattern => pattern.test(userAgent));
      
      if (isSuspicious) {
        warn('Suspicious user agent detected', {
          userAgent,
          ip: req.ip,
          url: req.originalUrl,
          method: req.method,
          requestId: req.requestId
        });
      }

      next();
    };
  }

  /**
   * Get security statistics
   */
  getSecurityStats() {
    return {
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size,
      failedAttempts: this.failedAttempts.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clear old security data
   */
  cleanup() {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    // Clean up old suspicious IP data
    for (const [ip, data] of this.suspiciousIPs.entries()) {
      if (now - data.lastSeen > maxAge) {
        this.suspiciousIPs.delete(ip);
      }
    }

    // Clean up old failed attempts
    for (const [ip, data] of this.failedAttempts.entries()) {
      if (now - data.lastAttempt > maxAge) {
        this.failedAttempts.delete(ip);
      }
    }
  }
}

/**
 * Create security middleware stack
 */
const createSecurityMiddleware = (options = {}) => {
  const {
    enableHelmet = true,
    enableSuspiciousTracking = true,
    enableRequestSizeLimit = true,
    enableTimingAnalysis = true,
    enableUserAgentAnalysis = true,
    maxRequestSize = '10mb',
    allowedOrigins = [],
    validApiKeys = []
  } = options;

  const securityManager = new SecurityManager();
  const middleware = [];

  // Helmet security headers
  if (enableHelmet) {
    middleware.push(securityManager.createHelmetConfig());
  }

  // Request size limiting
  if (enableRequestSizeLimit) {
    middleware.push(securityManager.createRequestSizeLimiter(maxRequestSize));
  }

  // Origin validation
  if (allowedOrigins.length > 0) {
    middleware.push(securityManager.createOriginValidator(allowedOrigins));
  }

  // API key validation
  if (validApiKeys.length > 0) {
    middleware.push(securityManager.createApiKeyValidator(validApiKeys));
  }

  // Suspicious activity tracking
  if (enableSuspiciousTracking) {
    middleware.push(securityManager.trackSuspiciousActivity.bind(securityManager));
  }

  // Timing analysis
  if (enableTimingAnalysis) {
    middleware.push(securityManager.createTimingAnalyzer());
  }

  // User agent analysis
  if (enableUserAgentAnalysis) {
    middleware.push(securityManager.createUserAgentAnalyzer());
  }

  // Cleanup old data every hour
  setInterval(() => {
    securityManager.cleanup();
  }, 60 * 60 * 1000);

  return {
    middleware,
    securityManager
  };
};

module.exports = {
  SecurityManager,
  createSecurityMiddleware
};