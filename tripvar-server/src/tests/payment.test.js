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
  generateTestToken,
  expectValidationError,
  expectAuthError,
  expectSuccessResponse,
  expectNotFoundError,
  expectConflictError
} = require('./setup');

describe('Payment API', () => {
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
      destinationId: destination._id,
      paymentStatus: 'pending'
    });
    token = generateTestToken(user);
    adminToken = generateTestToken(admin);
  });

  describe('POST /api/v1/payments/:bookingId/process', () => {
    it('should process payment successfully', async () => {
      const paymentData = {
        paymentMethod: 'credit-card',
        paymentDetails: {
          cardNumber: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123'
        }
      };

      const response = await request(app)
        .post(`/api/v1/payments/${booking._id}/process`)
        .set('Authorization', `Bearer ${token}`)
        .send(paymentData)
        .expect(200);

      expectSuccessResponse(response, 200, 'Payment processed successfully');
      expect(response.body.data.booking.paymentStatus).toBe('paid');
      expect(response.body.data.paymentResult).toHaveProperty('paymentIntentId');
      expect(response.body.data.paymentResult).toHaveProperty('transactionId');
    });

    it('should fail to process payment for non-existent booking', async () => {
      const paymentData = {
        paymentMethod: 'credit-card',
        paymentDetails: {
          cardNumber: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123'
        }
      };

      const response = await request(app)
        .post('/api/v1/payments/507f1f77bcf86cd799439011/process')
        .set('Authorization', `Bearer ${token}`)
        .send(paymentData)
        .expect(404);

      expectNotFoundError(response, 404, 'Booking not found');
    });

    it('should fail to process payment for another user\'s booking', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherUserToken = generateTestToken(otherUser);

      const paymentData = {
        paymentMethod: 'credit-card',
        paymentDetails: {
          cardNumber: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123'
        }
      };

      const response = await request(app)
        .post(`/api/v1/payments/${booking._id}/process`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(paymentData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Access denied');
    });

    it('should fail to process payment for already paid booking', async () => {
      // Update booking to paid status
      booking.paymentStatus = 'paid';
      await booking.save();

      const paymentData = {
        paymentMethod: 'credit-card',
        paymentDetails: {
          cardNumber: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123'
        }
      };

      const response = await request(app)
        .post(`/api/v1/payments/${booking._id}/process`)
        .set('Authorization', `Bearer ${token}`)
        .send(paymentData)
        .expect(409);

      expectConflictError(response, 409, 'Booking is already paid');
    });

    it('should fail to process payment for cancelled booking', async () => {
      // Update booking to cancelled status
      booking.status = 'cancelled';
      await booking.save();

      const paymentData = {
        paymentMethod: 'credit-card',
        paymentDetails: {
          cardNumber: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123'
        }
      };

      const response = await request(app)
        .post(`/api/v1/payments/${booking._id}/process`)
        .set('Authorization', `Bearer ${token}`)
        .send(paymentData)
        .expect(409);

      expectConflictError(response, 409, 'Cannot process payment for cancelled booking');
    });

    it('should fail without authentication', async () => {
      const paymentData = {
        paymentMethod: 'credit-card',
        paymentDetails: {
          cardNumber: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123'
        }
      };

      const response = await request(app)
        .post(`/api/v1/payments/${booking._id}/process`)
        .send(paymentData)
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('GET /api/v1/payments/:bookingId/status', () => {
    it('should get payment status successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/payments/${booking._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'Payment status retrieved successfully');
      expect(response.body.data.booking).toHaveProperty('paymentStatus');
      expect(response.body.data.booking).toHaveProperty('totalAmount');
      expect(response.body.data.booking.destination).toHaveProperty('title');
    });

    it('should fail to get payment status for non-existent booking', async () => {
      const response = await request(app)
        .get('/api/v1/payments/507f1f77bcf86cd799439011/status')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expectNotFoundError(response, 404, 'Booking not found');
    });

    it('should fail to get payment status for another user\'s booking', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherUserToken = generateTestToken(otherUser);

      const response = await request(app)
        .get(`/api/v1/payments/${booking._id}/status`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Access denied');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get(`/api/v1/payments/${booking._id}/status`)
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('POST /api/v1/payments/:bookingId/refund', () => {
    beforeEach(async () => {
      // Set up a paid booking for refund tests
      booking.paymentStatus = 'paid';
      booking.paymentIntentId = 'pi_test_123';
      await booking.save();
    });

    it('should process refund successfully', async () => {
      const refundData = {
        reason: 'Customer requested cancellation'
      };

      const response = await request(app)
        .post(`/api/v1/payments/${booking._id}/refund`)
        .set('Authorization', `Bearer ${token}`)
        .send(refundData)
        .expect(200);

      expectSuccessResponse(response, 200, 'Refund processed successfully');
      expect(response.body.data.booking.paymentStatus).toBe('refunded');
      expect(response.body.data.booking).toHaveProperty('refundAmount');
      expect(response.body.data.booking).toHaveProperty('refundedAt');
      expect(response.body.data.refundResult).toHaveProperty('refundId');
    });

    it('should allow admin to process refund for any booking', async () => {
      const refundData = {
        reason: 'Admin initiated refund'
      };

      const response = await request(app)
        .post(`/api/v1/payments/${booking._id}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(refundData)
        .expect(200);

      expectSuccessResponse(response, 200, 'Refund processed successfully');
      expect(response.body.data.booking.paymentStatus).toBe('refunded');
    });

    it('should fail to refund non-existent booking', async () => {
      const refundData = {
        reason: 'Customer requested cancellation'
      };

      const response = await request(app)
        .post('/api/v1/payments/507f1f77bcf86cd799439011/refund')
        .set('Authorization', `Bearer ${token}`)
        .send(refundData)
        .expect(404);

      expectNotFoundError(response, 404, 'Booking not found');
    });

    it('should fail to refund unpaid booking', async () => {
      // Reset booking to unpaid status
      booking.paymentStatus = 'pending';
      await booking.save();

      const refundData = {
        reason: 'Customer requested cancellation'
      };

      const response = await request(app)
        .post(`/api/v1/payments/${booking._id}/refund`)
        .set('Authorization', `Bearer ${token}`)
        .send(refundData)
        .expect(409);

      expectConflictError(response, 409, 'Cannot refund unpaid booking');
    });

    it('should fail to refund already refunded booking', async () => {
      // Set booking to already refunded
      booking.paymentStatus = 'refunded';
      await booking.save();

      const refundData = {
        reason: 'Customer requested cancellation'
      };

      const response = await request(app)
        .post(`/api/v1/payments/${booking._id}/refund`)
        .set('Authorization', `Bearer ${token}`)
        .send(refundData)
        .expect(409);

      expectConflictError(response, 409, 'Booking is already refunded');
    });

    it('should fail to refund another user\'s booking (non-admin)', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherUserToken = generateTestToken(otherUser);

      const refundData = {
        reason: 'Customer requested cancellation'
      };

      const response = await request(app)
        .post(`/api/v1/payments/${booking._id}/refund`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(refundData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Access denied');
    });

    it('should fail without authentication', async () => {
      const refundData = {
        reason: 'Customer requested cancellation'
      };

      const response = await request(app)
        .post(`/api/v1/payments/${booking._id}/refund`)
        .send(refundData)
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('GET /api/v1/payments/history', () => {
    beforeEach(async () => {
      // Create multiple bookings with different payment statuses
      await createTestBooking({ 
        userId: user._id, 
        destinationId: destination._id,
        paymentStatus: 'paid',
        totalAmount: 299.99
      });
      await createTestBooking({ 
        userId: user._id, 
        destinationId: destination._id,
        paymentStatus: 'refunded',
        totalAmount: 199.99,
        refundAmount: 199.99
      });
      await createTestBooking({ 
        userId: user._id, 
        destinationId: destination._id,
        paymentStatus: 'pending',
        totalAmount: 399.99
      });
    });

    it('should get payment history successfully', async () => {
      const response = await request(app)
        .get('/api/v1/payments/history')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'Payment history retrieved successfully');
      expect(response.body.data.bookings).toHaveLength(4); // 3 created + 1 from beforeEach
      expect(response.body.data).toHaveProperty('paymentStats');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should filter payment history by status', async () => {
      const response = await request(app)
        .get('/api/v1/payments/history?status=paid')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.bookings.length).toBeGreaterThan(0);
      response.body.data.bookings.forEach(booking => {
        expect(booking.paymentStatus).toBe('paid');
      });
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/v1/payments/history?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.bookings).toHaveLength(2);
      expect(response.body.data.pagination.current).toBe(1);
    });

    it('should include payment statistics', async () => {
      const response = await request(app)
        .get('/api/v1/payments/history')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.paymentStats).toHaveProperty('totalSpent');
      expect(response.body.data.paymentStats).toHaveProperty('totalRefunded');
      expect(response.body.data.paymentStats).toHaveProperty('paidBookings');
      expect(response.body.data.paymentStats).toHaveProperty('refundedBookings');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/payments/history')
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('Payment Processing Edge Cases', () => {
    it('should handle payment processing failure gracefully', async () => {
      // Mock payment processing to fail
      const originalMathRandom = Math.random;
      Math.random = () => 0.1; // Force failure (5% chance)

      const paymentData = {
        paymentMethod: 'credit-card',
        paymentDetails: {
          cardNumber: '4111111111111111',
          expiryMonth: '12',
          expiryYear: '2025',
          cvv: '123'
        }
      };

      const response = await request(app)
        .post(`/api/v1/payments/${booking._id}/process`)
        .set('Authorization', `Bearer ${token}`)
        .send(paymentData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Payment processing failed');

      // Restore Math.random
      Math.random = originalMathRandom;
    });

    it('should handle refund processing failure gracefully', async () => {
      // Set up paid booking
      booking.paymentStatus = 'paid';
      booking.paymentIntentId = 'pi_test_123';
      await booking.save();

      // Mock refund processing to fail
      const originalMathRandom = Math.random;
      Math.random = () => 0.1; // Force failure (2% chance)

      const refundData = {
        reason: 'Customer requested cancellation'
      };

      const response = await request(app)
        .post(`/api/v1/payments/${booking._id}/refund`)
        .set('Authorization', `Bearer ${token}`)
        .send(refundData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Refund processing failed');

      // Restore Math.random
      Math.random = originalMathRandom;
    });
  });
});