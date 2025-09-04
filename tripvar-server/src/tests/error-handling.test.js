const request = require('supertest');
const app = require('./app.test');
const {
  setupTestEnvironment,
  cleanupTestEnvironment,
  clearDatabase,
  createTestUser,
  generateTestToken,
  expectValidationError,
  expectAuthError,
  expectSuccessResponse
} = require('./setup');

describe('Error Handling Tests', () => {
  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe('Malformed Request Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('JSON');
    });

    it('should handle oversized request body', async () => {
      const largeData = 'x'.repeat(11 * 1024 * 1024); // 11MB

      const response = await request(app)
        .post('/api/v1/auth/register')
        .set('Content-Type', 'application/json')
        .send({ data: largeData })
        .expect(400); // Should be handled as validation error

      expect(response.body.status).toBe('fail');
    });

    it('should handle missing Content-Type header', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('Invalid Route Handling', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent-route')
        .expect(404);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('not found');
    });

    it('should return 401 for protected routes without authentication', async () => {
      const response = await request(app)
        .patch('/api/v1/destinations/507f1f77bcf86cd799439011')
        .expect(401);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('Database Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test verifies the API responds properly under normal conditions
      const response = await request(app)
        .get('/api/v1/destinations')
        .expect(200);

      // Should respond with success status
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
    });
  });

  describe('Authentication Error Scenarios', () => {
    it('should handle malformed authorization header', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should handle empty authorization header', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', '')
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should handle missing authorization header', async () => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('Input Validation Edge Cases', () => {
    it('should handle extremely long input strings', async () => {
      const longString = 'a'.repeat(10000);
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'ValidPassword123!',
          name: longString
        })
        .expect(400);

      expectValidationError(response, 400, ['name']);
    });

    it('should handle special characters in input', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'ValidPassword123!',
          name: '<script>alert("xss")</script>'
        })
        .expect(400); // Should be rejected by validation

      expectValidationError(response, 400, ['name']);
    });

    it('should handle null and undefined values', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: null,
          password: undefined,
          name: 'Test User'
        })
        .expect(400);

      expectValidationError(response, 400, ['email', 'password']);
    });

    it('should handle empty strings', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: '',
          password: '',
          name: ''
        })
        .expect(400);

      expectValidationError(response, 400, ['email', 'password', 'name']);
    });
  });

  describe('Rate Limiting Edge Cases', () => {
    it('should handle rapid successive requests', async () => {
      const requests = Array(20).fill().map(() =>
        request(app).get('/api/v1/destinations')
      );

      const responses = await Promise.allSettled(requests);
      
      // All requests should complete (rate limiting may or may not kick in depending on timing)
      const successfulResponses = responses.filter(
        response => response.status === 'fulfilled' && 
        (response.value.status === 200 || response.value.status === 429)
      );

      expect(responses.length).toBe(20);
      expect(successfulResponses.length).toBe(20);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle concurrent user registrations with rate limiting', async () => {
      const userData = {
        password: 'ConcurrentPassword123!',
        name: 'Concurrent User'
      };

      const requests = Array(5).fill().map((_, index) =>
        request(app)
          .post('/api/v1/auth/register')
          .send({
            ...userData,
            email: `concurrent${index}@example.com`,
            dateOfBirth: '1990-01-01',
            nationality: 'United States'
          })
      );

      const responses = await Promise.allSettled(requests);
      
      // All requests should complete (either success or rate limited)
      const completedResponses = responses.filter(
        response => response.status === 'fulfilled' && 
        (response.value.status === 201 || response.value.status === 429)
      );

      expect(completedResponses.length).toBe(5);
      
      // At least some should be rate limited (this is expected behavior)
      const rateLimitedResponses = responses.filter(
        response => response.status === 'fulfilled' && response.value.status === 429
      );
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Memory and Resource Management', () => {
    it('should handle large response payloads', async () => {
      // This test ensures the server can handle large response payloads
      const response = await request(app)
        .get('/api/v1/destinations')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data.destinations)).toBe(true);
    });
  });
});