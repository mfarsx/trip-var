# TripVar Server API Documentation

## Base URL
All endpoints are prefixed with `/api/v1`

## Authentication Endpoints

### POST /auth/register
Creates a new user account.
- Input:
  ```json
  {
    "email": "string (required) - Valid email address",
    "password": "string (required) - User password",
    "name": "string (required) - User's full name"
  }
  ```
- Output:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "email": "string",
        "name": "string",
        "id": "string"
      },
      "token": "string - JWT authentication token"
    },
    "message": "User registered successfully"
  }
  ```

### POST /auth/login
Authenticates a user and returns a token.
- Input:
  ```json
  {
    "email": "string (required) - Registered email",
    "password": "string (required) - User password"
  }
  ```
- Output:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "email": "string",
        "name": "string",
        "id": "string"
      },
      "token": "string - JWT authentication token"
    },
    "message": "Login successful"
  }
  ```

## Protected Endpoints
All endpoints below require Authentication header: `Bearer <token>`

### GET /auth/profile
Retrieves the current user's profile.
- Output:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "email": "string",
        "name": "string",
        "id": "string"
      }
    }
  }
  ```

### PATCH /auth/profile
Updates the current user's profile information.
- Input:
  ```json
  {
    "name": "string (optional) - New name",
    "email": "string (optional) - New email"
  }
  ```
- Output:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "email": "string",
        "name": "string",
        "id": "string"
      }
    },
    "message": "Profile updated successfully"
  }
  ```

### PATCH /auth/update-password
Updates the current user's password.
- Input:
  ```json
  {
    "currentPassword": "string (required) - Current password",
    "newPassword": "string (required) - New password"
  }
  ```
- Output:
  ```json
  {
    "success": true,
    "message": "Password updated successfully"
  }
  ```

### DELETE /auth/profile
Deletes the current user's account.
- Output:
  ```json
  {
    "success": true,
    "message": "Account deleted successfully"
  }
  ```

## System Endpoints

### GET /health
Health check endpoint to verify API status.
- Output:
  ```json
  {
    "status": "ok"
  }
  ```

## Error Responses
All endpoints may return the following error structure:
```json
{
  "success": false,
  "error": {
    "message": "string - Error description",
    "code": "string - Error code (if applicable)"
  }
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error
