const { redisUtils } = require('../config/redis');
const { info } = require('../utils/logger');

/**
 * Redis caching middleware
 * @param {Object} options - Cache options
 * @param {string} options.key - Cache key (can be a function that receives req)
 * @param {number} options.ttl - Time to live in seconds (default: 3600)
 * @param {boolean} options.skipCache - Skip cache for certain conditions
 * @returns {Function} Express middleware function
 */
const redisCache = (options = {}) => {
  const { key, ttl = 3600, skipCache = false } = options;

  return async (req, res, next) => {
    // Skip caching if requested
    if (skipCache || req.query.skipCache === 'true') {
      return next();
    }

    try {
      // Generate cache key
      let cacheKey;
      if (typeof key === 'function') {
        cacheKey = key(req);
      } else if (key) {
        cacheKey = key;
      } else {
        // Default cache key based on URL and query params
        cacheKey = `cache:${req.method}:${req.originalUrl}`;
      }

      // Try to get from cache
      const cachedData = await redisUtils.getCache(cacheKey);
      
      if (cachedData) {
        info('Cache hit', { key: cacheKey, path: req.path });
        return res.json({
          ...cachedData,
          _cached: true,
          _cacheKey: cacheKey
        });
      }

      // Cache miss - continue to route handler
      info('Cache miss', { key: cacheKey, path: req.path });
      
      // Store original res.json to intercept response
      const originalJson = res.json;
      res.json = function(data) {
        // Cache the response (async, don't wait)
        redisUtils.setCache(cacheKey, data, ttl).catch(err => {
          console.error('Failed to cache response:', err);
        });
        
        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      // If Redis fails, continue without caching
      console.error('Redis cache middleware error:', error);
      next();
    }
  };
};

/**
 * Invalidate cache by key pattern
 * @param {string} pattern - Key pattern to invalidate
 */
const invalidateCache = async (pattern) => {
  try {
    const { getRedisClient } = require('../config/redis');
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    
    if (keys.length > 0) {
      await client.del(...keys);
      info('Cache invalidated', { pattern, keysCount: keys.length });
    }
  } catch (error) {
    console.error('Failed to invalidate cache:', error);
  }
};

/**
 * Session middleware using Redis
 */
const redisSession = (options = {}) => {
  const { ttl = 86400 } = options; // 24 hours default

  return async (req, res, next) => {
    try {
      // Get session ID from cookie or header
      const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
      
      if (sessionId) {
        const sessionData = await redisUtils.getSession(sessionId);
        if (sessionData) {
          req.session = sessionData;
        }
      }

      // Add session methods to response
      res.setSession = async (data) => {
        const newSessionId = sessionId || require('crypto').randomUUID();
        await redisUtils.setSession(newSessionId, data, ttl);
        res.cookie('sessionId', newSessionId, { 
          httpOnly: true, 
          secure: process.env.NODE_ENV === 'production',
          maxAge: ttl * 1000 
        });
        req.session = data;
        return newSessionId;
      };

      res.clearSession = async () => {
        if (sessionId) {
          await redisUtils.deleteSession(sessionId);
          res.clearCookie('sessionId');
          delete req.session;
        }
      };

      next();
    } catch (error) {
      console.error('Redis session middleware error:', error);
      next();
    }
  };
};

module.exports = {
  redisCache,
  invalidateCache,
  redisSession
};