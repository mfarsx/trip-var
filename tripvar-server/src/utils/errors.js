class AppError extends Error {
  constructor(message, statusCode, details = null, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;
    this.code = code;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.constructor.name,
      message: this.message,
      statusCode: this.statusCode,
      status: this.status,
      details: this.details,
      code: this.code,
      timestamp: this.timestamp
    };
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details = null) {
    super(message, 404, details, 'RESOURCE_NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = null) {
    super(message, 400, details, 'VALIDATION_ERROR');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access', details = null) {
    super(message, 401, details, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden access', details = null) {
    super(message, 403, details, 'FORBIDDEN');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details = null) {
    super(message, 409, details, 'CONFLICT');
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests', details = null) {
    super(message, 429, details, 'TOO_MANY_REQUESTS');
  }
}

class InternalServerError extends AppError {
  constructor(message = 'Internal server error', details = null) {
    super(message, 500, details, 'INTERNAL_SERVER_ERROR');
  }
}

class ServiceUnavailableError extends AppError {
  constructor(message = 'Service unavailable', details = null) {
    super(message, 503, details, 'SERVICE_UNAVAILABLE');
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Database error', details = null) {
    super(message, 500, details, 'DATABASE_ERROR');
  }
}

class ExternalServiceError extends AppError {
  constructor(message = 'External service error', details = null) {
    super(message, 502, details, 'EXTERNAL_SERVICE_ERROR');
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', details = null) {
    super(message, 401, details, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Authorization failed', details = null) {
    super(message, 403, details, 'AUTHORIZATION_ERROR');
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', details = null) {
    super(message, 429, details, 'RATE_LIMIT_EXCEEDED');
  }
}

class BusinessLogicError extends AppError {
  constructor(message = 'Business logic error', details = null) {
    super(message, 422, details, 'BUSINESS_LOGIC_ERROR');
  }
}

// Error factory for creating specific error types
const createError = {
  notFound: (message, details) => new NotFoundError(message, details),
  validation: (message, details) => new ValidationError(message, details),
  unauthorized: (message, details) => new UnauthorizedError(message, details),
  forbidden: (message, details) => new ForbiddenError(message, details),
  conflict: (message, details) => new ConflictError(message, details),
  tooManyRequests: (message, details) => new TooManyRequestsError(message, details),
  internal: (message, details) => new InternalServerError(message, details),
  serviceUnavailable: (message, details) => new ServiceUnavailableError(message, details),
  database: (message, details) => new DatabaseError(message, details),
  externalService: (message, details) => new ExternalServiceError(message, details),
  authentication: (message, details) => new AuthenticationError(message, details),
  authorization: (message, details) => new AuthorizationError(message, details),
  rateLimit: (message, details) => new RateLimitError(message, details),
  businessLogic: (message, details) => new BusinessLogicError(message, details)
};

// Error codes mapping for client-side handling
const errorCodes = {
  RESOURCE_NOT_FOUND: 'The requested resource was not found',
  VALIDATION_ERROR: 'The provided data is invalid',
  UNAUTHORIZED: 'Authentication is required',
  FORBIDDEN: 'You do not have permission to perform this action',
  CONFLICT: 'The resource already exists or conflicts with existing data',
  TOO_MANY_REQUESTS: 'Too many requests, please try again later',
  INTERNAL_SERVER_ERROR: 'An internal server error occurred',
  SERVICE_UNAVAILABLE: 'The service is temporarily unavailable',
  DATABASE_ERROR: 'A database error occurred',
  EXTERNAL_SERVICE_ERROR: 'An external service error occurred',
  AUTHENTICATION_ERROR: 'Authentication failed',
  AUTHORIZATION_ERROR: 'Authorization failed',
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
  BUSINESS_LOGIC_ERROR: 'Business logic validation failed'
};

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
  DatabaseError,
  ExternalServiceError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  BusinessLogicError,
  createError,
  errorCodes
};
