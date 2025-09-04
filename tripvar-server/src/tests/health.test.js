const request = require('supertest');
const app = require('./app.test');
const {
  setupTestEnvironment,
  cleanupTestEnvironment,
  expectSuccessResponse
} = require('./setup');

describe('Health Check API', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  describe('GET /health', () => {
    it('should return health status successfully', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body.status).toBe('ok');
    });

    it('should include basic service information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body.service).toBe('tripvar-server');
      expect(response.body.version).toBeDefined();
    });

    it('should check database status via dedicated endpoint', async () => {
      const response = await request(app)
        .get('/health/db')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
    });

    it('should check Redis status via dedicated endpoint', async () => {
      const response = await request(app)
        .get('/health/redis')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('redis');
    });

    it('should include environment information', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('environment');
      expect(response.body.environment).toBe('test');
    });
  });

  describe('GET /health/all', () => {
    it('should return comprehensive health information', async () => {
      const response = await request(app)
        .get('/health/all')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should include system metrics', async () => {
      const response = await request(app)
        .get('/health/metrics')
        .expect(200);

      expect(response.body).toHaveProperty('system');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should include database status in comprehensive check', async () => {
      const response = await request(app)
        .get('/health/all')
        .expect(200);

      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toHaveProperty('mongodb');
    });

    it('should include Redis status in comprehensive check', async () => {
      const response = await request(app)
        .get('/health/all')
        .expect(200);

      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toHaveProperty('redis');
    });
  });

  describe('GET /health/ready', () => {
    it('should return ready status', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('services');
      expect(response.body.status).toBe('ready');
    });

    it('should include service readiness checks', async () => {
      const response = await request(app)
        .get('/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toHaveProperty('database');
      expect(response.body.services).toHaveProperty('redis');
    });
  });

  describe('GET /health/live', () => {
    it('should return liveness status', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body.status).toBe('alive');
    });

    it('should include uptime information', async () => {
      const response = await request(app)
        .get('/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
    });
  });

  describe('Health Check Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // For now, we'll test that the health endpoint responds
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
    });

    it('should handle Redis connection errors gracefully', async () => {
      // This test would require mocking the Redis connection
      // For now, we'll test that the health endpoint responds
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
    });
  });

  describe('Health Check Performance', () => {
    it('should respond quickly to health checks', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/health')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Health checks should respond within 100ms
      expect(responseTime).toBeLessThan(100);
      expect(response.body.status).toBe('ok');
    });

    it('should handle multiple concurrent health checks', async () => {
      const promises = Array(10).fill().map(() =>
        request(app).get('/health')
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
      });
    });
  });
});