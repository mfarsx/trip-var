const { info, error: logError } = require("../utils/logger");

/**
 * Cache Service with TTL support
 * Uses Redis if available, falls back to in-memory cache
 */
class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
    this.redisClient = null;
    this.useRedis = false;
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds

    // Try to initialize Redis
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection
   */
  async initializeRedis() {
    try {
      // Try to require redis config
      const redisConfig = require("../config/redis");
      if (redisConfig && redisConfig.client) {
        this.redisClient = redisConfig.client;
        this.useRedis = true;
        info("Cache service initialized with Redis");
      } else {
        info("Cache service initialized with in-memory storage");
      }
    } catch (err) {
      info("Redis not available, using in-memory cache");
    }
  }

  /**
   * Generate cache key
   */
  generateKey(prefix, ...parts) {
    return `${prefix}:${parts.filter(Boolean).join(":")}`;
  }

  /**
   * Set a value in cache with TTL
   */
  async set(key, value, ttl = this.defaultTTL) {
    try {
      if (this.useRedis && this.redisClient) {
        // Store in Redis with TTL in seconds
        const serialized = JSON.stringify(value);
        await this.redisClient.setEx(key, Math.floor(ttl / 1000), serialized);
      } else {
        // Store in memory
        this.cache.set(key, value);

        // Set TTL
        const expiryTime = Date.now() + ttl;
        this.ttls.set(key, expiryTime);

        // Schedule cleanup
        setTimeout(() => {
          this.delete(key);
        }, ttl);
      }
      return true;
    } catch (err) {
      logError("Error setting cache:", err);
      return false;
    }
  }

  /**
   * Get a value from cache
   */
  async get(key) {
    try {
      if (this.useRedis && this.redisClient) {
        const value = await this.redisClient.get(key);
        return value ? JSON.parse(value) : null;
      } else {
        // Check if expired
        const expiryTime = this.ttls.get(key);
        if (expiryTime && Date.now() > expiryTime) {
          this.delete(key);
          return null;
        }
        return this.cache.get(key) || null;
      }
    } catch (err) {
      logError("Error getting cache:", err);
      return null;
    }
  }

  /**
   * Delete a value from cache
   */
  async delete(key) {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.del(key);
      } else {
        this.cache.delete(key);
        this.ttls.delete(key);
      }
      return true;
    } catch (err) {
      logError("Error deleting cache:", err);
      return false;
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  async deletePattern(pattern) {
    try {
      if (this.useRedis && this.redisClient) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
        }
      } else {
        // In-memory: delete keys that match pattern
        const regex = new RegExp(
          pattern.replace(/\*/g, ".*").replace(/\?/g, ".")
        );
        for (const key of this.cache.keys()) {
          if (regex.test(key)) {
            this.cache.delete(key);
            this.ttls.delete(key);
          }
        }
      }
      return true;
    } catch (err) {
      logError("Error deleting cache pattern:", err);
      return false;
    }
  }

  /**
   * Check if key exists and is not expired
   */
  async has(key) {
    try {
      if (this.useRedis && this.redisClient) {
        const exists = await this.redisClient.exists(key);
        return exists === 1;
      } else {
        const expiryTime = this.ttls.get(key);
        if (expiryTime && Date.now() > expiryTime) {
          this.delete(key);
          return false;
        }
        return this.cache.has(key);
      }
    } catch (err) {
      logError("Error checking cache:", err);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  async clear() {
    try {
      if (this.useRedis && this.redisClient) {
        await this.redisClient.flushDb();
      } else {
        this.cache.clear();
        this.ttls.clear();
      }
      info("Cache cleared");
      return true;
    } catch (err) {
      logError("Error clearing cache:", err);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats() {
    try {
      if (this.useRedis && this.redisClient) {
        const info = await this.redisClient.info("stats");
        return {
          type: "redis",
          info,
        };
      } else {
        return {
          type: "memory",
          size: this.cache.size,
          keys: Array.from(this.cache.keys()),
        };
      }
    } catch (err) {
      logError("Error getting cache stats:", err);
      return null;
    }
  }

  /**
   * Wrap a function with caching
   */
  async wrap(key, ttl, fn) {
    // Check cache first
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Execute function
    const result = await fn();

    // Cache result
    await this.set(key, result, ttl);

    return result;
  }
}

// Export singleton instance
module.exports = new CacheService();
