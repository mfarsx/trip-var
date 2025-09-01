const { AppError, createError } = require('../utils/errors');
const { error, warn } = require('../utils/logger');
const config = require('../config/config');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return createError.validation(message, { field: err.path, value: err.value });
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => ({
    field: el.path,
    message: el.message,
    value: el.value
  }));
  const message = `Invalid input data. ${errors.map(e => e.message).join('. ')}`;
  return createError.validation(message, errors);
};

const handleJWTError = () =>
  createError.authentication('Invalid token. Please log in again!');

const handleJWTExpiredError = () =>
  createError.authentication('Your token has expired! Please log in again.');

const handleDuplicateFieldsDB = err => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
  return createError.conflict(message, { field, value });
};

const handleMongoError = err => {
  if (err.code === 11000) {
    return handleDuplicateFieldsDB(err);
  }
  return createError.database('Database operation failed', { code: err.code });
};

const handleRedisError = err => {
  return createError.serviceUnavailable('Cache service unavailable', { 
    service: 'redis',
    error: err.message 
  });
};

const sendErrorDev = (err, res, req) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: {
      name: err.name,
      message: err.message,
      code: err.code,
      details: err.details,
      stack: err.stack
    },
    requestId: req.requestId,
    timestamp: err.timestamp,
    path: req.path,
    method: req.method
  });
};

const sendErrorProd = (err, res, req) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.code,
      details: err.details,
      requestId: req.requestId,
      timestamp: err.timestamp
    });
  } 
  // Programming or other unknown error: don't leak error details
  else {
    // Log error for debugging
    error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      requestId: req.requestId,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      body: req.body,
      query: req.query,
      params: req.params
    });

    // Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
      code: 'INTERNAL_SERVER_ERROR',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
};

// Global error handling middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log all errors with appropriate level
  if (err.statusCode >= 500) {
    error('Server error', {
      error: err.message,
      stack: config.server.isDevelopment ? err.stack : undefined,
      requestId: req.requestId,
      url: req.url,
      method: req.method,
      statusCode: err.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  } else if (err.statusCode >= 400) {
    warn('Client error', {
      error: err.message,
      requestId: req.requestId,
      url: req.url,
      method: req.method,
      statusCode: err.statusCode,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  }

  if (config.server.isDevelopment) {
    sendErrorDev(err, res, req);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.name === 'MongoError') error = handleMongoError(error);
    if (error.name === 'MongoServerError') error = handleMongoError(error);
    if (error.name === 'RedisError') error = handleRedisError(error);

    sendErrorProd(error, res, req);
  }
};
