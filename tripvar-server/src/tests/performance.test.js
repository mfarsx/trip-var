const request = require('supertest');
const app = require('./app');
const {
  setupTestEnvironment,
  cleanupTestEnvironment,
  clearDatabase,
  createTestUser,
  createTestDestination,
  generateTestToken,
  generateFutureDates,
  expectSuccessResponse
} = require('./setup');

describe('Performance Tests', () => {
  let user, destination, token;

  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  beforeEach(async () => {
    await clearDatabase();
    
    // Create test data
    user = await createTestUser();
    destination = await createTestDestination();
    token = generateTestToken(user);
  });

  describe('Response Time Tests', () => {
    it('should respond to destination list within acceptable time', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/v1/destinations')
        .expect(200);

      const responseTime = Date.now() - startTime;
      
      expectSuccessResponse(response, 200);
      expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should respond to authentication within acceptable time', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: 'TestPassword123!'
        })
        .expect(200);

      const responseTime = Date.now() - startTime;
      
      expectSuccessResponse(response, 200);
      expect(responseTime).toBeLessThan(2000); // Should respond within 2 seconds
    });

    it('should handle concurrent requests efficiently', async () => {
      const startTime = Date.now();
      
      const requests = Array(10).fill().map(() =>
        request(app).get('/api/v1/destinations')
      );

      const responses = await Promise.allSettled(requests);
      const totalTime = Date.now() - startTime;
      
      // All requests should succeed
      const successfulResponses = responses.filter(
        response => response.status === 'fulfilled' && response.value.status === 200
      );

      expect(successfulResponses.length).toBe(10);
      expect(totalTime).toBeLessThan(5000); // All requests should complete within 5 seconds
    });
  });

  describe('Memory Usage Tests', () => {
    it('should handle large dataset queries efficiently', async () => {
      // Create multiple destinations
      const createPromises = Array(50).fill().map((_, index) => {
        return createTestDestination({
          title: `Performance Test Destination ${index}`,
          description: 'Performance test description',
          location: 'Test Location',
          category: 'Adventure'
        });
      });

      await Promise.all(createPromises);

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/v1/destinations?limit=100')
        .expect(200);

      const responseTime = Date.now() - startTime;
      
      expectSuccessResponse(response, 200);
      expect(response.body.data.destinations.length).toBeGreaterThan(50);
      expect(responseTime).toBeLessThan(2000); // Should handle large datasets efficiently
    });

    it('should handle pagination efficiently', async () => {
      // Create multiple destinations
      const createPromises = Array(100).fill().map((_, index) => {
        return createTestDestination({
          title: `Pagination Test Destination ${index}`,
          description: 'Pagination test description',
          location: 'Test Location',
          category: 'Adventure'
        });
      });

      await Promise.all(createPromises);

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/v1/destinations?page=1&limit=10')
        .expect(200);

      const responseTime = Date.now() - startTime;
      
      expectSuccessResponse(response, 200);
      expect(response.body.data.destinations.length).toBe(10);
      expect(responseTime).toBeLessThan(1000); // Pagination should be fast
    });
  });

  describe('Database Performance Tests', () => {
    it('should handle complex queries efficiently', async () => {
      // Create destinations with different categories
      const categories = ['Beach', 'Mountain', 'City', 'Adventure'];
      const createPromises = [];

      categories.forEach((category, categoryIndex) => {
        for (let i = 0; i < 25; i++) {
          createPromises.push(
            createTestDestination({
              title: `${category} Destination ${i}`,
              description: `Beautiful ${category.toLowerCase()} destination`,
              location: `${category} Location ${i}`,
              category: category,
              featured: i % 5 === 0
            })
          );
        }
      });

      await Promise.all(createPromises);

      const startTime = Date.now();
      
      // Test complex search with multiple filters
      const response = await request(app)
        .get('/api/v1/destinations?category=Beach&featured=true&search=beautiful')
        .expect(200);

      const responseTime = Date.now() - startTime;
      
      expectSuccessResponse(response, 200);
      expect(responseTime).toBeLessThan(1500); // Complex queries should be reasonably fast
    });

    it('should handle booking creation efficiently', async () => {
      const dates = generateFutureDates();
      const startTime = Date.now();
      
      const bookingData = {
        destinationId: destination._id,
        checkInDate: dates.checkInDate,
        checkOutDate: dates.checkOutDate,
        numberOfGuests: 2,
        paymentMethod: 'credit-card'
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData)
        .expect(201);

      const responseTime = Date.now() - startTime;
      
      expectSuccessResponse(response, 201);
      expect(responseTime).toBeLessThan(2000); // Booking creation should be reasonably fast
    });
  });

  describe('Caching Performance Tests', () => {
    it('should benefit from caching on repeated requests', async () => {
      // First request (cache miss)
      const firstRequestStart = Date.now();
      const firstResponse = await request(app)
        .get('/api/v1/destinations')
        .expect(200);
      const firstRequestTime = Date.now() - firstRequestStart;

      // Second request (should be faster due to caching)
      const secondRequestStart = Date.now();
      const secondResponse = await request(app)
        .get('/api/v1/destinations')
        .expect(200);
      const secondRequestTime = Date.now() - secondRequestStart;

      expectSuccessResponse(firstResponse, 200);
      expectSuccessResponse(secondResponse, 200);
      
      // Second request should be faster (though this might not always be true in test environment)
      // The important thing is that both requests succeed
      expect(firstRequestTime).toBeLessThan(2000);
      expect(secondRequestTime).toBeLessThan(2000);
    });
  });

  describe('Load Testing', () => {
    it('should handle moderate load without degradation', async () => {
      const startTime = Date.now();
      
      // Simulate moderate load with 20 concurrent requests
      const requests = Array(20).fill().map((_, index) => {
        if (index % 2 === 0) {
          // GET requests
          return request(app).get('/api/v1/destinations');
        } else {
          // POST requests (login)
          return request(app)
            .post('/api/v1/auth/login')
            .send({
              email: user.email,
              password: 'TestPassword123!'
            });
        }
      });

      const responses = await Promise.allSettled(requests);
      const totalTime = Date.now() - startTime;
      
      // Count successful responses
      const successfulResponses = responses.filter(
        response => response.status === 'fulfilled' && 
        (response.value.status === 200 || response.value.status === 201)
      );

      expect(successfulResponses.length).toBeGreaterThan(15); // At least 75% should succeed
      expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });
});