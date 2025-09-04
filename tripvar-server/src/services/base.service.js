const { redisUtils } = require('../config/redis');

/**
 * Base service class with common functionality
 */
class BaseService {
  /**
   * Cache data with TTL
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   * @param {number} ttl - Time to live in seconds
   * @returns {Promise<void>}
   */
  async cacheData(key, data, ttl = 300) {
    try {
      await redisUtils.setCache(key, data, ttl);
    } catch (error) {
      console.warn(`Failed to cache data for key ${key}:`, error.message);
    }
  }

  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Promise<*>} Cached data or null
   */
  async getCachedData(key) {
    try {
      return await redisUtils.getCache(key);
    } catch (error) {
      console.warn(`Failed to get cached data for key ${key}:`, error.message);
      return null;
    }
  }

  /**
   * Delete cached data
   * @param {string} key - Cache key
   * @returns {Promise<void>}
   */
  async deleteCachedData(key) {
    try {
      await redisUtils.deleteCache(key);
    } catch (error) {
      console.warn(`Failed to delete cached data for key ${key}:`, error.message);
    }
  }

  /**
   * Clear cache by pattern
   * @param {string} pattern - Cache key pattern
   * @returns {Promise<number>} Number of keys deleted
   */
  async clearCacheByPattern(pattern) {
    try {
      const { getRedisClient } = require('../config/redis');
      const client = getRedisClient();
      const keys = await client.keys(pattern);

      if (keys.length > 0) {
        await client.del(...keys);
        return keys.length;
      }

      return 0;
    } catch (error) {
      console.warn(`Failed to clear cache by pattern ${pattern}:`, error.message);
      return 0;
    }
  }

  /**
   * Validate required fields
   * @param {Object} data - Data to validate
   * @param {Array<string>} requiredFields - Required field names
   * @throws {ValidationError} If validation fails
   */
  validateRequiredFields(data, requiredFields) {
    const missingFields = requiredFields.filter(field =>
      data[field] === undefined || data[field] === null || data[field] === ''
    );

    if (missingFields.length > 0) {
      const { ValidationError } = require('../utils/errors');
      throw new ValidationError(
        `Missing required fields: ${missingFields.join(', ')}`,
        { missingFields }
      );
    }
  }

  /**
   * Sanitize input data
   * @param {Object} data - Data to sanitize
   * @param {Array<string>} allowedFields - Allowed field names
   * @returns {Object} Sanitized data
   */
  sanitizeInput(data, allowedFields) {
    const sanitized = {};

    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key)) {
        // Basic sanitization
        if (typeof data[key] === 'string') {
          sanitized[key] = data[key].trim();
        } else {
          sanitized[key] = data[key];
        }
      }
    });

    return sanitized;
  }

  /**
   * Create pagination metadata
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} total - Total items
   * @returns {Object} Pagination metadata
   */
  createPaginationMeta(page, limit, total) {
    return {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    };
  }

  /**
   * Handle database operation with retry logic
   * @param {Function} operation - Database operation
   * @param {number} maxRetries - Maximum retry attempts
   * @returns {Promise<*>} Operation result
   */
  async withRetry(operation, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry on validation errors or authentication errors
        if (error.statusCode && error.statusCode < 500) {
          throw error;
        }

        if (attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}

module.exports = BaseService;