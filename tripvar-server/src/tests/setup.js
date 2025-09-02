const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { createError } = require('../utils/errors');

// Global test setup
let mongoServer;

/**
 * Setup test environment
 */
const setupTestEnvironment = async() => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to test database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests
};

/**
 * Cleanup test environment
 */
const cleanupTestEnvironment = async() => {
  // Close database connection
  await mongoose.connection.close();

  // Stop in-memory MongoDB
  if (mongoServer) {
    await mongoServer.stop();
  }
};

/**
 * Clear all collections
 */
const clearDatabase = async() => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

/**
 * Create test user
 */
const createTestUser = async(userData = {}) => {
  const User = require('../models/user.model');

  const defaultUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User',
    dateOfBirth: new Date('1990-01-01'),
    nationality: 'United States',
    role: 'user',
    ...userData
  };

  return await User.create(defaultUser);
};

/**
 * Create test admin user
 */
const createTestAdmin = async(adminData = {}) => {
  return await createTestUser({
    email: 'admin@example.com',
    name: 'Test Admin',
    role: 'admin',
    ...adminData
  });
};

/**
 * Create test destination
 */
const createTestDestination = async(destinationData = {}) => {
  const Destination = require('../models/destination.model');

  const defaultDestination = {
    title: 'Test Destination',
    description: 'A beautiful test destination for testing purposes',
    imageUrl: 'https://example.com/test-image.jpg',
    location: 'Test Location',
    category: 'Beach',
    price: 299.99,
    rating: 4.5,
    amenities: ['WiFi', 'Pool'],
    isActive: true,
    ...destinationData
  };

  return await Destination.create(defaultDestination);
};

/**
 * Create test booking
 */
const createTestBooking = async(bookingData = {}) => {
  const Booking = require('../models/booking.model');

  const defaultBooking = {
    userId: bookingData.userId || (await createTestUser())._id,
    destinationId: bookingData.destinationId || (await createTestDestination())._id,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-05'),
    guests: 2,
    totalPrice: 1199.96,
    status: 'confirmed',
    specialRequests: 'Test special requests',
    ...bookingData
  };

  return await Booking.create(defaultBooking);
};

/**
 * Create test review
 */
const createTestReview = async(reviewData = {}) => {
  const Review = require('../models/review.model');

  const defaultReview = {
    userId: reviewData.userId || (await createTestUser())._id,
    destinationId: reviewData.destinationId || (await createTestDestination())._id,
    title: 'Great test destination!',
    content: 'This is a test review for testing purposes. Highly recommended!',
    rating: 5,
    isVerified: true,
    ...reviewData
  };

  return await Review.create(defaultReview);
};

/**
 * Generate JWT token for testing
 */
const generateTestToken = (user) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Mock request object for testing
 */
const createMockRequest = (overrides = {}) => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ip: '127.0.0.1',
    method: 'GET',
    originalUrl: '/test',
    get: jest.fn(),
    ...overrides
  };
};

/**
 * Mock response object for testing
 */
const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis()
  };
  return res;
};

/**
 * Mock next function for testing
 */
const createMockNext = () => jest.fn();

/**
 * Test error assertions
 */
const expectError = (error, expectedStatus, expectedMessage, expectedCode) => {
  expect(error).toBeInstanceOf(Error);
  expect(error.statusCode).toBe(expectedStatus);
  expect(error.message).toContain(expectedMessage);
  if (expectedCode) {
    expect(error.code).toBe(expectedCode);
  }
};

/**
 * Test response assertions
 */
const expectResponse = (res, expectedStatus, expectedData = null) => {
  expect(res.status).toHaveBeenCalledWith(expectedStatus);
  if (expectedData) {
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining(expectedData)
    );
  }
};

/**
 * Test validation error assertions
 */
const expectValidationError = (res, expectedStatus = 400, expectedFields = []) => {
  expect(res.status).toHaveBeenCalledWith(expectedStatus);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      status: 'fail',
      code: 'VALIDATION_ERROR',
      details: expect.arrayContaining(
        expectedFields.map(field =>
          expect.objectContaining({ path: field })
        )
      )
    })
  );
};

/**
 * Test authentication error assertions
 */
const expectAuthError = (res, expectedStatus = 401) => {
  expect(res.status).toHaveBeenCalledWith(expectedStatus);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      status: 'fail',
      code: expect.stringMatching(/UNAUTHORIZED|AUTHENTICATION_ERROR/)
    })
  );
};

/**
 * Test success response assertions
 */
const expectSuccessResponse = (res, expectedStatus = 200, expectedMessage = null) => {
  expect(res.status).toHaveBeenCalledWith(expectedStatus);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      status: 'success',
      ...(expectedMessage && { message: expectedMessage })
    })
  );
};

/**
 * Test pagination response assertions
 */
const expectPaginatedResponse = (res, expectedStatus = 200) => {
  expect(res.status).toHaveBeenCalledWith(expectedStatus);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      status: 'success',
      data: expect.objectContaining({
        results: expect.any(Array),
        pagination: expect.objectContaining({
          page: expect.any(Number),
          limit: expect.any(Number),
          total: expect.any(Number),
          pages: expect.any(Number)
        })
      })
    })
  );
};

/**
 * Wait for async operations
 */
const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Test database connection
 */
const testDatabaseConnection = async() => {
  try {
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Test utilities for common operations
 */
const testUtils = {
  setupTestEnvironment,
  cleanupTestEnvironment,
  clearDatabase,
  createTestUser,
  createTestAdmin,
  createTestDestination,
  createTestBooking,
  createTestReview,
  generateTestToken,
  createMockRequest,
  createMockResponse,
  createMockNext,
  expectError,
  expectResponse,
  expectValidationError,
  expectAuthError,
  expectSuccessResponse,
  expectPaginatedResponse,
  waitFor,
  testDatabaseConnection
};

module.exports = testUtils;