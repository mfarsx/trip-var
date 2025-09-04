// Global Jest setup for Tripvar Server Tests

// Mock Redis before any other imports
jest.mock('ioredis', () => {
  const mockRedis = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
    flushall: jest.fn().mockResolvedValue('OK'),
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue('OK'),
    publish: jest.fn().mockResolvedValue(1),
    subscribe: jest.fn().mockResolvedValue(1),
    unsubscribe: jest.fn().mockResolvedValue(1),
    pipeline: jest.fn(() => ({
      get: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      del: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([])
    })),
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(),
    disconnect: jest.fn().mockResolvedValue(),
    status: 'ready'
  };

  return {
    Redis: jest.fn(() => mockRedis),
    default: jest.fn(() => mockRedis),
    createClient: jest.fn(() => mockRedis)
  };
});

// Mock Redis utilities
jest.mock('../config/redis', () => ({
  connectRedis: jest.fn().mockResolvedValue(),
  disconnectRedis: jest.fn().mockResolvedValue(),
  getRedisClient: jest.fn(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
    flushall: jest.fn().mockResolvedValue('OK'),
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue('OK'),
    status: 'ready'
  })),
  redisUtils: {
    deleteCache: jest.fn().mockResolvedValue(true),
    getCache: jest.fn().mockResolvedValue(null),
    setCache: jest.fn().mockResolvedValue('OK'),
    exists: jest.fn().mockResolvedValue(false),
    expire: jest.fn().mockResolvedValue(true),
    flushall: jest.fn().mockResolvedValue('OK')
  }
}));

// Mock logger to reduce noise in tests
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '1h';
process.env.LOG_LEVEL = 'error';
process.env.REDIS_URL = 'redis://localhost:6379';

// Increase timeout for tests
jest.setTimeout(30000);