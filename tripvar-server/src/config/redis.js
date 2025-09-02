const Redis = require('ioredis');
const { info, error, warn } = require('../utils/logger');
const config = require('./config');

let redisClient = null;

const connectRedis = async() => {
  try {
    const redisConfig = {
      ...config.redis,
      host: process.env.REDIS_HOST || 'redis',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || config.redis.password,
      db: process.env.REDIS_DB || 0
    };

    redisClient = new Redis(redisConfig);

    redisClient.on('connect', () => {
      info('Redis connected successfully', {
        host: redisConfig.host,
        port: redisConfig.port,
        db: redisConfig.db
      });
    });

    redisClient.on('ready', () => {
      info('Redis is ready to receive commands');
    });

    redisClient.on('error', (err) => {
      error('Redis connection error', { error: err.message });
    });

    redisClient.on('close', () => {
      warn('Redis connection closed');
    });

    redisClient.on('reconnecting', () => {
      info('Redis reconnecting...');
    });

    // Test the connection
    await redisClient.ping();

    return redisClient;
  } catch (err) {
    error('Failed to connect to Redis', { error: err.stack });
    throw err;
  }
};

const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

const disconnectRedis = async() => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    info('Redis disconnected');
  }
};

// Redis utility functions
const redisUtils = {
  // Cache with TTL
  async setCache(key, value, ttlSeconds = 3600) {
    const client = getRedisClient();
    const serializedValue = JSON.stringify(value);
    await client.setex(key, ttlSeconds, serializedValue);
  },

  // Get from cache
  async getCache(key) {
    const client = getRedisClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  },

  // Delete from cache
  async deleteCache(key) {
    const client = getRedisClient();
    await client.del(key);
  },

  // Cache with fallback function
  async getOrSet(key, fallbackFn, ttlSeconds = 3600) {
    const client = getRedisClient();
    const cached = await client.get(key);

    if (cached) {
      return JSON.parse(cached);
    }

    const result = await fallbackFn();
    await client.setex(key, ttlSeconds, JSON.stringify(result));
    return result;
  },

  // Batch cache operations
  async mget(keys) {
    const client = getRedisClient();
    const values = await client.mget(keys);
    return values.map(value => value ? JSON.parse(value) : null);
  },

  async mset(keyValuePairs, ttlSeconds = 3600) {
    const client = getRedisClient();
    const serializedPairs = {};

    for (const [key, value] of Object.entries(keyValuePairs)) {
      serializedPairs[key] = JSON.stringify(value);
    }

    await client.mset(serializedPairs);

    // Set TTL for all keys
    const pipeline = client.pipeline();
    for (const key of Object.keys(serializedPairs)) {
      pipeline.expire(key, ttlSeconds);
    }
    await pipeline.exec();
  },

  // Set session data
  async setSession(sessionId, data, ttlSeconds = 86400) { // 24 hours default
    const client = getRedisClient();
    const serializedData = JSON.stringify(data);
    await client.setex(`session:${sessionId}`, ttlSeconds, serializedData);
  },

  // Get session data
  async getSession(sessionId) {
    const client = getRedisClient();
    const data = await client.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
  },

  // Delete session
  async deleteSession(sessionId) {
    const client = getRedisClient();
    await client.del(`session:${sessionId}`);
  },

  // Rate limiting
  async checkRateLimit(key, limit, windowSeconds) {
    const client = getRedisClient();
    const current = await client.incr(key);

    if (current === 1) {
      await client.expire(key, windowSeconds);
    }

    return {
      allowed: current <= limit,
      current,
      limit,
      resetTime: await client.ttl(key)
    };
  },

  // Distributed lock
  async acquireLock(key, ttlSeconds = 10) {
    const client = getRedisClient();
    const lockKey = `lock:${key}`;
    const lockValue = `${Date.now()}-${Math.random()}`;

    const result = await client.set(lockKey, lockValue, 'PX', ttlSeconds * 1000, 'NX');
    return result === 'OK' ? lockValue : null;
  },

  async releaseLock(key, lockValue) {
    const client = getRedisClient();
    const lockKey = `lock:${key}`;
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    return await client.eval(script, 1, lockKey, lockValue);
  },

  // Check if key exists
  async exists(key) {
    const client = getRedisClient();
    return await client.exists(key);
  },

  // Set expiration for existing key
  async expire(key, ttlSeconds) {
    const client = getRedisClient();
    await client.expire(key, ttlSeconds);
  },

  // Get TTL
  async ttl(key) {
    const client = getRedisClient();
    return await client.ttl(key);
  },

  // Increment counter
  async incr(key, ttlSeconds = null) {
    const client = getRedisClient();
    const result = await client.incr(key);

    if (ttlSeconds && result === 1) {
      await client.expire(key, ttlSeconds);
    }

    return result;
  },

  // Hash operations
  async hset(key, field, value, ttlSeconds = null) {
    const client = getRedisClient();
    await client.hset(key, field, JSON.stringify(value));

    if (ttlSeconds) {
      await client.expire(key, ttlSeconds);
    }
  },

  async hget(key, field) {
    const client = getRedisClient();
    const value = await client.hget(key, field);
    return value ? JSON.parse(value) : null;
  },

  async hgetall(key) {
    const client = getRedisClient();
    const hash = await client.hgetall(key);
    const result = {};

    for (const [field, value] of Object.entries(hash)) {
      result[field] = JSON.parse(value);
    }

    return result;
  },

  // List operations
  async lpush(key, ...values) {
    const client = getRedisClient();
    const serializedValues = values.map(v => JSON.stringify(v));
    return await client.lpush(key, ...serializedValues);
  },

  async rpop(key) {
    const client = getRedisClient();
    const value = await client.rpop(key);
    return value ? JSON.parse(value) : null;
  },

  async llen(key) {
    const client = getRedisClient();
    return await client.llen(key);
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  disconnectRedis,
  redisUtils
};