/**
 * Standardized response utilities for consistent API responses
 */

/**
 * Create a standardized success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response data
 * @param {Object} meta - Additional metadata (pagination, etc.)
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = {}) => {
  const response = {
    status: 'success',
    message,
    timestamp: new Date().toISOString(),
    requestId: res.locals.requestId || res.get('X-Request-ID')
  };

  if (data !== null) {
    response.data = data;
  }

  if (Object.keys(meta).length > 0) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Create a standardized error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {string} code - Error code
 * @param {*} details - Error details
 */
const sendError = (res, statusCode = 500, message = 'Internal Server Error', code = 'INTERNAL_ERROR', details = null) => {
  const response = {
    status: 'error',
    message,
    code,
    timestamp: new Date().toISOString(),
    requestId: res.locals.requestId || res.get('X-Request-ID')
  };

  if (details !== null) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Create a paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of data items
 * @param {Object} pagination - Pagination metadata
 * @param {string} message - Success message
 */
const sendPaginated = (res, data, pagination, message = 'Data retrieved successfully') => {
  return sendSuccess(res, 200, message, data, { pagination });
};

/**
 * Create a created response (201)
 * @param {Object} res - Express response object
 * @param {*} data - Created resource data
 * @param {string} message - Success message
 */
const sendCreated = (res, data, message = 'Resource created successfully') => {
  return sendSuccess(res, 201, message, data);
};

/**
 * Create a no content response (204)
 * @param {Object} res - Express response object
 */
const sendNoContent = (res) => {
  return res.status(204).send();
};

/**
 * Create a bad request response (400)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {*} details - Validation details
 */
const sendBadRequest = (res, message = 'Bad Request', details = null) => {
  return sendError(res, 400, message, 'BAD_REQUEST', details);
};

/**
 * Create an unauthorized response (401)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendUnauthorized = (res, message = 'Unauthorized') => {
  return sendError(res, 401, message, 'UNAUTHORIZED');
};

/**
 * Create a forbidden response (403)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendForbidden = (res, message = 'Forbidden') => {
  return sendError(res, 403, message, 'FORBIDDEN');
};

/**
 * Create a not found response (404)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendNotFound = (res, message = 'Resource not found') => {
  return sendError(res, 404, message, 'NOT_FOUND');
};

/**
 * Create a conflict response (409)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {*} details - Conflict details
 */
const sendConflict = (res, message = 'Conflict', details = null) => {
  return sendError(res, 409, message, 'CONFLICT', details);
};

/**
 * Create a too many requests response (429)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {Object} details - Rate limit details
 */
const sendTooManyRequests = (res, message = 'Too many requests', details = null) => {
  return sendError(res, 429, message, 'TOO_MANY_REQUESTS', details);
};

/**
 * Create an internal server error response (500)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendInternalError = (res, message = 'Internal Server Error') => {
  return sendError(res, 500, message, 'INTERNAL_ERROR');
};

/**
 * Create a service unavailable response (503)
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
const sendServiceUnavailable = (res, message = 'Service Unavailable') => {
  return sendError(res, 503, message, 'SERVICE_UNAVAILABLE');
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
  sendCreated,
  sendNoContent,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendTooManyRequests,
  sendInternalError,
  sendServiceUnavailable
};