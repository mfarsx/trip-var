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
  generateFutureDates,
  expectValidationError,
  expectAuthError,
  expectSuccessResponse,
  expectNotFoundError,
  expectConflictError
} = require('./setup');

// Mock notification service
jest.mock('../services/notification.service', () => ({
  createBookingConfirmationNotification: jest.fn().mockResolvedValue(),
  createBookingCancellationNotification: jest.fn().mockResolvedValue(),
}));

describe('Booking API', () => {
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
    destination = await createTestDestination();
    token = generateTestToken(user);
    adminToken = generateTestToken(admin);
  });

  describe('POST /api/v1/bookings', () => {
    it('should create a new booking successfully', async () => {
      const dates = generateFutureDates();
      const bookingData = {
        destinationId: destination._id,
        checkInDate: dates.checkInDate,
        checkOutDate: dates.checkOutDate,
        numberOfGuests: 2,
        paymentMethod: 'credit-card',
        specialRequests: 'Late check-in requested',
        contactEmail: 'test@example.com',
        contactPhone: '+1234567890'
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData)
        .expect(201);

      expectSuccessResponse(response, 201, 'Booking created successfully');
      expect(response.body.data.booking).toHaveProperty('_id');
      expect(response.body.data.booking.user).toBe(user._id.toString());
      expect(response.body.data.booking.destination).toBe(destination._id.toString());
      expect(response.body.data.booking.numberOfGuests).toBe(2);
      expect(response.body.data.booking.totalAmount).toBeGreaterThan(0);
    });

    it('should fail to create booking with missing required fields', async () => {
      const bookingData = {
        destinationId: destination._id,
        // Missing checkInDate, checkOutDate, numberOfGuests
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Missing required booking information');
    });

    it('should fail to create booking with invalid dates', async () => {
      const bookingData = {
        destinationId: destination._id,
        checkInDate: '2023-01-01', // Past date
        checkOutDate: '2024-06-05',
        numberOfGuests: 2
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Check-in date must be in the future');
    });

    it('should fail to create booking with invalid date range', async () => {
      const dates = generateFutureDates();
      const bookingData = {
        destinationId: destination._id,
        checkInDate: dates.checkOutDate,
        checkOutDate: dates.checkInDate, // Before check-in
        numberOfGuests: 2
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Check-out date must be after check-in date');
    });

    it('should fail to create booking for non-existent destination', async () => {
      const dates = generateFutureDates();
      const bookingData = {
        destinationId: '507f1f77bcf86cd799439011', // Non-existent ID
        checkInDate: dates.checkInDate,
        checkOutDate: dates.checkOutDate,
        numberOfGuests: 2
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .send(bookingData)
        .expect(404);

      expectNotFoundError(response, 404, 'Destination not found');
    });

    it('should fail to create booking without authentication', async () => {
      const dates = generateFutureDates();
      const bookingData = {
        destinationId: destination._id,
        checkInDate: dates.checkInDate,
        checkOutDate: dates.checkOutDate,
        numberOfGuests: 2
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .send(bookingData)
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('GET /api/v1/bookings', () => {
    beforeEach(async () => {
      // Create test bookings
      await createTestBooking({ userId: user._id, destinationId: destination._id });
      await createTestBooking({ 
        userId: user._id, 
        destinationId: destination._id,
        status: 'cancelled'
      });
    });

    it('should get user bookings successfully', async () => {
      const response = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.bookings).toHaveLength(2);
      expect(response.body.data.pagination).toHaveProperty('current');
      expect(response.body.data.pagination).toHaveProperty('total');
    });

    it('should filter bookings by status', async () => {
      const response = await request(app)
        .get('/api/v1/bookings?status=cancelled')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.bookings).toHaveLength(1);
      expect(response.body.data.bookings[0].status).toBe('cancelled');
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/v1/bookings?page=1&limit=1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.bookings).toHaveLength(1);
      expect(response.body.data.pagination.current).toBe(1);
    });

    it('should fail to get bookings without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/bookings')
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('GET /api/v1/bookings/:id', () => {
    let booking;

    beforeEach(async () => {
      booking = await createTestBooking({ userId: user._id, destinationId: destination._id });
    });

    it('should get booking by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/bookings/${booking._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.booking._id).toBe(booking._id.toString());
    });

    it('should allow admin to access any booking', async () => {
      const response = await request(app)
        .get(`/api/v1/bookings/${booking._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.booking._id).toBe(booking._id.toString());
    });

    it('should fail to get non-existent booking', async () => {
      const response = await request(app)
        .get('/api/v1/bookings/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expectNotFoundError(response, 404, 'Booking not found');
    });

    it('should fail to access another user\'s booking', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherUserToken = generateTestToken(otherUser);

      const response = await request(app)
        .get(`/api/v1/bookings/${booking._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('DELETE /api/v1/bookings/:id', () => {
    let booking;

    beforeEach(async () => {
      booking = await createTestBooking({ userId: user._id, destinationId: destination._id });
    });

    it('should cancel booking successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/bookings/${booking._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'Change of plans' })
        .expect(200);

      expectSuccessResponse(response, 200, 'Booking cancelled successfully');
      expect(response.body.data.booking.status).toBe('cancelled');
      expect(response.body.data.booking.cancellationReason).toBe('Change of plans');
    });

    it('should fail to cancel non-existent booking', async () => {
      const response = await request(app)
        .delete('/api/v1/bookings/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'Change of plans' })
        .expect(404);

      expectNotFoundError(response, 404, 'Booking not found');
    });

    it('should fail to cancel another user\'s booking', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherUserToken = generateTestToken(otherUser);

      const response = await request(app)
        .delete(`/api/v1/bookings/${booking._id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ reason: 'Change of plans' })
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Access denied');
    });

    it('should fail to cancel already cancelled booking', async () => {
      // First cancel the booking
      await request(app)
        .delete(`/api/v1/bookings/${booking._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'Change of plans' });

      // Try to cancel again
      const response = await request(app)
        .delete(`/api/v1/bookings/${booking._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'Another reason' })
        .expect(409);

      expectConflictError(response, 409, 'Booking is already cancelled');
    });
  });

  describe('GET /api/v1/bookings/admin/all', () => {
    beforeEach(async () => {
      // Create test bookings
      await createTestBooking({ userId: user._id, destinationId: destination._id });
      await createTestBooking({ 
        userId: user._id, 
        destinationId: destination._id,
        status: 'cancelled'
      });
    });

    it('should get all bookings for admin', async () => {
      const response = await request(app)
        .get('/api/v1/bookings/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.bookings).toHaveLength(2);
      expect(response.body.data.pagination).toHaveProperty('current');
      expect(response.body.data.pagination).toHaveProperty('total');
    });

    it('should filter bookings by status for admin', async () => {
      const response = await request(app)
        .get('/api/v1/bookings/admin/all?status=cancelled')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.bookings).toHaveLength(1);
      expect(response.body.data.bookings[0].status).toBe('cancelled');
    });

    it('should fail for non-admin users', async () => {
      const response = await request(app)
        .get('/api/v1/bookings/admin/all')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('PATCH /api/v1/bookings/:id/status', () => {
    let booking;

    beforeEach(async () => {
      booking = await createTestBooking({ userId: user._id, destinationId: destination._id });
    });

    it('should update booking status successfully', async () => {
      const response = await request(app)
        .patch(`/api/v1/bookings/${booking._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      expectSuccessResponse(response, 200, 'Booking status updated successfully');
      expect(response.body.data.booking.status).toBe('confirmed');
    });

    it('should fail with invalid status', async () => {
      const response = await request(app)
        .patch(`/api/v1/bookings/${booking._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Invalid booking status');
    });

    it('should fail for non-admin users', async () => {
      const response = await request(app)
        .patch(`/api/v1/bookings/${booking._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'confirmed' })
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Access denied');
    });
  });

  describe('GET /api/v1/bookings/availability', () => {
    it('should check availability successfully', async () => {
      const dates = generateFutureDates();
      const response = await request(app)
        .get(`/api/v1/bookings/availability?destinationId=${destination._id}&checkInDate=${dates.checkInDate}&checkOutDate=${dates.checkOutDate}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data).toHaveProperty('available');
      expect(response.body.data).toHaveProperty('checkInDate');
      expect(response.body.data).toHaveProperty('checkOutDate');
    });

    it('should fail with missing parameters', async () => {
      const response = await request(app)
        .get('/api/v1/bookings/availability')
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Missing required parameters');
    });
  });
});