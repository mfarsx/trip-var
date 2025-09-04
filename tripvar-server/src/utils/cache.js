/**
 * Cache utility functions for Redis operations
 */

const { performance, warn, error } = require('./logger');

/**
 * Cache utility class for Redis operations
 */
class CacheManager {
  constructor(redisClient) {
    this.redis = redisClient;
    this.defaultTTL = 3600; // 1 hour
  }

  /**
   * Set a cache value with TTL
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, ttl = this.defaultTTL) {
    if (!this.redis) {
      warn('Redis not available, skipping cache set', { key });
      return false;
    }

    const startTime = Date.now();
    
    try {
      const serializedValue = JSON.stringify(value);
      await this.redis.setex(key, ttl, serializedValue);
      
      const duration = Date.now() - startTime;
      performance('cache_set', duration, { key, ttl, success: true });
      
      return true;
    } catch (err) {
      const duration = Date.now() - startTime;
      performance('cache_set', duration, { key, ttl, success: false, error: err.message });
      error('Cache set error', { key, error: err.message });
      return false;
    }
  }

  /**
   * Get a cache value
   * @param {string} key - Cache key
   * @returns {Promise<*>} - Cached value or null
   */
  async get(key) {
    if (!this.redis) {
      warn('Redis not available, skipping cache get', { key });
      return null;
    }

    const startTime = Date.now();
    
    try {
      const value = await this.redis.get(key);
      
      const duration = Date.now() - startTime;
      performance('cache_get', duration, { key, success: true, hit: value !== null });
      
      if (value === null) {
        return null;
      }
      
      return JSON.parse(value);
    } catch (err) {
      const duration = Date.now() - startTime;
      performance('cache_get', duration, { key, success: false, error: err.message });
      error('Cache get error', { key, error: err.message });
      return null;
    }
  }

  /**
   * Delete a cache key
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Success status
   */
  async del(key) {
    if (!this.redis) {
      warn('Redis not available, skipping cache delete', { key });
      return false;
    }

    const startTime = Date.now();
    
    try {
      const result = await this.redis.del(key);
      
      const duration = Date.now() - startTime;
      performance('cache_del', duration, { key, success: true, deleted: result > 0 });
      
      return result > 0;
    } catch (err) {
      const duration = Date.now() - startTime;
      performance('cache_del', duration, { key, success: false, error: err.message });
      error('Cache delete error', { key, error: err.message });
      return false;
    }
  }

  /**
   * Check if a key exists
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Existence status
   */
  async exists(key) {
    if (!this.redis) {
      return false;
    }

    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (err) {
      error('Cache exists error', { key, error: err.message });
      return false;
    }
  }

  /**
   * Set expiration for a key
   * @param {string} key - Cache key
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async expire(key, ttl) {
    if (!this.redis) {
      return false;
    }

    try {
      const result = await this.redis.expire(key, ttl);
      return result === 1;
    } catch (err) {
      error('Cache expire error', { key, ttl, error: err.message });
      return false;
    }
  }

  /**
   * Get TTL for a key
   * @param {string} key - Cache key
   * @returns {Promise<number>} - TTL in seconds (-1 if no expiration, -2 if key doesn't exist)
   */
  async ttl(key) {
    if (!this.redis) {
      return -2;
    }

    try {
      return await this.redis.ttl(key);
    } catch (err) {
      error('Cache TTL error', { key, error: err.message });
      return -2;
    }
  }

  /**
   * Delete multiple keys
   * @param {Array<string>} keys - Array of cache keys
   * @returns {Promise<number>} - Number of keys deleted
   */
  async delMultiple(keys) {
    if (!this.redis || keys.length === 0) {
      return 0;
    }

    try {
      return await this.redis.del(...keys);
    } catch (err) {
      error('Cache delete multiple error', { keys, error: err.message });
      return 0;
    }
  }

  /**
   * Get multiple keys
   * @param {Array<string>} keys - Array of cache keys
   * @returns {Promise<Array>} - Array of values (null for missing keys)
   */
  async getMultiple(keys) {
    if (!this.redis || keys.length === 0) {
      return [];
    }

    try {
      const values = await this.redis.mget(...keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (err) {
      error('Cache get multiple error', { keys, error: err.message });
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple key-value pairs
   * @param {Object} keyValuePairs - Object with key-value pairs
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<boolean>} - Success status
   */
  async setMultiple(keyValuePairs, ttl = this.defaultTTL) {
    if (!this.redis || Object.keys(keyValuePairs).length === 0) {
      return false;
    }

    try {
      const pipeline = this.redis.pipeline();
      
      for (const [key, value] of Object.entries(keyValuePairs)) {
        const serializedValue = JSON.stringify(value);
        pipeline.setex(key, ttl, serializedValue);
      }
      
      await pipeline.exec();
      return true;
    } catch (err) {
      error('Cache set multiple error', { keys: Object.keys(keyValuePairs), error: err.message });
      return false;
    }
  }

  /**
   * Clear cache by pattern
   * @param {string} pattern - Key pattern (e.g., 'user:*')
   * @returns {Promise<number>} - Number of keys deleted
   */
  async clearByPattern(pattern) {
    if (!this.redis) {
      return 0;
    }

    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      
      return await this.redis.del(...keys);
    } catch (err) {
      error('Cache clear by pattern error', { pattern, error: err.message });
      return 0;
    }
  }

  /**
   * Increment a numeric value
   * @param {string} key - Cache key
   * @param {number} increment - Increment value (default: 1)
   * @returns {Promise<number>} - New value
   */
  async increment(key, increment = 1) {
    if (!this.redis) {
      return 0;
    }

    try {
      return await this.redis.incrby(key, increment);
    } catch (err) {
      error('Cache increment error', { key, increment, error: err.message });
      return 0;
    }
  }

  /**
   * Decrement a numeric value
   * @param {string} key - Cache key
   * @param {number} decrement - Decrement value (default: 1)
   * @returns {Promise<number>} - New value
   */
  async decrement(key, decrement = 1) {
    if (!this.redis) {
      return 0;
    }

    try {
      return await this.redis.decrby(key, decrement);
    } catch (err) {
      error('Cache decrement error', { key, decrement, error: err.message });
      return 0;
    }
  }
}

/**
 * Cache key generators
 */
const cacheKeys = {
  user: (id) => `user:${id}`,
  userProfile: (id) => `user:profile:${id}`,
  destination: (id) => `destination:${id}`,
  destinations: (filters) => `destinations:${JSON.stringify(filters)}`,
  booking: (id) => `booking:${id}`,
  userBookings: (userId, filters) => `user:${userId}:bookings:${JSON.stringify(filters)}`,
  notification: (id) => `notification:${id}`,
  userNotifications: (userId, filters) => `user:${userId}:notifications:${JSON.stringify(filters)}`,
  payment: (id) => `payment:${id}`,
  stats: (type) => `stats:${type}`,
  health: () => 'health:check'
};

/**
 * Cache TTL constants
 */
const cacheTTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes
  LONG: 3600,      // 1 hour
  VERY_LONG: 86400 // 24 hours
};

module.exports = {
  CacheManager,
  cacheKeys,
  cacheTTL
};