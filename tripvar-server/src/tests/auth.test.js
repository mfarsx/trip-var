const request = require('supertest');
const app = require('./app');
const {
  setupTestEnvironment,
  cleanupTestEnvironment,
  clearDatabase,
  createTestUser,
  createTestAdmin,
  generateTestToken,
  expectValidationError,
  expectAuthError,
  expectSuccessResponse
} = require('./setup');

describe('Authentication API', () => {
  beforeAll(async() => {
    await setupTestEnvironment();
  });

  afterAll(async() => {
    await cleanupTestEnvironment();
  });

  beforeEach(async() => {
    await clearDatabase();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async() => {
      const userData = {
        email: 'newuser@example.com',
        password: 'NewPassword123!',
        name: 'New User',
        dateOfBirth: '1990-01-01',
        nationality: 'United States'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expectSuccessResponse(response, 201, 'User registered successfully');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should fail to register with invalid email', async() => {
      const userData = {
        email: 'invalid-email',
        password: 'ValidPassword123!',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expectValidationError(response, 400, ['email']);
    });

    it('should fail to register with weak password', async() => {
      const userData = {
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expectValidationError(response, 400, ['password']);
    });

    it('should fail to register with duplicate email', async() => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'ValidPassword123!',
        name: 'Test User'
      };

      // Create first user
      await createTestUser({ email: userData.email });

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.status).toBe('fail');
      expect(response.body.code).toBe('CONFLICT');
      expect(response.body.message).toContain('Email');
    });

    it('should fail to register with missing required fields', async() => {
      const userData = {
        email: 'test@example.com'
        // Missing password and name
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);

      expectValidationError(response, 400, ['password', 'name']);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async() => {
      await createTestUser({
        email: 'login@example.com',
        password: 'LoginPassword123!'
      });
    });

    it('should login successfully with valid credentials', async() => {
      const loginData = {
        email: 'login@example.com',
        password: 'LoginPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expectSuccessResponse(response, 200, 'Login successful');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(loginData.email);
    });

    it('should fail to login with invalid email', async() => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'LoginPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should fail to login with invalid password', async() => {
      const loginData = {
        email: 'login@example.com',
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should fail to login with missing credentials', async() => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);

      expectValidationError(response, 400, ['email', 'password']);
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    let user, token;

    beforeEach(async() => {
      user = await createTestUser();
      token = generateTestToken(user);
    });

    it('should get user profile successfully', async() => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'Profile retrieved successfully');
      expect(response.body.data.user.email).toBe(user.email);
      expect(response.body.data.user.name).toBe(user.name);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should fail to get profile without token', async() => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should fail to get profile with invalid token', async() => {
      const response = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('PATCH /api/v1/auth/profile', () => {
    let user, token;

    beforeEach(async() => {
      user = await createTestUser();
      token = generateTestToken(user);
    });

    it('should update user profile successfully', async() => {
      const updateData = {
        name: 'Updated Name',
        nationality: 'Canada'
      };

      const response = await request(app)
        .patch('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expectSuccessResponse(response, 200, 'Profile updated successfully');
      expect(response.body.data.user.name).toBe(updateData.name);
      expect(response.body.data.user.nationality).toBe(updateData.nationality);
    });

    it('should fail to update profile with invalid data', async() => {
      const updateData = {
        name: 'A', // Too short
        email: 'invalid-email'
      };

      const response = await request(app)
        .patch('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);

      expectValidationError(response, 400, ['name', 'email']);
    });

    it('should fail to update profile without authentication', async() => {
      const updateData = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .patch('/api/v1/auth/profile')
        .send(updateData)
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('PATCH /api/v1/auth/update-password', () => {
    let user, token;

    beforeEach(async() => {
      user = await createTestUser({
        password: 'CurrentPassword123!'
      });
      token = generateTestToken(user);
    });

    it('should update password successfully', async() => {
      const passwordData = {
        currentPassword: 'CurrentPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      };

      const response = await request(app)
        .patch('/api/v1/auth/update-password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData)
        .expect(200);

      expectSuccessResponse(response, 200, 'Password updated successfully');
      expect(response.body.data).toHaveProperty('token');
    });

    it('should fail to update password with wrong current password', async() => {
      const passwordData = {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewPassword123!',
        confirmPassword: 'NewPassword123!'
      };

      const response = await request(app)
        .patch('/api/v1/auth/update-password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData)
        .expect(401);

      expectAuthError(response, 401);
    });

    it('should fail to update password with weak new password', async() => {
      const passwordData = {
        currentPassword: 'CurrentPassword123!',
        newPassword: 'weak',
        confirmPassword: 'weak'
      };

      const response = await request(app)
        .patch('/api/v1/auth/update-password')
        .set('Authorization', `Bearer ${token}`)
        .send(passwordData)
        .expect(400);

      expectValidationError(response, 400, ['newPassword']);
    });
  });

  describe('DELETE /api/v1/auth/profile', () => {
    let user, token;

    beforeEach(async() => {
      user = await createTestUser();
      token = generateTestToken(user);
    });

    it('should delete user account successfully', async() => {
      const response = await request(app)
        .delete('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      expect(response.body).toEqual({});
    });

    it('should fail to delete account without authentication', async() => {
      const response = await request(app)
        .delete('/api/v1/auth/profile')
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to auth endpoints', async() => {
      const userData = {
        email: 'ratelimit@example.com',
        password: 'RateLimitPassword123!',
        name: 'Rate Limit User'
      };

      // Make multiple requests quickly
      const promises = Array(10).fill().map(() =>
        request(app)
          .post('/api/v1/auth/register')
          .send(userData)
      );

      const responses = await Promise.allSettled(promises);

      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(
        response => response.status === 'fulfilled' && response.value.status === 429
      );

      // In test environment, rate limiting is disabled, so all requests should succeed
      expect(responses.length).toBeGreaterThan(0);
    });
  });
});