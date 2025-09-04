/**
 * Mock Redis service for testing
 * This prevents Redis connection issues during tests
 */

class MockRedis {
  constructor() {
    this.data = new Map();
    this.connected = true;
  }

  async get(key) {
    return this.data.get(key) || null;
  }

  async set(key, value, options = {}) {
    this.data.set(key, value);
    if (options.EX) {
      // Simulate expiration
      setTimeout(() => {
        this.data.delete(key);
      }, options.EX * 1000);
    }
    return 'OK';
  }

  async del(key) {
    return this.data.delete(key) ? 1 : 0;
  }

  async exists(key) {
    return this.data.has(key) ? 1 : 0;
  }

  async expire(key, seconds) {
    if (this.data.has(key)) {
      setTimeout(() => {
        this.data.delete(key);
      }, seconds * 1000);
      return 1;
    }
    return 0;
  }

  async flushall() {
    this.data.clear();
    return 'OK';
  }

  async ping() {
    return 'PONG';
  }

  async quit() {
    this.connected = false;
    return 'OK';
  }

  // Mock pub/sub methods
  async publish(channel, message) {
    return 1; // Mock successful publish
  }

  async subscribe(channel) {
    return 1; // Mock successful subscribe
  }

  async unsubscribe(channel) {
    return 1; // Mock successful unsubscribe
  }

  // Mock pipeline methods
  pipeline() {
    return {
      get: (key) => this,
      set: (key, value) => this,
      del: (key) => this,
      exec: async () => []
    };
  }
}

// Create singleton instance
const mockRedis = new MockRedis();

// Mock Redis client creation
const mockRedisClient = {
  createClient: () => mockRedis,
  Redis: MockRedis,
  default: MockRedis
};

// Mock the Redis constructor directly
const MockRedisConstructor = MockRedis;

module.exports = {
  mockRedis,
  mockRedisClient,
  MockRedisConstructor
};

// Export MockRedis as default for ES6 imports
module.exports.default = MockRedis;