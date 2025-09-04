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
  createTestNotification,
  generateTestToken,
  expectValidationError,
  expectAuthError,
  expectSuccessResponse,
  expectNotFoundError
} = require('./setup');

describe('Notification API', () => {
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
    booking = await createTestBooking({ userId: user._id, destinationId: destination._id });
    token = generateTestToken(user);
    adminToken = generateTestToken(admin);
  });

  describe('GET /api/v1/notifications', () => {
    beforeEach(async () => {
      // Create test notifications
      await createTestNotification({ userId: user._id, type: 'booking_confirmed', isRead: true });
      await createTestNotification({ userId: user._id, type: 'booking_reminder', isRead: false });
      await createTestNotification({ userId: user._id, type: 'promotion', isRead: true });
    });

    it('should get user notifications successfully', async () => {
      const response = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'Notifications retrieved successfully');
      expect(response.body.data.notifications).toHaveLength(3);
      expect(response.body.data).toHaveProperty('unreadCount');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should filter notifications by type', async () => {
      const response = await request(app)
        .get('/api/v1/notifications?type=booking_confirmed')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.notifications).toHaveLength(1);
      expect(response.body.data.notifications[0].type).toBe('booking_confirmed');
    });

    it('should filter notifications by read status', async () => {
      const response = await request(app)
        .get('/api/v1/notifications?isRead=false')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.notifications).toHaveLength(1);
      expect(response.body.data.notifications[0].isRead).toBe(false);
    });

    it('should filter notifications by priority', async () => {
      const response = await request(app)
        .get('/api/v1/notifications?priority=high')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      // Should return notifications with high priority
    });

    it('should handle pagination', async () => {
      const response = await request(app)
        .get('/api/v1/notifications?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.notifications).toHaveLength(2);
      expect(response.body.data.pagination.current).toBe(1);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/notifications')
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('GET /api/v1/notifications/:id', () => {
    let notification;

    beforeEach(async () => {
      notification = await createTestNotification({ userId: user._id });
    });

    it('should get notification by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/v1/notifications/${notification._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'Notification retrieved successfully');
      expect(response.body.data.notification._id).toBe(notification._id.toString());
    });

    it('should mark notification as read when accessed', async () => {
      // Create unread notification
      const unreadNotification = await createTestNotification({ 
        userId: user._id, 
        isRead: false 
      });

      const response = await request(app)
        .get(`/api/v1/notifications/${unreadNotification._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.notification.isRead).toBe(true);
    });

    it('should fail to get non-existent notification', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expectNotFoundError(response, 404, 'Notification not found');
    });

    it('should fail to access another user\'s notification', async () => {
      const otherUser = await createTestUser({ email: 'other@example.com' });
      const otherUserNotification = await createTestNotification({ userId: otherUser._id });

      const response = await request(app)
        .get(`/api/v1/notifications/${otherUserNotification._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expectNotFoundError(response, 404, 'Notification not found');
    });
  });

  describe('PATCH /api/v1/notifications/mark-read', () => {
    let notifications;

    beforeEach(async () => {
      notifications = [
        await createTestNotification({ userId: user._id, isRead: false }),
        await createTestNotification({ userId: user._id, isRead: false }),
        await createTestNotification({ userId: user._id, isRead: true })
      ];
    });

    it('should mark specific notifications as read', async () => {
      const notificationIds = [notifications[0]._id, notifications[1]._id];

      const response = await request(app)
        .patch('/api/v1/notifications/mark-read')
        .set('Authorization', `Bearer ${token}`)
        .send({ notificationIds })
        .expect(200);

      expectSuccessResponse(response, 200, 'Notifications marked as read successfully');
      expect(response.body.data.modifiedCount).toBe(2);
    });

    it('should mark all notifications as read when no IDs provided', async () => {
      const response = await request(app)
        .patch('/api/v1/notifications/mark-read')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.modifiedCount).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .patch('/api/v1/notifications/mark-read')
        .send({ notificationIds: [notifications[0]._id] })
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('DELETE /api/v1/notifications', () => {
    let notifications;

    beforeEach(async () => {
      notifications = [
        await createTestNotification({ userId: user._id }),
        await createTestNotification({ userId: user._id }),
        await createTestNotification({ userId: user._id })
      ];
    });

    it('should delete specific notifications', async () => {
      const notificationIds = [notifications[0]._id, notifications[1]._id];

      const response = await request(app)
        .delete('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`)
        .send({ notificationIds })
        .expect(200);

      expectSuccessResponse(response, 200, 'Notifications deleted successfully');
      expect(response.body.data.deletedCount).toBe(2);
    });

    it('should fail to delete without notification IDs', async () => {
      const response = await request(app)
        .delete('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Notification IDs are required');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/notifications')
        .send({ notificationIds: [notifications[0]._id] })
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('GET /api/v1/notifications/stats', () => {
    beforeEach(async () => {
      // Create notifications with different types and priorities
      await createTestNotification({ 
        userId: user._id, 
        type: 'booking_confirmed', 
        priority: 'high',
        isRead: false 
      });
      await createTestNotification({ 
        userId: user._id, 
        type: 'booking_reminder', 
        priority: 'medium',
        isRead: true 
      });
      await createTestNotification({ 
        userId: user._id, 
        type: 'promotion', 
        priority: 'low',
        isRead: false 
      });
    });

    it('should get notification statistics successfully', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'Notification statistics retrieved successfully');
      expect(response.body.data.notificationStats).toHaveProperty('total');
      expect(response.body.data.notificationStats).toHaveProperty('unread');
      expect(response.body.data.notificationStats).toHaveProperty('byType');
      expect(response.body.data.notificationStats).toHaveProperty('byPriority');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/stats')
        .expect(401);

      expectAuthError(response, 401);
    });
  });

  describe('POST /api/v1/notifications (Admin)', () => {
    it('should create notification successfully (admin only)', async () => {
      const notificationData = {
        userId: user._id,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'system',
        priority: 'medium'
      };

      const response = await request(app)
        .post('/api/v1/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notificationData)
        .expect(201);

      expectSuccessResponse(response, 201, 'Notification created successfully');
      expect(response.body.data.notification.title).toBe(notificationData.title);
      expect(response.body.data.notification.message).toBe(notificationData.message);
    });

    it('should fail to create notification with missing required fields', async () => {
      const notificationData = {
        userId: user._id,
        title: 'Test Notification'
        // Missing message and type
      };

      const response = await request(app)
        .post('/api/v1/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(notificationData)
        .expect(400);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('Validation failed');
    });

    it('should fail for non-admin users', async () => {
      const notificationData = {
        userId: user._id,
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'system'
      };

      const response = await request(app)
        .post('/api/v1/notifications')
        .set('Authorization', `Bearer ${token}`)
        .send(notificationData)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });
  });

  describe('GET /api/v1/notifications/admin/all (Admin)', () => {
    beforeEach(async () => {
      // Create notifications for different users
      await createTestNotification({ userId: user._id, type: 'booking_confirmed' });
      await createTestNotification({ userId: admin._id, type: 'system' });
    });

    it('should get all notifications for admin', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response, 200, 'All notifications retrieved successfully');
      expect(response.body.data.notifications).toHaveLength(2);
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('should filter notifications by user for admin', async () => {
      const response = await request(app)
        .get(`/api/v1/notifications/admin/all?userId=${user._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expectSuccessResponse(response, 200);
      expect(response.body.data.notifications).toHaveLength(1);
      expect(response.body.data.notifications[0].user._id).toBe(user._id.toString());
    });

    it('should fail for non-admin users', async () => {
      const response = await request(app)
        .get('/api/v1/notifications/admin/all')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);

      expect(response.body.status).toBe('fail');
      expect(response.body.message).toContain('You do not have permission to perform this action');
    });
  });
});