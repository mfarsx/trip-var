const { redisUtils } = require('../config/redis');
const { performanceLogger } = require('../utils/logger');

// Cache middleware for API responses
const cacheMiddleware = (ttlSeconds = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching for authenticated requests (unless explicitly allowed)
    if (req.user && !req.query.allowCache) {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator 
        ? keyGenerator(req)
        : `cache:${req.method}:${req.originalUrl}:${JSON.stringify(req.query)}`;

      // Try to get from cache
      const startTime = Date.now();
      const cachedData = await redisUtils.getCache(cacheKey);
      
      if (cachedData) {
        performanceLogger('cache_hit', startTime, { key: cacheKey });
        
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        return res.json(cachedData);
      }

      // Cache miss - continue to route handler
      performanceLogger('cache_miss', startTime, { key: cacheKey });
      
      // Store original res.json
      const originalJson = res.json.bind(res);
      
      // Override res.json to cache the response
      res.json = function(data) {
        // Cache the response
        redisUtils.setCache(cacheKey, data, ttlSeconds).catch(err => {
          console.error('Failed to cache response:', err);
        });
        
        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
        
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next(); // Continue without caching
    }
  };
};

// Cache invalidation middleware
const invalidateCache = (pattern) => {
  return async (req, res, next) => {
    try {
      const client = redisUtils.getRedisClient();
      
      // Find all keys matching the pattern
      const keys = await client.keys(pattern);
      
      if (keys.length > 0) {
        await client.del(...keys);
        console.log(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
      }
      
      next();
    } catch (error) {
      console.error('Cache invalidation error:', error);
      next(); // Continue even if cache invalidation fails
    }
  };
};

// Cache warming utility
const warmCache = async (key, data, ttlSeconds = 3600) => {
  try {
    await redisUtils.setCache(key, data, ttlSeconds);
    console.log(`Cache warmed for key: ${key}`);
  } catch (error) {
    console.error('Cache warming error:', error);
  }
};

// Cache statistics
const getCacheStats = async () => {
  try {
    const client = redisUtils.getRedisClient();
    const info = await client.info('memory');
    const keyspace = await client.info('keyspace');
    
    return {
      memory: info,
      keyspace: keyspace,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return null;
  }
};

module.exports = {
  cacheMiddleware,
  invalidateCache,
  warmCache,
  getCacheStats
};