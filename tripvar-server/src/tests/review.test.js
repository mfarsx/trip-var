const request = require('supertest');
const app = require('./app.test');
const {
  setupTestEnvironment,
  cleanupTestEnvironment,
  clearDatabase,
  createTestUser,
  createTestAdmin,
  createTestDestination,
  createTestBooking,
  createTestReview,
  generateTestToken,
  expectValidationError,
  expectAuthError,
  expectSuccessResponse,
  expectNotFoundError,
  expectConflictError
} = require('./setup');

describe('Review API', () => {
  let user, admin, destination, booking, token, adminToken;

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
    token = generateTestToken(user);
    adminToken = generateTestToken(admin);
  });

  describe('POST /api/v1/reviews', () => {
    it('should create review successfully', async () => {
      const reviewData = {
        destinationId: destination._id,
        bookingId: booking._id,
        title: 'Amazing Experience!',
        content: 'Had an incredible time at this destination. Highly recommended!',
        rating: 5,
        ratings: {
          cleanliness: 5,
          location: 4,
          value: 5,
          service: 5
        }
      };

      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send(reviewData)
        .expect(201);

      expectSuccessResponse(response, 201, 'Review created successfully');
      expect(response.body.data.review.title).toBe(reviewData.title);
      expect(response.body.data.review.content).toBe(reviewData.content);
      expect(response.body.data.review.rating).toBe(reviewData.rating);
      expect(response.body.data.review.user).toHaveProperty('name');
      expect(response.body.data.review.user).toHaveProperty('email');
    });

    it('should create review without booking reference', async () => {
      const reviewData = {
        destinationId: destination._id,
        title: 'Great Place!',
        content: 'Really enjoyed my stay here.',
        rating: 4
      };

      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send(reviewData)
        .expect(201);

      expectSuccessResponse(response, 201, 'Review created successfully');
      expect(response.body.data.review.title).toBe(reviewData.title);
    });

    it('should fail to create review with missing required fields', async () => {
      const reviewData = {
        destinationId: destination._id,
        title: 'Great Place!'
        // Missing content and rating
      };

      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Missing required review information');
    });

    it('should fail to create review for non-existent destination', async () => {
      const reviewData = {
        destinationId: '507f1f77bcf86cd799439011',
        title: 'Great Place!',
        content: 'Really enjoyed my stay here.',
        rating: 4
      };

      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send(reviewData)
        .expect(404);

      expectNotFoundError(response, 404, 'Destination not found');
    });

    it('should fail to create duplicate review for same destination', async () => {
      // Create first review
      await createTestReview({ 
        userId: user._id, 
        destinationId: destination._id 
      });

      const reviewData = {
        destinationId: destination._id,
        title: 'Another Review',
        content: 'This is my second review.',
        rating: 3
      };

      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send(reviewData)
        .expect(409);

      expectConflictError(response, 409, 'You have already reviewed this destination');
    });

    it('should fail to create review with invalid booking reference', async () => {
      const reviewData = {
        destinationId: destination._id,
        bookingId: '507f1f77bcf86cd799439011', // Non-existent booking
        title: 'Great Place!',
        content: 'Really enjoyed my stay here.',
        rating: 4
      };

      const response = await request(app)
        .post('/api/v1/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send(reviewData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Invalid booking reference');
    });

    it('should fail without authentication', async () => {
      const reviewData = {
        destinationId: destination._id,
        title: 'Great Place!',
        content: 'Really enjoyed my stay here.',
        rating: 4
      };

      const response = await request(app)
        .post('/api/v1/reviews')
        .send(reviewData)
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('GET /api/v1/reviews/destination/:destinationId', () => {
    beforeEach(async () => {
      // Create multiple reviews for the destination
      // Create additional test users for multiple reviews
      const user2 = await createTestUser({ email: 'user2@example.com' });
      const user3 = await createTestUser({ email: 'user3@example.com' });
      
      await createTestReview({ 
        userId: user._id, 
        destinationId: destination._id,
        rating: 5,
        status: 'approved'
      });
      await createTestReview({ 
        userId: admin._id, 
        destinationId: destination._id,
        rating: 4,
        status: 'approved'
      });
      await createTestReview({ 
        userId: user2._id, 
        destinationId: destination._id,
        rating: 3,
        status: 'pending'
      });
    });

    it('should get destination reviews successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/destination/${destination._id}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'Reviews retrieved successfully');
      expect(response.body.data.reviews).toHaveLength(2); // Only approved reviews
      expect(response.body.data).toHaveProperty('ratingStats');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should sort reviews by newest first (default)', async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/destination/${destination._id}?sort=newest`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.reviews).toHaveLength(2);
      // Should be sorted by creation date descending
    });

    it('should sort reviews by highest rating', async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/destination/${destination._id}?sort=highest`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.reviews).toHaveLength(2);
      // Should be sorted by rating descending
    });

    it('should sort reviews by lowest rating', async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/destination/${destination._id}?sort=lowest`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.reviews).toHaveLength(2);
      // Should be sorted by rating ascending
    });

    it('should sort reviews by most helpful', async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/destination/${destination._id}?sort=most_helpful`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.reviews).toHaveLength(2);
      // Should be sorted by helpful votes descending
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/destination/${destination._id}?page=1&limit=1`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.reviews).toHaveLength(1);
      expect(response.body.data.pagination.current).toBe(1);
    });

    it('should include rating statistics', async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/destination/${destination._id}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.ratingStats).toHaveProperty('averageRating');
      expect(response.body.data.ratingStats).toHaveProperty('totalReviews');
      expect(response.body.data.ratingStats).toHaveProperty('distribution');
    });

    it('should fail for non-existent destination', async () => {
      const response = await request(app)
        .get('/api/v1/reviews/destination/507f1f77bcf86cd799439011')
        .expect(404);

      expectNotFoundError(response, 404, 'Destination not found');
    });
  });

  describe('GET /api/v1/reviews/user', () => {
    beforeEach(async () => {
      // Create reviews for the user with different destinations
      const destination2 = await createTestDestination({ title: 'Second Destination' });
      
      await createTestReview({ 
        userId: user._id, 
        destinationId: destination._id 
      });
      await createTestReview({ 
        userId: user._id, 
        destinationId: destination2._id,
        title: 'Second Review'
      });
    });

    it('should get user reviews successfully', async () => {
      const response = await request(app)
        .get('/api/v1/reviews/my-reviews')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'User reviews retrieved successfully');
      expect(response.body.data.reviews).toHaveLength(2);
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/v1/reviews/my-reviews?page=1&limit=1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.reviews).toHaveLength(1);
      expect(response.body.data.pagination.current).toBe(1);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/reviews/my-reviews')
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('PATCH /api/v1/reviews/:reviewId', () => {
    let review;

    beforeEach(async () => {
      review = await createTestReview({ 
        userId: user._id, 
        destinationId: destination._id 
      });
    });

    it('should update review successfully', async () => {
      const updateData = {
        title: 'Updated Review Title',
        content: 'Updated review content with more details.',
        rating: 4,
        ratings: {
          cleanliness: 4,
          location: 5,
          value: 4,
          service: 4
        }
      };

      const response = await request(app)
        .put(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expectSuccessResponse(response, 200, 'Review updated successfully');
      expect(response.body.data.review.title).toBe(updateData.title);
      expect(response.body.data.review.content).toBe(updateData.content);
      expect(response.body.data.review.rating).toBe(updateData.rating);
    });

    it('should fail to update non-existent review', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put('/api/v1/reviews/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(404);

      expectNotFoundError(response, 404, 'Review not found');
    });

    it('should fail to update another user\'s review', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherUserToken = generateTestToken(otherUser);

      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .put(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Access denied');
    });

    it('should fail without authentication', async () => {
      const updateData = {
        title: 'Updated Title'
      };

      const response = await request(app)
        .patch(`/api/v1/reviews/${review._id}`)
        .send(updateData)
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('DELETE /api/v1/reviews/:reviewId', () => {
    let review;

    beforeEach(async () => {
      review = await createTestReview({ 
        userId: user._id, 
        destinationId: destination._id 
      });
    });

    it('should delete review successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'Review deleted successfully');
    });

    it('should allow admin to delete any review', async () => {
      const response = await request(app)
        .delete(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'Review deleted successfully');
    });

    it('should fail to delete non-existent review', async () => {
      const response = await request(app)
        .delete('/api/v1/reviews/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expectNotFoundError(response, 404, 'Review not found');
    });

    it('should fail to delete another user\'s review (non-admin)', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherUserToken = generateTestToken(otherUser);

      const response = await request(app)
        .delete(`/api/v1/reviews/${review._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Access denied');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete(`/api/v1/reviews/${review._id}`)
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('POST /api/v1/reviews/:reviewId/helpful', () => {
    let review;

    beforeEach(async () => {
      review = await createTestReview({ 
        userId: user._id, 
        destinationId: destination._id 
      });
    });

    it('should mark review as helpful successfully', async () => {
      const response = await request(app)
        .post(`/api/v1/reviews/${review._id}/helpful`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.helpful).toBe(true);
      expect(response.body.data.helpfulVotes).toBe(1);
    });

    it('should unmark review as helpful when already marked', async () => {
      // First mark as helpful
      await request(app)
        .post(`/api/v1/reviews/${review._id}/helpful`)
        .set('Authorization', `Bearer ${token}`);

      // Then unmark
      const response = await request(app)
        .post(`/api/v1/reviews/${review._id}/helpful`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.helpful).toBe(false);
      expect(response.body.data.helpfulVotes).toBe(0);
    });

    it('should fail to mark non-existent review as helpful', async () => {
      const response = await request(app)
        .post('/api/v1/reviews/507f1f77bcf86cd799439011/helpful')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expectNotFoundError(response, 404, 'Review not found');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post(`/api/v1/reviews/${review._id}/helpful`)
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('GET /api/v1/reviews/admin/all (Admin)', () => {
    beforeEach(async () => {
      // Create reviews with different statuses using different users
      const user2 = await createTestUser({ email: 'user2@example.com' });
      const user3 = await createTestUser({ email: 'user3@example.com' });
      
      await createTestReview({ 
        userId: user._id, 
        destinationId: destination._id,
        status: 'approved'
      });
      await createTestReview({ 
        userId: user2._id, 
        destinationId: destination._id,
        status: 'pending'
      });
      await createTestReview({ 
        userId: user3._id, 
        destinationId: destination._id,
        status: 'rejected'
      });
    });

    it('should get all reviews for admin', async () => {
      const response = await request(app)
        .get('/api/v1/reviews/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'All reviews retrieved successfully');
      expect(response.body.data.reviews).toHaveLength(3);
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should filter reviews by status for admin', async () => {
      const response = await request(app)
        .get('/api/v1/reviews/admin/all?status=pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.reviews).toHaveLength(1);
      expect(response.body.data.reviews[0].status).toBe('pending');
    });

    it('should filter reviews by destination for admin', async () => {
      const response = await request(app)
        .get(`/api/v1/reviews/admin/all?destinationId=${destination._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.reviews).toHaveLength(3);
    });

    it('should fail for non-admin users', async () => {
      const response = await request(app)
        .get('/api/v1/reviews/admin/all')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });
  });

  describe('PATCH /api/v1/reviews/:reviewId/status (Admin)', () => {
    let review;

    beforeEach(async () => {
      review = await createTestReview({ 
        userId: user._id, 
        destinationId: destination._id,
        status: 'pending'
      });
    });

    it('should update review status successfully', async () => {
      const statusData = {
        status: 'approved',
        adminResponse: 'Thank you for your review!'
      };

      const response = await request(app)
        .put(`/api/v1/reviews/admin/${review._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusData)
        .expect(200);

      expectSuccessResponse(response, 200, 'Review status updated successfully');
      expect(response.body.data.review.status).toBe('approved');
      expect(response.body.data.review.adminResponse).toHaveProperty('content');
      expect(response.body.data.review.adminResponse).toHaveProperty('respondedBy');
      expect(response.body.data.review.adminResponse).toHaveProperty('respondedAt');
    });

    it('should fail with invalid status', async () => {
      const statusData = {
        status: 'invalid_status'
      };

      const response = await request(app)
        .put(`/api/v1/reviews/admin/${review._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Invalid review status');
    });

    it('should fail to update non-existent review status', async () => {
      const statusData = {
        status: 'approved'
      };

      const response = await request(app)
        .put('/api/v1/reviews/admin/507f1f77bcf86cd799439011/status')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusData)
        .expect(404);

      expectNotFoundError(response, 404, 'Review not found');
    });

    it('should fail for non-admin users', async () => {
      const statusData = {
        status: 'approved'
      };

      const response = await request(app)
        .put(`/api/v1/reviews/admin/${review._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send(statusData)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });
  });
});