const { AppError, createError } = require("../utils/errors");
const { error, warn, security } = require("../utils/logger");
const config = require("../config/config");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return createError.validation(message, { field: err.path, value: err.value });
};

const handleValidationErrorDB = (err) => {
  if (!err.errors) {
    // Handle case where errors object doesn't exist
    return createError.validation(err.message || "Validation failed");
  }

  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
    value: el.value,
  }));
  const message = `Invalid input data. ${errors
    .map((e) => e.message)
    .join(". ")}`;
  return createError.validation(message, errors);
};

const handleJWTError = () =>
  createError.authentication("Invalid token. Please log in again!");

const handleJWTExpiredError = () =>
  createError.authentication("Your token has expired! Please log in again.");

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${
    field.charAt(0).toUpperCase() + field.slice(1)
  } '${value}' already exists`;
  return createError.conflict(message, { field, value });
};

const handleMongoError = (err) => {
  if (err.code === 11000) {
    return handleDuplicateFieldsDB(err);
  }
  return createError.database("Database operation failed", { code: err.code });
};

const handleRedisError = (err) => {
  return createError.serviceUnavailable("Cache service unavailable", {
    service: "redis",
    error: err.message,
  });
};

const handleRateLimitError = (err) => {
  return createError.tooManyRequests(
    "Too many requests, please try again later",
    {
      retryAfter: err.retryAfter,
      limit: err.limit,
      remaining: err.remaining,
    }
  );
};

const handleMulterError = (err) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return createError.validation("File too large", {
      maxSize: err.limit,
      receivedSize: err.size,
    });
  }
  if (err.code === "LIMIT_FILE_COUNT") {
    return createError.validation("Too many files", {
      maxFiles: err.limit,
      receivedFiles: err.files?.length,
    });
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return createError.validation("Unexpected file field", {
      field: err.field,
    });
  }
  return createError.validation("File upload error", { error: err.message });
};

const sendErrorDev = (err, res, req) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    code: err.code,
    details: err.details,
    error: {
      name: err.name,
      stack: err.stack,
    },
    requestId: req.requestId,
    timestamp: err.timestamp,
    path: req.path,
    method: req.method,
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
      timestamp: err.timestamp,
    });
  }
  // Programming or other unknown error: don't leak error details
  else {
    // Log error for debugging
    error("Unhandled error", {
      error: err.message,
      stack: err.stack,
      requestId: req.requestId,
      url: req.url,
      method: req.method,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Send generic message
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
      code: "INTERNAL_SERVER_ERROR",
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
    });
  }
};

// Global error handling middleware
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.timestamp = err.timestamp || new Date().toISOString();
  err.requestId = req.requestId || req.id || "unknown";

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    err = createError.validation("Invalid JSON format", {
      originalError: err.message,
      code: "INVALID_JSON",
    });
  }

  // Handle payload too large errors
  if (err.type === "entity.too.large") {
    err = createError.validation("Request payload too large", {
      code: "PAYLOAD_TOO_LARGE",
      limit: err.limit,
    });
  }

  // Log all errors with appropriate level
  if (err.statusCode >= 500) {
    error("Server error", {
      error: err.message,
      stack: config.server.isDevelopment ? err.stack : undefined,
      requestId: req.requestId,
      url: req.url,
      method: req.method,
      statusCode: err.statusCode,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    });

    // Alert for critical server errors
    warn("CRITICAL SERVER ERROR", {
      error: err.message,
      requestId: req.requestId,
      url: req.url,
      method: req.method,
      statusCode: err.statusCode,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });
  } else if (err.statusCode >= 400) {
    warn("Client error", {
      error: err.message,
      requestId: req.requestId,
      url: req.url,
      method: req.method,
      statusCode: err.statusCode,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
    });
  }

  // Log security-related errors
  if (err.statusCode === 401 || err.statusCode === 403) {
    warn("Authentication/Authorization error", {
      error: err.message,
      requestId: req.requestId,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
  }

  let transformedError = { ...err };
  transformedError.message = err.message;

  // Handle specific error types (both dev and prod)
  if (transformedError.name === "CastError") {
    transformedError = handleCastErrorDB(transformedError);
  }
  if (transformedError.name === "ValidationError") {
    transformedError = handleValidationErrorDB(transformedError);
  }
  if (transformedError.name === "JsonWebTokenError") {
    transformedError = handleJWTError();
  }
  if (transformedError.name === "TokenExpiredError") {
    transformedError = handleJWTExpiredError();
  }
  if (transformedError.name === "MongoError") {
    transformedError = handleMongoError(transformedError);
  }
  if (transformedError.name === "MongoServerError") {
    transformedError = handleMongoError(transformedError);
  }
  if (transformedError.name === "RedisError") {
    transformedError = handleRedisError(transformedError);
  }
  if (transformedError.name === "RateLimitError") {
    transformedError = handleRateLimitError(transformedError);
  }
  if (transformedError.name === "MulterError") {
    transformedError = handleMulterError(transformedError);
  }

  // Handle custom error codes
  if (transformedError.code === "NOT_FOUND") {
    transformedError.statusCode = 404;
    transformedError.status = "fail";
  }

  if (config.server.isDevelopment) {
    sendErrorDev(transformedError, res, req);
  } else {
    sendErrorProd(transformedError, res, req);
  }
};
