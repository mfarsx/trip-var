const { AppError } = require('../utils/errors');
const { error, warn } = require('../utils/logger');
const config = require('../config');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res, req) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
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
      ip: req.ip
    });

    // Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
};

// Global error handling middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log all errors
  if (err.statusCode >= 500) {
    error('Server error', {
      error: err.message,
      stack: config.server.isDevelopment ? err.stack : undefined,
      requestId: req.requestId,
      url: req.url,
      method: req.method,
      statusCode: err.statusCode
    });
  } else {
    warn('Client error', {
      error: err.message,
      requestId: req.requestId,
      url: req.url,
      method: req.method,
      statusCode: err.statusCode
    });
  }

  if (config.server.isDevelopment) {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.name === 'MongoError' && error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      error = new AppError(`Duplicate ${field}: ${error.keyValue[field]}`, 400);
    }

    sendErrorProd(error, res, req);
  }
};
