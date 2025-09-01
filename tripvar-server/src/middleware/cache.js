const { createError } = require('../utils/errors');
const { info, warn, error } = require('../utils/logger');

/**
 * Redis-based caching middleware
 */
class CacheManager {
  constructor(redisClient) {
    this.redis = redisClient;
    this.defaultTTL = 3600; // 1 hour in seconds
  }

  /**
   * Generate cache key
   */
  generateKey(prefix, identifier, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return paramString ? `${prefix}:${identifier}:${paramString}` : `${prefix}:${identifier}`;
  }

  /**
   * Get data from cache
   */
  async get(key) {
    try {
      if (!this.redis) {
        warn('Redis not available, skipping cache get', { key });
        return null;
      }

      const data = await this.redis.get(key);
      if (data) {
        info('Cache hit', { key });
        return JSON.parse(data);
      }
      
      info('Cache miss', { key });
      return null;
    } catch (err) {
      error('Cache get error', { key, error: err.message });
      return null;
    }
  }

  /**
   * Set data in cache
   */
  async set(key, data, ttl = this.defaultTTL) {
    try {
      if (!this.redis) {
        warn('Redis not available, skipping cache set', { key });
        return false;
      }

      await this.redis.setex(key, ttl, JSON.stringify(data));
      info('Cache set', { key, ttl });
      return true;
    } catch (err) {
      error('Cache set error', { key, error: err.message });
      return false;
    }
  }

  /**
   * Delete data from cache
   */
  async del(key) {
    try {
      if (!this.redis) {
        warn('Redis not available, skipping cache delete', { key });
        return false;
      }

      const result = await this.redis.del(key);
      info('Cache delete', { key, deleted: result > 0 });
      return result > 0;
    } catch (err) {
      error('Cache delete error', { key, error: err.message });
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   */
  async delPattern(pattern) {
    try {
      if (!this.redis) {
        warn('Redis not available, skipping cache pattern delete', { pattern });
        return false;
      }

      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        info('Cache pattern delete', { pattern, deletedCount: keys.length });
      }
      return true;
    } catch (err) {
      error('Cache pattern delete error', { pattern, error: err.message });
      return false;
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key) {
    try {
      if (!this.redis) {
        return false;
      }

      const result = await this.redis.exists(key);
      return result === 1;
    } catch (err) {
      error('Cache exists error', { key, error: err.message });
      return false;
    }
  }

  /**
   * Get TTL for a key
   */
  async ttl(key) {
    try {
      if (!this.redis) {
        return -1;
      }

      return await this.redis.ttl(key);
    } catch (err) {
      error('Cache TTL error', { key, error: err.message });
      return -1;
    }
  }
}

/**
 * Cache middleware factory
 */
const createCacheMiddleware = (cacheManager, options = {}) => {
  const {
    ttl = 3600,
    keyGenerator = (req) => {
      const { method, originalUrl, query, params, user } = req;
      const userKey = user?.id || 'anonymous';
      return `${method}:${originalUrl}:${userKey}:${JSON.stringify({ ...query, ...params })}`;
    },
    skipCache = (req, res) => {
      // Skip cache for non-GET requests or if user is admin
      return req.method !== 'GET' || req.user?.role === 'admin';
    },
    shouldCache = (req, res) => {
      // Only cache successful responses
      return res.statusCode === 200;
    }
  } = options;

  return async (req, res, next) => {
    // Skip caching if conditions are met
    if (skipCache(req, res)) {
      return next();
    }

    const cacheKey = keyGenerator(req);
    
    try {
      // Try to get from cache
      const cachedData = await cacheManager.get(cacheKey);
      if (cachedData) {
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        return res.json(cachedData);
      }

      // Store original send method
      const originalSend = res.send;
      
      // Override send method to cache response
      res.send = function(data) {
        // Only cache if conditions are met
        if (shouldCache(req, res)) {
          try {
            const responseData = JSON.parse(data);
            cacheManager.set(cacheKey, responseData, ttl);
            res.set('X-Cache', 'MISS');
            res.set('X-Cache-Key', cacheKey);
            res.set('X-Cache-TTL', ttl.toString());
          } catch (err) {
            warn('Failed to cache response', { 
              cacheKey, 
              error: err.message,
              requestId: req.requestId 
            });
          }
        }
        
        // Call original send
        originalSend.call(this, data);
      };

      next();
    } catch (err) {
      error('Cache middleware error', { 
        cacheKey, 
        error: err.message,
        requestId: req.requestId 
      });
      next();
    }
  };
};

/**
 * Cache invalidation middleware
 */
const createCacheInvalidation = (cacheManager, patterns = []) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Invalidate cache patterns after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        patterns.forEach(async (pattern) => {
          try {
            await cacheManager.delPattern(pattern);
            info('Cache invalidated', { pattern, requestId: req.requestId });
          } catch (err) {
            error('Cache invalidation error', { 
              pattern, 
              error: err.message,
              requestId: req.requestId 
            });
          }
        });
      }
      
      originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Predefined cache configurations
 */
const cacheConfigs = {
  // User data caching
  user: {
    ttl: 1800, // 30 minutes
    keyGenerator: (req) => {
      const userId = req.params.id || req.user?.id;
      return `user:${userId}`;
    },
    patterns: ['user:*']
  },

  // Destination data caching
  destination: {
    ttl: 3600, // 1 hour
    keyGenerator: (req) => {
      const destId = req.params.id;
      const query = req.query;
      return `destination:${destId}:${JSON.stringify(query)}`;
    },
    patterns: ['destination:*']
  },

  // Destination list caching
  destinations: {
    ttl: 1800, // 30 minutes
    keyGenerator: (req) => {
      const { page = 1, limit = 10, category, location, sort } = req.query;
      return `destinations:${page}:${limit}:${category || 'all'}:${location || 'all'}:${sort || 'default'}`;
    },
    patterns: ['destinations:*']
  },

  // Booking data caching
  booking: {
    ttl: 900, // 15 minutes
    keyGenerator: (req) => {
      const bookingId = req.params.id;
      const userId = req.user?.id;
      return `booking:${bookingId}:${userId}`;
    },
    patterns: ['booking:*', 'user:*:bookings']
  },

  // Review data caching
  review: {
    ttl: 1800, // 30 minutes
    keyGenerator: (req) => {
      const reviewId = req.params.id;
      const destId = req.params.destinationId;
      return `review:${reviewId}:${destId || 'list'}`;
    },
    patterns: ['review:*', 'destination:*:reviews']
  },

  // Search results caching
  search: {
    ttl: 600, // 10 minutes
    keyGenerator: (req) => {
      const { q, category, location, price_min, price_max, sort } = req.query;
      return `search:${q || 'all'}:${category || 'all'}:${location || 'all'}:${price_min || '0'}:${price_max || '999999'}:${sort || 'default'}`;
    },
    patterns: ['search:*']
  }
};

/**
 * Cache warming utility
 */
const warmCache = async (cacheManager, data, key, ttl = 3600) => {
  try {
    await cacheManager.set(key, data, ttl);
    info('Cache warmed', { key, ttl });
    return true;
  } catch (err) {
    error('Cache warming failed', { key, error: err.message });
    return false;
  }
};

/**
 * Cache statistics
 */
const getCacheStats = async (cacheManager) => {
  try {
    if (!cacheManager.redis) {
      return { status: 'Redis not available' };
    }

    const info = await cacheManager.redis.info('memory');
    const keyspace = await cacheManager.redis.info('keyspace');
    
    return {
      status: 'connected',
      memory: info,
      keyspace: keyspace,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    error('Failed to get cache stats', { error: err.message });
    return { status: 'error', error: err.message };
  }
};

module.exports = {
  CacheManager,
  createCacheMiddleware,
  createCacheInvalidation,
  cacheConfigs,
  warmCache,
  getCacheStats
};