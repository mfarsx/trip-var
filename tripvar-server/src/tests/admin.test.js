const request = require('supertest');
const app = require('./app');
const {
  setupTestEnvironment,
  cleanupTestEnvironment,
  clearDatabase,
  createTestUser,
  createTestAdmin,
  createTestDestination,
  createTestBooking,
  createTestReview,
  createTestNotification,
  generateTestToken,
  expectValidationError,
  expectAuthError,
  expectSuccessResponse,
  expectNotFoundError
} = require('./setup');

describe('Admin API', () => {
  let user, admin, destination, booking, review, notification, token, adminToken;

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
    destination = await createTestDestination();
    booking = await createTestBooking({ 
      userId: user._id, 
      destinationId: destination._id 
    });
    review = await createTestReview({ 
      userId: user._id, 
      destinationId: destination._id 
    });
    notification = await createTestNotification({ 
      userId: user._id 
    });
    token = generateTestToken(user);
    adminToken = generateTestToken(admin);
  });

  describe('GET /api/v1/admin/users', () => {
    it('should get all users successfully (admin only)', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'Users retrieved successfully');
      expect(Array.isArray(response.body.data.users)).toBe(true);
      expect(response.body.data.users.length).toBeGreaterThanOrEqual(2); // user + admin
    });

    it('should fail to get users without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should fail to get users as regular user', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });
  });

  describe('GET /api/v1/admin/destinations', () => {
    it('should get all destinations successfully (admin only)', async () => {
      const response = await request(app)
        .get('/api/v1/admin/destinations')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'Destinations retrieved successfully');
      expect(Array.isArray(response.body.data.destinations)).toBe(true);
      expect(response.body.data.destinations.length).toBeGreaterThanOrEqual(1);
    });

    it('should fail to get destinations without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/admin/destinations')
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should fail to get destinations as regular user', async () => {
      const response = await request(app)
        .get('/api/v1/admin/destinations')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });
  });

  describe('POST /api/v1/admin/destinations', () => {
    it('should create destination successfully (admin only)', async () => {
      const destinationData = {
        title: 'Admin Created Destination',
        description: 'A destination created by admin',
        imageUrl: 'https://example.com/admin-image.jpg',
        location: 'Admin Location',
        category: 'Adventure',
        price: 299.99,
        rating: 4.5,
        amenities: ['WiFi', 'Pool'],
        isActive: true,
        featured: true
      };

      const response = await request(app)
        .post('/api/v1/admin/destinations')
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
        title: 'Test Destination',
        description: 'Test description',
        location: 'Test Location',
        category: 'Adventure',
        price: 299.99
      };

      const response = await request(app)
        .post('/api/v1/admin/destinations')
        .send(destinationData)
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should fail to create destination as regular user', async () => {
      const destinationData = {
        title: 'Test Destination',
        description: 'Test description',
        location: 'Test Location',
        category: 'Adventure',
        price: 299.99
      };

      const response = await request(app)
        .post('/api/v1/admin/destinations')
        .set('Authorization', `Bearer ${token}`)
        .send(destinationData)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });
  });

  describe('PUT /api/v1/admin/destinations/:id', () => {
    it('should update destination successfully (admin only)', async () => {
      const updateData = {
        title: 'Updated Admin Destination',
        price: 399.99,
        rating: 5.0
      };

      const response = await request(app)
        .put(`/api/v1/admin/destinations/${destination._id}`)
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
        .put('/api/v1/admin/destinations/507f1f77bcf86cd799439011')
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
        .put(`/api/v1/admin/destinations/${destination._id}`)
        .send(updateData)
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should fail to update destination as regular user', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put(`/api/v1/admin/destinations/${destination._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });
  });

  describe('PATCH /api/v1/admin/destinations/:id', () => {
    it('should partially update destination successfully (admin only)', async () => {
      const updateData = {
        price: 499.99
      };

      const response = await request(app)
        .patch(`/api/v1/admin/destinations/${destination._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expectSuccessResponse(response, 200, 'Destination updated successfully');
      expect(response.body.data.destination.price).toBe(updateData.price);
    });

    it('should fail to partially update destination without authentication', async () => {
      const updateData = {
        price: 499.99
      };

      const response = await request(app)
        .patch(`/api/v1/admin/destinations/${destination._id}`)
        .send(updateData)
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('DELETE /api/v1/admin/destinations/:id', () => {
    it('should delete destination successfully (admin only)', async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/destinations/${destination._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'Destination deleted successfully');
    });

    it('should fail to delete non-existent destination', async () => {
      const response = await request(app)
        .delete('/api/v1/admin/destinations/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expectNotFoundError(response, 404, 'Destination not found');
    });

    it('should fail to delete destination without authentication', async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/destinations/${destination._id}`)
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should fail to delete destination as regular user', async () => {
      const response = await request(app)
        .delete(`/api/v1/admin/destinations/${destination._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });
  });

  describe('GET /api/v1/admin/bookings', () => {
    it('should get all bookings successfully (admin only)', async () => {
      const response = await request(app)
        .get('/api/v1/admin/bookings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'Bookings retrieved successfully');
      expect(Array.isArray(response.body.data.bookings)).toBe(true);
      expect(response.body.data.bookings.length).toBeGreaterThanOrEqual(1);
    });

    it('should fail to get bookings without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/admin/bookings')
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should fail to get bookings as regular user', async () => {
      const response = await request(app)
        .get('/api/v1/admin/bookings')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });
  });

  describe('PATCH /api/v1/admin/bookings/:id/status', () => {
    it('should update booking status successfully (admin only)', async () => {
      const statusData = {
        status: 'confirmed'
      };

      const response = await request(app)
        .patch(`/api/v1/admin/bookings/${booking._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusData)
        .expect(200);

      expectSuccessResponse(response, 200, 'Booking status updated successfully');
      expect(response.body.data.booking.status).toBe(statusData.status);
    });

    it('should fail to update booking status without authentication', async () => {
      const statusData = {
        status: 'confirmed'
      };

      const response = await request(app)
        .patch(`/api/v1/admin/bookings/${booking._id}/status`)
        .send(statusData)
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should fail to update booking status as regular user', async () => {
      const statusData = {
        status: 'confirmed'
      };

      const response = await request(app)
        .patch(`/api/v1/admin/bookings/${booking._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send(statusData)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });
  });

  describe('GET /api/v1/admin/reviews', () => {
    it('should get all reviews successfully (admin only)', async () => {
      const response = await request(app)
        .get('/api/v1/admin/reviews')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'Reviews retrieved successfully');
      expect(Array.isArray(response.body.data.reviews)).toBe(true);
      expect(response.body.data.reviews.length).toBeGreaterThanOrEqual(1);
    });

    it('should fail to get reviews without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/admin/reviews')
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should fail to get reviews as regular user', async () => {
      const response = await request(app)
        .get('/api/v1/admin/reviews')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });
  });

  describe('PATCH /api/v1/admin/reviews/:id/status', () => {
    it('should update review status successfully (admin only)', async () => {
      const statusData = {
        status: 'approved'
      };

      const response = await request(app)
        .patch(`/api/v1/admin/reviews/${review._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusData)
        .expect(200);

      expectSuccessResponse(response, 200, 'Review status updated successfully');
      expect(response.body.data.review.status).toBe(statusData.status);
    });

    it('should fail to update review status without authentication', async () => {
      const statusData = {
        status: 'approved'
      };

      const response = await request(app)
        .patch(`/api/v1/admin/reviews/${review._id}/status`)
        .send(statusData)
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should fail to update review status as regular user', async () => {
      const statusData = {
        status: 'approved'
      };

      const response = await request(app)
        .patch(`/api/v1/admin/reviews/${review._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send(statusData)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });
  });

  describe('GET /api/v1/admin/notifications', () => {
    it('should get all notifications successfully (admin only)', async () => {
      const response = await request(app)
        .get('/api/v1/admin/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'Notifications retrieved successfully');
      expect(Array.isArray(response.body.data.notifications)).toBe(true);
      expect(response.body.data.notifications.length).toBeGreaterThanOrEqual(1);
    });

    it('should fail to get notifications without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/admin/notifications')
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should fail to get notifications as regular user', async () => {
      const response = await request(app)
        .get('/api/v1/admin/notifications')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });
  });

  describe('POST /api/v1/admin/notifications', () => {
    it('should create notification successfully (admin only)', async () => {
      const notificationData = {
        userId: user._id,
        type: 'admin_announcement',
        title: 'Admin Announcement',
        message: 'This is an admin announcement',
        priority: 'high'
      };

      const response = await request(app)
        .post('/api/v1/admin/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notificationData)
        .expect(201);

      expectSuccessResponse(response, 201, 'Notification created successfully');
      expect(response.body.data.notification.title).toBe(notificationData.title);
      expect(response.body.data.notification.message).toBe(notificationData.message);
      expect(response.body.data.notification.type).toBe(notificationData.type);
    });

    it('should fail to create notification without authentication', async () => {
      const notificationData = {
        userId: user._id,
        type: 'admin_announcement',
        title: 'Admin Announcement',
        message: 'This is an admin announcement'
      };

      const response = await request(app)
        .post('/api/v1/admin/notifications')
        .send(notificationData)
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should fail to create notification as regular user', async () => {
      const notificationData = {
        userId: user._id,
        type: 'admin_announcement',
        title: 'Admin Announcement',
        message: 'This is an admin announcement'
      };

      const response = await request(app)
        .post('/api/v1/admin/notifications')
        .set('Authorization', `Bearer ${token}`)
        .send(notificationData)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });
  });

  describe('Admin Authorization', () => {
    it('should require admin role for all admin endpoints', async () => {
      const regularUser = await createTestUser({ email: 'regular@example.com' });
      const regularUserToken = generateTestToken(regularUser);

      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });

    it('should handle invalid admin token', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', 'Bearer invalid-admin-token')
        .expect(401);

      expectAuthError(response, 401);
    });
  });
});