# Tripvar API Endpoints Documentation

## Base URL
```
/api/v1
```

## Authentication
Most endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
All responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "meta": {
    "pagination": { ... },
    "filters": { ... }
  }
}
```

---

## Authentication Endpoints (`/auth`)

### Public Routes

#### Register User
- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "dateOfBirth": "1990-01-01",
    "nationality": "United States"
  }
  ```

#### Login User
- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### Protected Routes (Require Authentication)

#### Get User Profile
- **GET** `/auth/profile`

#### Update User Profile
- **PATCH** `/auth/profile`
- **Body:**
  ```json
  {
    "name": "John Smith",
    "dateOfBirth": "1990-01-01",
    "nationality": "Canada"
  }
  ```

#### Update Password
- **PATCH** `/auth/password`
- **Body:**
  ```json
  {
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123"
  }
  ```

#### Delete Account
- **DELETE** `/auth/profile`

#### Logout
- **POST** `/auth/logout`

#### Get User Favorites
- **GET** `/auth/favorites`

#### Add Favorite Destination
- **POST** `/auth/favorites/:destinationId`

#### Remove Favorite Destination
- **DELETE** `/auth/favorites/:destinationId`

---

## Destination Endpoints (`/destinations`)

### Public Routes

#### Get All Destinations
- **GET** `/destinations`
- **Query Parameters:**
  - `category`: Filter by category (Beach, Mountain, City, Cultural, Adventure)
  - `featured`: Filter featured destinations (true/false)
  - `search`: General search term
  - `from`: Departure location
  - `to`: Destination location
  - `date`: Travel date
  - `guests`: Number of guests

#### Get Destination by ID
- **GET** `/destinations/:id`

---

## Booking Endpoints (`/bookings`)

### Protected Routes (Require Authentication)

#### Get User's Bookings
- **GET** `/bookings`
- **Query Parameters:**
  - `status`: Filter by status (confirmed, cancelled, completed, no-show)
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)

#### Create Booking
- **POST** `/bookings`
- **Body:**
  ```json
  {
    "destinationId": "64a1b2c3d4e5f6789012345",
    "checkInDate": "2024-06-01",
    "checkOutDate": "2024-06-05",
    "numberOfGuests": 2,
    "paymentMethod": "credit-card",
    "specialRequests": "Late check-in requested",
    "contactEmail": "user@example.com",
    "contactPhone": "+1234567890"
  }
  ```

#### Get Booking by ID
- **GET** `/bookings/:id`

#### Cancel Booking
- **DELETE** `/bookings/:id`
- **Body:**
  ```json
  {
    "reason": "Change of plans"
  }
  ```

#### Check Availability
- **GET** `/bookings/availability`
- **Query Parameters:**
  - `destinationId`: Destination ID
  - `checkInDate`: Check-in date
  - `checkOutDate`: Check-out date

---

## Review Endpoints (`/reviews`)

### Public Routes

#### Get Destination Reviews
- **GET** `/reviews/destination/:destinationId`
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `sort`: Sort order (newest, oldest, highest, lowest, most_helpful)

### Protected Routes (Require Authentication)

#### Get User's Reviews
- **GET** `/reviews`
- **Query Parameters:**
  - `page`: Page number
  - `limit`: Items per page

#### Create Review
- **POST** `/reviews`
- **Body:**
  ```json
  {
    "destinationId": "64a1b2c3d4e5f6789012345",
    "bookingId": "64a1b2c3d4e5f6789012346",
    "title": "Amazing experience!",
    "content": "Had a wonderful time at this destination...",
    "rating": 5,
    "ratings": {
      "cleanliness": 5,
      "location": 4,
      "value": 5,
      "service": 4
    }
  }
  ```

#### Update Review
- **PUT** `/reviews/:reviewId`
- **Body:** Same as create (all fields optional)

#### Delete Review
- **DELETE** `/reviews/:reviewId`

#### Like/Unlike Review
- **POST** `/reviews/:reviewId/likes`

---

## Payment Endpoints (`/payments`)

### Protected Routes (Require Authentication)

#### Get Payment History
- **GET** `/payments`
- **Query Parameters:**
  - `page`: Page number
  - `limit`: Items per page
  - `status`: Filter by payment status (pending, paid, failed, refunded)

#### Process Payment
- **POST** `/payments`
- **Body:**
  ```json
  {
    "bookingId": "64a1b2c3d4e5f6789012345",
    "paymentMethod": "credit-card",
    "paymentDetails": {
      "cardNumber": "4111111111111111",
      "expiryMonth": "12",
      "expiryYear": "2025",
      "cvv": "123"
    }
  }
  ```

#### Get Payment Status
- **GET** `/payments/:paymentId`

#### Process Refund
- **POST** `/payments/:paymentId/refunds`
- **Body:**
  ```json
  {
    "reason": "Customer requested cancellation"
  }
  ```

---

## Notification Endpoints (`/notifications`)

### Protected Routes (Require Authentication)

#### Get User Notifications
- **GET** `/notifications`
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 20)
  - `type`: Filter by notification type
  - `isRead`: Filter by read status (true/false)
  - `priority`: Filter by priority (low, medium, high, urgent)

#### Get Notification Statistics
- **GET** `/notifications/stats`

#### Get Notification by ID
- **GET** `/notifications/:notificationId`

#### Mark Notifications as Read
- **PATCH** `/notifications/read`
- **Body:**
  ```json
  {
    "notificationIds": ["64a1b2c3d4e5f6789012345", "64a1b2c3d4e5f6789012346"]
  }
  ```

#### Delete Notifications
- **DELETE** `/notifications`
- **Body:**
  ```json
  {
    "notificationIds": ["64a1b2c3d4e5f6789012345", "64a1b2c3d4e5f6789012346"]
  }
  ```

---

## Admin Endpoints (`/admin`)

### All admin routes require admin role authorization

#### User Management
- **GET** `/admin/users` - Get all users

#### Destination Management
- **GET** `/admin/destinations` - Get all destinations
- **POST** `/admin/destinations` - Create destination
- **PUT** `/admin/destinations/:id` - Update destination
- **PATCH** `/admin/destinations/:id` - Partial update destination
- **DELETE** `/admin/destinations/:id` - Delete destination

#### Booking Management
- **GET** `/admin/bookings` - Get all bookings
- **PATCH** `/admin/bookings/:id/status` - Update booking status

#### Review Management
- **GET** `/admin/reviews` - Get all reviews
- **PATCH** `/admin/reviews/:id/status` - Update review status

#### Notification Management
- **GET** `/admin/notifications` - Get all notifications
- **POST** `/admin/notifications` - Create notification

---

## Health Check Endpoints

#### Health Check
- **GET** `/health`
- **Response:**
  ```json
  {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "service": "tripvar-server",
    "version": "1.0.0",
    "environment": "development",
    "uptime": 3600
  }
  ```

#### Database Health Check
- **GET** `/health/db`

#### Redis Health Check
- **GET** `/health/redis`

#### Complete Health Check
- **GET** `/health/all`

#### Readiness Probe
- **GET** `/health/ready`

#### Liveness Probe
- **GET** `/health/live`

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### Unauthorized Error (401)
```json
{
  "success": false,
  "message": "You are not logged in! Please log in to get access."
}
```

### Forbidden Error (403)
```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Conflict Error (409)
```json
{
  "success": false,
  "message": "Resource already exists or conflict occurred"
}
```

### Rate Limit Error (429)
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later.",
  "retryAfter": "15 minutes"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **Admin endpoints**: No additional rate limiting (relies on authentication)

---

## Pagination

Most list endpoints support pagination with these query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10-20 depending on endpoint)

Response includes pagination metadata:
```json
{
  "meta": {
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 50,
      "limit": 10
    }
  }
}
```

---

## Search and Filtering

Many endpoints support filtering and search:
- **Destinations**: Search by title, description, location, category, featured status
- **Bookings**: Filter by status, destination, date ranges
- **Reviews**: Sort by newest, oldest, highest rating, most helpful
- **Notifications**: Filter by type, read status, priority

---

## API Versioning

The API uses URL versioning (`/api/v1`). Future versions will be available at `/api/v2`, etc.

---

## Authentication Flow

1. Register or login to get a JWT token
2. Include the token in the Authorization header for protected routes
3. Token expires based on JWT_EXPIRES_IN environment variable
4. Refresh token functionality can be added for better UX

---

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection protection (MongoDB)
- XSS protection