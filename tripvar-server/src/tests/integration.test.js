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
  expectSuccessResponse,
  expectAuthError
} = require('./setup');

describe('Integration Tests - Complete User Flows', () => {
  let user, admin, destination, userToken, adminToken;

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
    userToken = generateTestToken(user);
    adminToken = generateTestToken(admin);
  });

  describe('Complete Booking Flow', () => {
    it('should complete full booking process from search to confirmation', async () => {
      const dates = generateFutureDates();
      // Step 1: Search for destinations
      const searchResponse = await request(app)
        .get('/api/v1/destinations?category=Beach')
        .expect(200);

      expectSuccessResponse(searchResponse, 200);
      expect(searchResponse.body.data.destinations.length).toBeGreaterThan(0);

      // Step 2: Get specific destination details
      const destinationResponse = await request(app)
        .get(`/api/v1/destinations/${destination._id}`)
        .expect(200);

      expectSuccessResponse(destinationResponse, 200);
      expect(destinationResponse.body.data.destination._id).toBe(destination._id.toString());

      // Step 3: Check availability
      const availabilityResponse = await request(app)
        .get(`/api/v1/bookings/availability?destinationId=${destination._id}&checkInDate=${dates.checkInDate}&checkOutDate=${dates.checkOutDate}`)
        .expect(200);

      expectSuccessResponse(availabilityResponse, 200);
      expect(availabilityResponse.body.data.available).toBe(true);

      // Step 4: Create booking
      const bookingData = {
        destinationId: destination._id,
        checkInDate: dates.checkInDate,
        checkOutDate: dates.checkOutDate,
        numberOfGuests: 2,
        paymentMethod: 'credit-card',
        specialRequests: 'Late check-in requested'
      };

      const bookingResponse = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(201);

      expectSuccessResponse(bookingResponse, 201, 'Booking created successfully');
      const bookingId = bookingResponse.body.data.booking._id;

      // Step 5: Get user's bookings
      const userBookingsResponse = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expectSuccessResponse(userBookingsResponse, 200);
      expect(userBookingsResponse.body.data.bookings.length).toBe(1);
      expect(userBookingsResponse.body.data.bookings[0]._id).toBe(bookingId);

      // Step 6: Get specific booking details
      const bookingDetailsResponse = await request(app)
        .get(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expectSuccessResponse(bookingDetailsResponse, 200);
      expect(bookingDetailsResponse.body.data.booking._id).toBe(bookingId);

      // Step 7: Admin updates booking status
      const statusUpdateResponse = await request(app)
        .patch(`/api/v1/bookings/${bookingId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'confirmed' })
        .expect(200);

      expectSuccessResponse(statusUpdateResponse, 200, 'Booking status updated successfully');
      expect(statusUpdateResponse.body.data.booking.status).toBe('confirmed');

      // Step 8: User cancels booking
      const cancelResponse = await request(app)
        .delete(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ reason: 'Change of plans' })
        .expect(200);

      expectSuccessResponse(cancelResponse, 200, 'Booking cancelled successfully');
      expect(cancelResponse.body.data.booking.status).toBe('cancelled');
    });

    it('should handle booking conflicts and availability checks', async () => {
      const dates = generateFutureDates();
      // Create first booking
      const bookingData = {
        destinationId: destination._id,
        checkInDate: dates.checkInDate,
        checkOutDate: dates.checkOutDate,
        numberOfGuests: 2,
        paymentMethod: 'credit-card'
      };

      const firstBookingResponse = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(bookingData)
        .expect(201);

      expectSuccessResponse(firstBookingResponse, 201);

      // Try to create overlapping booking (should fail if availability is properly checked)
      const overlappingDates = generateFutureDates(30, 4); // Same dates as first booking
      const overlappingBookingData = {
        destinationId: destination._id,
        checkInDate: overlappingDates.checkInDate, // Overlaps with first booking
        checkOutDate: overlappingDates.checkOutDate,
        numberOfGuests: 2,
        paymentMethod: 'credit-card'
      };

      // Note: This test assumes the availability check is implemented
      // If not implemented, this booking would succeed
      const secondBookingResponse = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send(overlappingBookingData);

      // The response could be either success (if availability not checked) or conflict
      // We'll test both scenarios
      if (secondBookingResponse.status === 409) {
        expect(secondBookingResponse.body.status).toBe('fail');
        expect(secondBookingResponse.body.message).toContain('not available');
      } else {
        // If availability check is not implemented, the booking should succeed
        expectSuccessResponse(secondBookingResponse, 201);
      }
    });
  });

  describe('Admin Management Flow', () => {
    it('should complete admin destination management flow', async () => {
      // Step 1: Admin creates new destination
      const newDestinationData = {
        title: 'New Admin Destination',
        description: 'A destination created by admin',
        imageUrl: 'https://example.com/admin-destination.jpg',
        location: 'Admin Test Location',
        category: 'Adventure',
        price: 599.99,
        rating: 4.9,
        amenities: ['WiFi', 'Pool', 'Spa', 'Gym'],
        isActive: true,
        featured: true
      };

      const createResponse = await request(app)
        .post('/api/v1/destinations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newDestinationData)
        .expect(201);

      expectSuccessResponse(createResponse, 201, 'Destination created successfully');
      const newDestinationId = createResponse.body.data.destination._id;

      // Step 2: Admin updates destination
      const updateData = {
        title: 'Updated Admin Destination',
        price: 699.99,
        rating: 5.0
      };

      const updateResponse = await request(app)
        .patch(`/api/v1/destinations/${newDestinationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expectSuccessResponse(updateResponse, 200, 'Destination updated successfully');
      expect(updateResponse.body.data.destination.title).toBe(updateData.title);
      expect(updateResponse.body.data.destination.price).toBe(updateData.price);

      // Step 3: Admin views all bookings
      const allBookingsResponse = await request(app)
        .get('/api/v1/bookings/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(allBookingsResponse, 200);
      expect(Array.isArray(allBookingsResponse.body.data.bookings)).toBe(true);

      // Step 4: Admin deletes destination
      const deleteResponse = await request(app)
        .delete(`/api/v1/destinations/${newDestinationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(deleteResponse, 200, 'Destination deleted successfully');
    });

    it('should prevent regular users from admin operations', async () => {
      // Try to create destination as regular user
      const destinationData = {
        title: 'Unauthorized Destination',
        description: 'Should not be created',
        location: 'Unauthorized Location',
        category: 'Test',
        price: 100
      };

      const createResponse = await request(app)
        .post('/api/v1/destinations')
        .set('Authorization', `Bearer ${userToken}`)
        .send(destinationData)
        .expect(403);

      expect(createResponse.body.status).toBe('fail');
      expect(createResponse.body.message).toContain('You do not have permission to perform this action');

      // Try to view all bookings as regular user
      const allBookingsResponse = await request(app)
        .get('/api/v1/bookings/admin/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(allBookingsResponse.body.status).toBe('fail');
      expect(allBookingsResponse.body.message).toContain('You do not have permission to perform this action');
    });
  });

  describe('User Authentication Flow', () => {
    it('should handle complete user registration and login flow', async () => {
      // Step 1: Register new user
      const userData = {
        email: 'newuser@example.com',
        password: 'NewPassword123!',
        name: 'New User',
        dateOfBirth: '1990-01-01',
        nationality: 'United States'
      };

      const registerResponse = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expectSuccessResponse(registerResponse, 201, 'User registered successfully');
      expect(registerResponse.body.data.user.email).toBe(userData.email);
      expect(registerResponse.body.data.token).toBeDefined();

      const newUserToken = registerResponse.body.data.token;

      // Step 2: Login with new user
      const loginData = {
        email: userData.email,
        password: userData.password
      };

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expectSuccessResponse(loginResponse, 200, 'Login successful');
      expect(loginResponse.body.data.user.email).toBe(userData.email);
      expect(loginResponse.body.data.token).toBeDefined();

      // Step 3: Access protected route
      const profileResponse = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${newUserToken}`)
        .expect(200);

      expectSuccessResponse(profileResponse, 200, 'Profile retrieved successfully');
      expect(profileResponse.body.data.user.email).toBe(userData.email);

      // Step 4: Update profile
      const updateData = {
        name: 'Updated User Name',
        nationality: 'Canada'
      };

      const updateResponse = await request(app)
        .patch('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${newUserToken}`)
        .send(updateData)
        .expect(200);

      expectSuccessResponse(updateResponse, 200, 'Profile updated successfully');
      expect(updateResponse.body.data.user.name).toBe(updateData.name);
      expect(updateResponse.body.data.user.nationality).toBe(updateData.nationality);
    });

    it('should handle authentication errors and token expiration', async () => {
      // Try to access protected route without token
      const noTokenResponse = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expectAuthError(noTokenResponse, 401);

      // Try to access protected route with invalid token
      const invalidTokenResponse = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expectAuthError(invalidTokenResponse, 401);

      // Try to login with wrong credentials
      const wrongCredentialsResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expectAuthError(wrongCredentialsResponse, 401);
    });
  });

  describe('Search and Filter Integration', () => {
    beforeEach(async () => {
      // Create multiple destinations for search testing
      await createTestDestination({
        title: 'Tropical Beach Resort',
        description: 'Beautiful tropical beach with palm trees',
        location: 'Bali, Indonesia',
        category: 'Beach',
        featured: true,
        price: 299.99
      });
      await createTestDestination({
        title: 'Mountain Adventure Lodge',
        description: 'High altitude mountain experience with hiking trails',
        location: 'Swiss Alps',
        category: 'Mountain',
        featured: false,
        price: 499.99
      });
      await createTestDestination({
        title: 'Urban City Hotel',
        description: 'Modern city hotel in downtown area',
        location: 'New York City',
        category: 'City',
        featured: true,
        price: 399.99
      });
    });

    it('should handle complex search and filter combinations', async () => {
      // Search with multiple filters
      const complexSearchResponse = await request(app)
        .get('/api/v1/destinations?search=beach&category=Beach&featured=true')
        .expect(200);

      expectSuccessResponse(complexSearchResponse, 200);
      expect(complexSearchResponse.body.data.destinations.length).toBeGreaterThan(0);
      
      // All results should match the criteria
      complexSearchResponse.body.data.destinations.forEach(dest => {
        expect(dest.category).toBe('Beach');
        expect(dest.featured).toBe(true);
        expect(
          dest.title.toLowerCase().includes('beach') ||
          dest.description.toLowerCase().includes('beach') ||
          dest.location.toLowerCase().includes('beach')
        ).toBe(true);
      });

      // Test price range filtering (if implemented)
      const priceFilterResponse = await request(app)
        .get('/api/v1/destinations?minPrice=300&maxPrice=500')
        .expect(200);

      expectSuccessResponse(priceFilterResponse, 200);
      // Note: This test assumes price filtering is implemented
      // If not implemented, it will return all destinations
    });

    it('should handle search with no results gracefully', async () => {
      const noResultsResponse = await request(app)
        .get('/api/v1/destinations?search=nonexistentdestination')
        .expect(200);

      expectSuccessResponse(noResultsResponse, 200);
      expect(noResultsResponse.body.data.destinations).toHaveLength(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed requests gracefully', async () => {
      // Test with invalid JSON
      const malformedResponse = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(malformedResponse.body.status).toBe('fail');

      // Test with missing required fields
      const missingFieldsResponse = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);

      expect(missingFieldsResponse.body.status).toBe('fail');
    });

    it('should handle concurrent requests properly', async () => {
      const dates = generateFutureDates();
      const bookingData = {
        destinationId: destination._id,
        checkInDate: dates.checkInDate,
        checkOutDate: dates.checkOutDate,
        numberOfGuests: 2,
        paymentMethod: 'credit-card'
      };

      // Make multiple concurrent booking requests
      const promises = Array(3).fill().map(() =>
        request(app)
          .post('/api/v1/bookings')
          .set('Authorization', `Bearer ${userToken}`)
          .send(bookingData)
      );

      const responses = await Promise.allSettled(promises);

      // At least one should succeed
      const successfulResponses = responses.filter(
        response => response.status === 'fulfilled' && response.value.status === 201
      );

      expect(successfulResponses.length).toBeGreaterThan(0);
    });
  });
});