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
  "message": "Success message"
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
- **PATCH** `/auth/update-password`
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

#### Get All Users (Admin)
- **GET** `/auth/users`

#### Get User Favorites
- **GET** `/auth/favorites`

#### Toggle Favorite Destination
- **POST** `/auth/favorites/:destinationId`

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

### Admin Routes (Require Admin Role)

#### Create Destination
- **POST** `/destinations`
- **Body:**
  ```json
  {
    "title": "Beautiful Beach Resort",
    "description": "A stunning beach destination...",
    "imageUrl": "https://example.com/image.jpg",
    "rating": 4.5,
    "price": 150,
    "location": "Maldives",
    "category": "Beach",
    "featured": true
  }
  ```

#### Update Destination
- **PUT** `/destinations/:id`
- **Body:** Same as create (all fields optional)

#### Delete Destination
- **DELETE** `/destinations/:id`

---

## Booking Endpoints (`/bookings`)

### Protected Routes (Require Authentication)

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

#### Get User's Bookings
- **GET** `/bookings/my-bookings`
- **Query Parameters:**
  - `status`: Filter by status (confirmed, cancelled, completed, no-show)
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)

#### Get Booking by ID
- **GET** `/bookings/:id`

#### Cancel Booking
- **PUT** `/bookings/:id/cancel`
- **Body:**
  ```json
  {
    "reason": "Change of plans"
  }
  ```

#### Check Availability
- **GET** `/bookings/check/availability`
- **Query Parameters:**
  - `destinationId`: Destination ID
  - `checkInDate`: Check-in date
  - `checkOutDate`: Check-out date

### Admin Routes (Require Admin Role)

#### Get All Bookings
- **GET** `/bookings/admin/all`
- **Query Parameters:**
  - `status`: Filter by status
  - `page`: Page number
  - `limit`: Items per page
  - `destinationId`: Filter by destination

#### Update Booking Status
- **PUT** `/bookings/admin/:id/status`
- **Body:**
  ```json
  {
    "status": "completed"
  }
  ```

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

#### Get User's Reviews
- **GET** `/reviews/my-reviews`
- **Query Parameters:**
  - `page`: Page number
  - `limit`: Items per page

#### Update Review
- **PUT** `/reviews/:reviewId`
- **Body:** Same as create (all fields optional)

#### Delete Review
- **DELETE** `/reviews/:reviewId`

#### Mark Review as Helpful
- **POST** `/reviews/:reviewId/helpful`

### Admin Routes (Require Admin Role)

#### Get All Reviews
- **GET** `/reviews/admin/all`
- **Query Parameters:**
  - `status`: Filter by status (pending, approved, rejected)
  - `page`: Page number
  - `limit`: Items per page
  - `destinationId`: Filter by destination

#### Update Review Status
- **PUT** `/reviews/admin/:reviewId/status`
- **Body:**
  ```json
  {
    "status": "approved",
    "adminResponse": "Thank you for your feedback!"
  }
  ```

---

## Payment Endpoints (`/payments`)

### Protected Routes (Require Authentication)

#### Process Payment
- **POST** `/payments/booking/:bookingId/process`
- **Body:**
  ```json
  {
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
- **GET** `/payments/booking/:bookingId/status`

#### Process Refund
- **POST** `/payments/booking/:bookingId/refund`
- **Body:**
  ```json
  {
    "reason": "Customer requested cancellation"
  }
  ```

#### Get Payment History
- **GET** `/payments/history`
- **Query Parameters:**
  - `page`: Page number
  - `limit`: Items per page
  - `status`: Filter by payment status (pending, paid, failed, refunded)

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
- **PUT** `/notifications/mark-read`
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

### Admin Routes (Require Admin Role)

#### Create Notification
- **POST** `/notifications/admin/create`
- **Body:**
  ```json
  {
    "userId": "64a1b2c3d4e5f6789012345",
    "title": "Welcome to Tripvar!",
    "message": "Thank you for joining our platform.",
    "type": "system",
    "priority": "medium",
    "actionUrl": "/dashboard",
    "actionText": "Go to Dashboard"
  }
  ```

#### Get All Notifications
- **GET** `/notifications/admin/all`
- **Query Parameters:**
  - `page`: Page number
  - `limit`: Items per page
  - `userId`: Filter by user
  - `type`: Filter by type
  - `isRead`: Filter by read status
  - `priority`: Filter by priority

---

## Health Check Endpoints

#### Health Check
- **GET** `/health`
- **Response:**
  ```json
  {
    "status": "OK",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 3600,
    "environment": "development"
  }
  ```

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
  "pagination": {
    "current": 1,
    "pages": 5,
    "total": 50
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

## File Uploads

Currently, the API expects image URLs for destinations. File upload functionality can be added by integrating with cloud storage services like AWS S3, Cloudinary, or similar.

---

## Webhooks

Webhook endpoints can be added for:
- Payment status updates
- Booking confirmations
- Review notifications
- System alerts

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

## Admin Features

Admin users have access to:
- CRUD operations for destinations
- View and manage all bookings
- Moderate reviews
- Send notifications to users
- View system statistics
- Manage user accounts

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