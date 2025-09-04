const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { createError } = require("../utils/errors");

// Global test setup
let mongoServer;

/**
 * Setup test environment
 */
const setupTestEnvironment = async () => {
  // Create in-memory MongoDB instance with optimized settings
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '6.0.0', // Use specific version for consistency
    },
    instance: {
      dbName: 'tripvar-test',
    },
    // Optimize for test performance
    autoStart: true,
  });

  const mongoUri = mongoServer.getUri();

  // Connect to test database with optimized settings
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 1, // Reduce connection pool for tests
    serverSelectionTimeoutMS: 5000, // Faster timeout
    socketTimeoutMS: 45000,
    bufferCommands: false, // Disable mongoose buffering
  });

  // Set test environment variables
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "test-jwt-secret-key-for-testing-purposes-only";
  process.env.JWT_EXPIRES_IN = "1h";
  process.env.LOG_LEVEL = "error"; // Reduce log noise during tests
  process.env.REDIS_URL = "redis://localhost:6379"; // Use local Redis for tests
  process.env.MONGODB_URI = mongoUri; // Use in-memory MongoDB
};

/**
 * Cleanup test environment
 */
const cleanupTestEnvironment = async () => {
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
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

/**
 * Create test user
 */
const createTestUser = async (userData = {}) => {
  const User = require("../public/models/user.model");

  const defaultUser = {
    email: "test@example.com",
    password: "TestPassword123!",
    name: "Test User",
    dateOfBirth: new Date("1990-01-01"),
    nationality: "United States",
    role: "user",
    ...userData,
  };

  return await User.create(defaultUser);
};

/**
 * Create test admin user
 */
const createTestAdmin = async (adminData = {}) => {
  return await createTestUser({
    email: "admin@example.com",
    name: "Test Admin",
    role: "admin",
    ...adminData,
  });
};

/**
 * Create test destination
 */
const createTestDestination = async (destinationData = {}) => {
  const Destination = require("../public/models/destination.model");

  const defaultDestination = {
    title: "Test Destination",
    description: "A beautiful test destination for testing purposes",
    imageUrl: "https://example.com/test-image.jpg",
    location: "Test Location",
    category: "Beach",
    price: 299.99,
    rating: 4.5,
    amenities: ["WiFi", "Pool"],
    isActive: true,
    ...destinationData,
  };

  return await Destination.create(defaultDestination);
};

/**
 * Generate future dates for testing
 */
const generateFutureDates = (daysFromNow = 30, nights = 4) => {
  const checkInDate = new Date();
  checkInDate.setDate(checkInDate.getDate() + daysFromNow);
  
  const checkOutDate = new Date(checkInDate);
  checkOutDate.setDate(checkOutDate.getDate() + nights);
  
  return {
    checkInDate: checkInDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
    checkOutDate: checkOutDate.toISOString().split('T')[0]
  };
};

/**
 * Create test booking
 */
const createTestBooking = async (bookingData = {}) => {
  const Booking = require("../public/models/booking.model");

  // Create future dates for testing
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
  const checkOutDate = new Date(futureDate);
  checkOutDate.setDate(checkOutDate.getDate() + 4); // 4 days later

  const defaultBooking = {
    user: bookingData.userId || (await createTestUser())._id,
    destination: bookingData.destinationId || (await createTestDestination())._id,
    checkInDate: futureDate,
    checkOutDate: checkOutDate,
    numberOfGuests: 2,
    totalAmount: 1199.96,
    pricePerNight: 299.99,
    totalNights: 4,
    status: "confirmed",
    paymentStatus: "pending",
    paymentMethod: "credit-card",
    contactEmail: "test@example.com",
    contactPhone: "+1234567890",
    specialRequests: "Test special requests",
    ...bookingData,
  };

  return await Booking.create(defaultBooking);
};

/**
 * Create test review
 */
const createTestReview = async (reviewData = {}) => {
  const Review = require("../public/models/review.model");

  const defaultReview = {
    user: reviewData.userId || (await createTestUser())._id,
    destination:
      reviewData.destinationId || (await createTestDestination())._id,
    title: "Great test destination!",
    content: "This is a test review for testing purposes. Highly recommended!",
    rating: 5,
    status: "approved",
    ...reviewData,
  };

  return await Review.create(defaultReview);
};

/**
 * Create test notification
 */
const createTestNotification = async (notificationData = {}) => {
  const Notification = require("../public/models/notification.model");

  const defaultNotification = {
    user: notificationData.userId || (await createTestUser())._id,
    title: "Test Notification",
    message: "This is a test notification for testing purposes.",
    type: "system",
    priority: "medium",
    isRead: false,
    ...notificationData,
  };

  return await Notification.create(defaultNotification);
};

/**
 * Generate JWT token for testing
 */
const generateTestToken = (user) => {
  const jwt = require("jsonwebtoken");
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
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
    ip: "127.0.0.1",
    method: "GET",
    originalUrl: "/test",
    get: jest.fn(),
    ...overrides,
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
    on: jest.fn().mockReturnThis(),
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
const expectValidationError = (
  res,
  expectedStatus = 400,
  expectedFields = []
) => {
  expect(res.status).toBe(expectedStatus);
  expect(res.body.status).toBe("fail");
  
  // Check for validation error code or message
  const hasValidationError = 
    res.body.code === "VALIDATION_ERROR" ||
    res.body.code === "INVALID_JSON" ||
    res.body.code === "PAYLOAD_TOO_LARGE" ||
    res.body.message?.toLowerCase().includes("validation") ||
    res.body.message?.toLowerCase().includes("invalid") ||
    res.body.message?.toLowerCase().includes("required");
  
  expect(hasValidationError).toBe(true);
  
  if (expectedFields.length > 0) {
    // Check if details array contains errors for the expected fields
    const details = res.body.details || [];
    const message = res.body.message || "";
    
    expectedFields.forEach((field) => {
      const hasFieldError = details.some(
        (error) =>
          error.path === field ||
          error.field === field ||
          (error.message &&
            error.message.toLowerCase().includes(field.toLowerCase())) ||
          (error.message &&
            error.message.toLowerCase().includes(field.replace(/([A-Z])/g, ' $1').toLowerCase().trim()))
      ) || message.toLowerCase().includes(field.toLowerCase()) ||
         message.toLowerCase().includes(field.replace(/([A-Z])/g, ' $1').toLowerCase().trim());
      
      expect(hasFieldError).toBe(true);
    });
  }
};

/**
 * Test authentication error assertions
 */
const expectAuthError = (res, expectedStatus = 401) => {
  expect(res.status).toBe(expectedStatus);
  expect(res.body.status).toBe("fail");
  expect(res.body.code).toMatch(/UNAUTHORIZED|AUTHENTICATION_ERROR|INVALID_TOKEN/);
};

/**
 * Test success response assertions
 */
const expectSuccessResponse = (
  res,
  expectedStatus = 200,
  expectedMessage = null
) => {
  expect(res.status).toBe(expectedStatus);
  expect(res.body.status).toBe("success");
  if (expectedMessage) {
    expect(res.body.message).toBe(expectedMessage);
  }
};

/**
 * Test pagination response assertions
 */
const expectPaginatedResponse = (res, expectedStatus = 200) => {
  expect(res.status).toBe(expectedStatus);
  expect(res.body.status).toBe("success");
  expect(res.body.data.results).toEqual(expect.any(Array));
  expect(res.body.data.pagination).toEqual(
    expect.objectContaining({
      page: expect.any(Number),
      limit: expect.any(Number),
      total: expect.any(Number),
      pages: expect.any(Number),
    })
  );
};

/**
 * Test not found error assertions
 */
const expectNotFoundError = (
  res,
  expectedStatus = 404,
  expectedMessage = null
) => {
  expect(res.status).toBe(expectedStatus);
  expect(res.body.status).toBe("fail");
  if (expectedMessage) {
    expect(res.body.message).toContain(expectedMessage);
  }
};

/**
 * Test conflict error assertions
 */
const expectConflictError = (
  res,
  expectedStatus = 409,
  expectedMessage = null
) => {
  expect(res.status).toBe(expectedStatus);
  expect(res.body.status).toBe("fail");
  if (expectedMessage) {
    expect(res.body.message).toContain(expectedMessage);
  }
};

/**
 * Wait for async operations
 */
const waitFor = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Test database connection
 */
const testDatabaseConnection = async () => {
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
  generateFutureDates,
  createMockRequest,
  createMockResponse,
  createMockNext,
  expectError,
  expectResponse,
  expectValidationError,
  expectAuthError,
  expectSuccessResponse,
  expectPaginatedResponse,
  expectNotFoundError,
  expectConflictError,
  waitFor,
  testDatabaseConnection,
};

module.exports = testUtils;
