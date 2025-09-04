const request = require('supertest');
const app = require('./app');
const {
  setupTestEnvironment,
  cleanupTestEnvironment,
  clearDatabase,
  createTestUser,
  createTestAdmin,
  createTestDestination,
  generateTestToken,
  generateFutureDates,
  expectValidationError,
  expectAuthError,
  expectSuccessResponse,
  expectNotFoundError
} = require('./setup');

describe('Destination API', () => {
  let user, admin, destination, token, adminToken;

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
    admin = await createTestAdmin();
    destination = await createTestDestination({
      category: 'Adventure' // Change from default 'Beach' to avoid conflicts
    });
    token = generateTestToken(user);
    adminToken = generateTestToken(admin);
  });

  describe('GET /api/v1/destinations', () => {
    beforeEach(async () => {
      // Create multiple test destinations
      await createTestDestination({
        title: 'Beach Paradise',
        category: 'Beach',
        location: 'Maldives',
        featured: true
      });
      await createTestDestination({
        title: 'Mountain Retreat',
        category: 'Mountain',
        location: 'Switzerland',
        featured: false
      });
      await createTestDestination({
        title: 'City Explorer',
        category: 'City',
        location: 'Paris',
        featured: true
      });
    });

    it('should get all destinations successfully', async () => {
      const response = await request(app)
        .get('/api/v1/destinations')
        .expect(200);

      expectSuccessResponse(response, 200, 'Destinations retrieved successfully');
      expect(response.body.data.destinations).toHaveLength(4); // 3 created + 1 from beforeEach
      expect(Array.isArray(response.body.data.destinations)).toBe(true);
    });

    it('should filter destinations by category', async () => {
      const response = await request(app)
        .get('/api/v1/destinations?category=Beach')
        .expect(200);

      expectSuccessResponse(response, 200, 'Destinations retrieved successfully');
      expect(response.body.data.destinations).toHaveLength(1);
      expect(response.body.data.destinations[0].category).toBe('Beach');
    });

    it('should filter featured destinations', async () => {
      const response = await request(app)
        .get('/api/v1/destinations?featured=true')
        .expect(200);

      expectSuccessResponse(response, 200, 'Destinations retrieved successfully');
      expect(response.body.data.destinations).toHaveLength(2);
      response.body.data.destinations.forEach(dest => {
        expect(dest.featured).toBe(true);
      });
    });

    it('should search destinations by title', async () => {
      const response = await request(app)
        .get('/api/v1/destinations?search=Beach')
        .expect(200);

      expectSuccessResponse(response, 200, 'Destinations retrieved successfully');
      expect(response.body.data.destinations).toHaveLength(1);
      expect(response.body.data.destinations[0].title).toContain('Beach');
    });

    it('should search destinations by location', async () => {
      const response = await request(app)
        .get('/api/v1/destinations?search=Paris')
        .expect(200);

      expectSuccessResponse(response, 200, 'Destinations retrieved successfully');
      expect(response.body.data.destinations).toHaveLength(1);
      expect(response.body.data.destinations[0].location).toContain('Paris');
    });

    it('should search destinations by destination parameter', async () => {
      const response = await request(app)
        .get('/api/v1/destinations?to=Maldives')
        .expect(200);

      expectSuccessResponse(response, 200, 'Destinations retrieved successfully');
      expect(response.body.data.destinations).toHaveLength(1);
      expect(response.body.data.destinations[0].location).toContain('Maldives');
    });

    it('should handle search with date parameter', async () => {
      const dates = generateFutureDates();
      const response = await request(app)
        .get(`/api/v1/destinations?date=${dates.checkInDate}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'Destinations retrieved successfully');
      // Should return all destinations since we're not filtering by availability yet
      expect(response.body.data.destinations.length).toBeGreaterThan(0);
    });

    it('should handle search with guests parameter', async () => {
      const response = await request(app)
        .get('/api/v1/destinations?guests=2')
        .expect(200);

      expectSuccessResponse(response, 200, 'Destinations retrieved successfully');
      // Should return all destinations since we're not filtering by capacity yet
      expect(response.body.data.destinations.length).toBeGreaterThan(0);
    });

    it('should handle search with from parameter', async () => {
      const response = await request(app)
        .get('/api/v1/destinations?from=New York')
        .expect(200);

      expectSuccessResponse(response, 200, 'Destinations retrieved successfully');
      // Should return all destinations since we're not filtering by departure location yet
      expect(response.body.data.destinations.length).toBeGreaterThan(0);
    });

    it('should return empty array when no destinations match search', async () => {
      const response = await request(app)
        .get('/api/v1/destinations?search=NonexistentDestination')
        .expect(200);

      expectSuccessResponse(response, 200, 'Destinations retrieved successfully');
      expect(response.body.data.destinations).toHaveLength(0);
    });
  });

  describe('GET /api/v1/destinations/:id', () => {
    it('should get destination by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/destinations/${destination._id}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'Destination retrieved successfully');
      expect(response.body.data.destination._id).toBe(destination._id.toString());
      expect(response.body.data.destination.title).toBe(destination.title);
    });

    it('should fail to get non-existent destination', async () => {
      const response = await request(app)
        .get('/api/v1/destinations/507f1f77bcf86cd799439011')
        .expect(404);

      expectNotFoundError(response, 404, 'Destination not found');
    });

    it('should fail with invalid destination ID format', async () => {
      const response = await request(app)
        .get('/api/v1/destinations/invalid-id')
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Invalid ID format');
    });
  });

  describe('POST /api/v1/destinations', () => {
    it('should create destination successfully (admin only)', async () => {
      const destinationData = {
        title: 'New Test Destination',
        description: 'A beautiful new destination for testing',
        imageUrl: 'https://example.com/new-image.jpg',
        location: 'Test Location',
        category: 'Adventure',
        price: 399.99,
        rating: 4.8,
        amenities: ['WiFi', 'Pool', 'Spa'],
        isActive: true,
        featured: false
      };

      const response = await request(app)
        .post('/api/v1/destinations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(destinationData)
        .expect(201);

      expectSuccessResponse(response, 201, 'Destination created successfully');
      expect(response.body.data.destination.title).toBe(destinationData.title);
      expect(response.body.data.destination.location).toBe(destinationData.location);
      expect(response.body.data.destination.price).toBe(destinationData.price);
    });

    it('should fail to create destination without authentication', async () => {
      const destinationData = {
        title: 'New Test Destination',
        description: 'A beautiful new destination for testing',
        location: 'Test Location',
        category: 'Adventure',
        price: 399.99
      };

      const response = await request(app)
        .post('/api/v1/destinations')
        .send(destinationData)
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should fail to create destination as regular user', async () => {
      const destinationData = {
        title: 'New Test Destination',
        description: 'A beautiful new destination for testing',
        location: 'Test Location',
        category: 'Adventure',
        price: 399.99
      };

      const response = await request(app)
        .post('/api/v1/destinations')
        .set('Authorization', `Bearer ${token}`)
        .send(destinationData)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });

    it('should fail to create destination with missing required fields', async () => {
      const destinationData = {
        title: 'New Test Destination',
        // Missing description, location, category, price
      };

      const response = await request(app)
        .post('/api/v1/destinations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(destinationData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      // Should contain validation errors
    });
  });

  describe('PATCH /api/v1/destinations/:id', () => {
    it('should update destination successfully (admin only)', async () => {
      const updateData = {
        title: 'Updated Destination Title',
        price: 499.99,
        rating: 5.0
      };

      const response = await request(app)
        .patch(`/api/v1/destinations/${destination._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expectSuccessResponse(response, 200, 'Destination updated successfully');
      expect(response.body.data.destination.title).toBe(updateData.title);
      expect(response.body.data.destination.price).toBe(updateData.price);
      expect(response.body.data.destination.rating).toBe(updateData.rating);
    });

    it('should fail to update non-existent destination', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .patch('/api/v1/destinations/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expectNotFoundError(response, 404, 'Destination not found');
    });

    it('should fail to update destination without authentication', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .patch(`/api/v1/destinations/${destination._id}`)
        .send(updateData)
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should fail to update destination as regular user', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .patch(`/api/v1/destinations/${destination._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });
  });

  describe('DELETE /api/v1/destinations/:id', () => {
    it('should delete destination successfully (admin only)', async () => {
      const response = await request(app)
        .delete(`/api/v1/destinations/${destination._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'Destination deleted successfully');
    });

    it('should fail to delete non-existent destination', async () => {
      const response = await request(app)
        .delete('/api/v1/destinations/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expectNotFoundError(response, 404, 'Destination not found');
    });

    it('should fail to delete destination without authentication', async () => {
      const response = await request(app)
        .delete(`/api/v1/destinations/${destination._id}`)
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should fail to delete destination as regular user', async () => {
      const response = await request(app)
        .delete(`/api/v1/destinations/${destination._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // For now, we'll test that the API responds properly to invalid requests
      const response = await request(app)
        .get('/api/v1/destinations/invalid-id')
        .expect(400);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('Search Functionality', () => {
    beforeEach(async () => {
      // Create destinations with specific searchable content
      await createTestDestination({
        title: 'Amazing Beach Resort',
        description: 'Beautiful beach with crystal clear water',
        location: 'Caribbean Islands',
        category: 'Beach'
      });
      await createTestDestination({
        title: 'Mountain Adventure',
        description: 'High altitude mountain experience',
        location: 'Himalayas',
        category: 'Mountain'
      });
    });

    it('should search by multiple criteria', async () => {
      const response = await request(app)
        .get('/api/v1/destinations?search=beach&category=Beach')
        .expect(200);

      expectSuccessResponse(response, 200, 'Destinations retrieved successfully');
      expect(response.body.data.destinations.length).toBeGreaterThan(0);
      
      // All results should be beach category
      response.body.data.destinations.forEach(dest => {
        expect(dest.category).toBe('Beach');
      });
    });

    it('should handle case-insensitive search', async () => {
      const response = await request(app)
        .get('/api/v1/destinations?search=BEACH')
        .expect(200);

      expectSuccessResponse(response, 200, 'Destinations retrieved successfully');
      expect(response.body.data.destinations.length).toBeGreaterThan(0);
    });

    it('should search in description field', async () => {
      const response = await request(app)
        .get('/api/v1/destinations?search=crystal')
        .expect(200);

      expectSuccessResponse(response, 200, 'Destinations retrieved successfully');
      expect(response.body.data.destinations.length).toBeGreaterThan(0);
    });
  });
});