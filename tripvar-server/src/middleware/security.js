const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');
const { security } = require('../utils/logger');

/**
 * Security middleware configuration
 */
class SecurityMiddleware {
  constructor() {
    this.setupHelmet();
    this.setupRateLimiters();
    this.setupSlowDown();
  }

  /**
   * Setup Helmet security headers
   */
  setupHelmet() {
    this.helmet = helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ['\'self\''],
          styleSrc: ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
          fontSrc: ['\'self\'', 'https://fonts.gstatic.com'],
          imgSrc: ['\'self\'', 'data:', 'https:'],
          scriptSrc: ['\'self\''],
          connectSrc: ['\'self\''],
          frameSrc: ['\'none\''],
          objectSrc: ['\'none\''],
          upgradeInsecureRequests: []
        }
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
    });
  }

  /**
   * Setup rate limiters
   */
  setupRateLimiters() {
    // General API rate limiter
    this.generalLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        security('Rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
          method: req.method
        });

        res.status(429).json({
          error: 'Too many requests from this IP, please try again later.',
          retryAfter: '15 minutes'
        });
      }
    });

    // Strict rate limiter for authentication endpoints
    this.authLimiter = rateLimit({
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
        security('Auth rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
          method: req.method
        });

        res.status(429).json({
          error: 'Too many authentication attempts, please try again later.',
          retryAfter: '15 minutes'
        });
      }
    });

    // Strict rate limiter for password reset
    this.passwordResetLimiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // limit each IP to 3 password reset attempts per hour
      message: {
        error: 'Too many password reset attempts, please try again later.',
        retryAfter: '1 hour'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        security('Password reset rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
          method: req.method
        });

        res.status(429).json({
          error: 'Too many password reset attempts, please try again later.',
          retryAfter: '1 hour'
        });
      }
    });

    // Rate limiter for file uploads
    this.uploadLimiter = rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // limit each IP to 10 uploads per hour
      message: {
        error: 'Too many file uploads, please try again later.',
        retryAfter: '1 hour'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        security('Upload rate limit exceeded', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
          method: req.method
        });

        res.status(429).json({
          error: 'Too many file uploads, please try again later.',
          retryAfter: '1 hour'
        });
      }
    });
  }

  /**
   * Setup slow down middleware
   */
  setupSlowDown() {
    this.slowDown = slowDown({
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: 50, // allow 50 requests per 15 minutes, then...
      delayMs: 500, // begin adding 500ms of delay per request above 50
      maxDelayMs: 20000, // max delay of 20 seconds
      onLimitReached: (req, res, options) => {
        security('Slow down limit reached', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
          method: req.method
        });
      }
    });
  }

  /**
   * Request size limiter middleware
   */
  requestSizeLimiter(maxSize = '10mb') {
    return (req, res, next) => {
      const contentLength = parseInt(req.get('content-length') || '0', 10);
      const maxSizeBytes = this.parseSize(maxSize);

      if (contentLength > maxSizeBytes) {
        security('Request size limit exceeded', {
          ip: req.ip,
          contentLength,
          maxSize: maxSizeBytes,
          path: req.path,
          method: req.method
        });

        return res.status(413).json({
          error: 'Request entity too large',
          message: `Request size exceeds the limit of ${maxSize}`
        });
      }

      next();
    };
  }

  /**
   * Parse size string to bytes
   */
  parseSize(size) {
    const units = {
      b: 1,
      kb: 1024,
      mb: 1024 * 1024,
      gb: 1024 * 1024 * 1024
    };

    const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
    if (!match) {
      return 10 * 1024 * 1024; // default 10MB
    }

    const value = parseFloat(match[1]);
    const unit = match[2] || 'b';

    return Math.floor(value * units[unit]);
  }

  /**
   * IP whitelist middleware
   */
  ipWhitelist(allowedIPs = []) {
    return (req, res, next) => {
      const clientIP = req.ip || req.connection.remoteAddress;

      if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
        security('IP not in whitelist', {
          ip: clientIP,
          userAgent: req.get('User-Agent'),
          path: req.path,
          method: req.method
        });

        return res.status(403).json({
          error: 'Access forbidden',
          message: 'Your IP address is not authorized to access this resource'
        });
      }

      next();
    };
  }

  /**
   * User agent validation middleware
   */
  userAgentValidator(allowedUserAgents = []) {
    return (req, res, next) => {
      const userAgent = req.get('User-Agent');

      if (allowedUserAgents.length > 0) {
        const isAllowed = allowedUserAgents.some(allowed =>
          userAgent && userAgent.toLowerCase().includes(allowed.toLowerCase())
        );

        if (!isAllowed) {
          security('User agent not allowed', {
            ip: req.ip,
            userAgent,
            path: req.path,
            method: req.method
          });

          return res.status(403).json({
            error: 'Access forbidden',
            message: 'User agent not allowed'
          });
        }
      }

      next();
    };
  }

  /**
   * Request timeout middleware
   */
  requestTimeout(timeoutMs = 30000) {
    return (req, res, next) => {
      req.setTimeout(timeoutMs, () => {
        security('Request timeout', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
          method: req.method,
          timeout: timeoutMs
        });

        if (!res.headersSent) {
          res.status(408).json({
            error: 'Request timeout',
            message: 'The request took too long to process'
          });
        }
      });

      next();
    };
  }

  /**
   * Security headers middleware
   */
  securityHeaders() {
    return (req, res, next) => {
      // Remove server header
      res.removeHeader('X-Powered-By');

      // Add custom security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

      next();
    };
  }

  /**
   * CSRF protection middleware (basic implementation)
   */
  csrfProtection() {
    return (req, res, next) => {
      // Skip CSRF for GET, HEAD, OPTIONS
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      // Check for CSRF token
      const token = req.get('X-CSRF-Token') || req.body._csrf;
      const sessionToken = req.session?.csrfToken;

      if (!token || !sessionToken || token !== sessionToken) {
        security('CSRF token validation failed', {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          path: req.path,
          method: req.method
        });

        return res.status(403).json({
          error: 'CSRF token validation failed',
          message: 'Invalid or missing CSRF token'
        });
      }

      next();
    };
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken() {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }
}

// Create singleton instance
const securityMiddleware = new SecurityMiddleware();

module.exports = {
  SecurityMiddleware,
  securityMiddleware,
  // Export individual middleware functions
  helmet: securityMiddleware.helmet,
  generalLimiter: securityMiddleware.generalLimiter,
  authLimiter: securityMiddleware.authLimiter,
  passwordResetLimiter: securityMiddleware.passwordResetLimiter,
  uploadLimiter: securityMiddleware.uploadLimiter,
  slowDown: securityMiddleware.slowDown,
  requestSizeLimiter: securityMiddleware.requestSizeLimiter.bind(securityMiddleware),
  ipWhitelist: securityMiddleware.ipWhitelist.bind(securityMiddleware),
  userAgentValidator: securityMiddleware.userAgentValidator.bind(securityMiddleware),
  requestTimeout: securityMiddleware.requestTimeout.bind(securityMiddleware),
  securityHeaders: securityMiddleware.securityHeaders.bind(securityMiddleware),
  csrfProtection: securityMiddleware.csrfProtection.bind(securityMiddleware),
  generateCSRFToken: securityMiddleware.generateCSRFToken.bind(securityMiddleware)
};