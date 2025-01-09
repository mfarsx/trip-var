import * as Sentry from "@sentry/react";
import { logError, logWarning } from "../logger";
import config from "../../config";
import React from "react";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { ErrorFallback } from "../../components/ErrorFallback";

// Base custom error class
export class AppError extends Error {
  constructor(message, status = null, code = null, context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    this.context = context;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp,
    };
  }
}

// Specific error types
export class AuthenticationError extends AppError {
  constructor(
    message = "Authentication failed",
    status = 401,
    code = "AUTH_ERROR",
    context = {}
  ) {
    super(message, status, code, context);
  }
}

export class ValidationError extends AppError {
  constructor(
    message = "Validation failed",
    status = 400,
    code = "VALIDATION_ERROR",
    context = {}
  ) {
    super(message, status, code, context);
  }
}

export class NetworkError extends AppError {
  constructor(
    message = "Network error occurred",
    status = 503,
    code = "NETWORK_ERROR",
    context = {}
  ) {
    super(message, status, code, context);
  }
}

export class ApiError extends AppError {
  constructor(
    message = "API request failed",
    status = 500,
    code = "API_ERROR",
    context = {}
  ) {
    super(message, status, code, context);
  }
}

// Initialize error tracking
export function initializeErrorTracking() {
  if (config.sentry.enabled && config.sentry.dsn) {
    Sentry.init({
      dsn: config.sentry.dsn,
      environment: config.environment,
      release: config.app.version,
      integrations: [new Sentry.BrowserTracing()],
      tracesSampleRate: config.isDevelopment ? 1.0 : 0.2,
    });
  }
}

// Global error handler
export function handleError(error, context = null, level = "error") {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
    },
    environment: config.environment,
  };

  // Log error locally
  if (level === "error") {
    logError(error, context || "global");
  } else {
    logWarning(error.message, context || "global", { error });
  }

  // Send to Sentry in production
  if (config.sentry.enabled && !config.isDevelopment) {
    Sentry.withScope((scope) => {
      scope.setExtra("errorInfo", errorInfo);
      if (context) scope.setTag("context", context);
      if (error.code) scope.setTag("error.code", error.code);
      Sentry.captureException(error);
    });
  }

  return errorInfo;
}

// Function error wrapper
export function wrapWithErrorHandler(fn, context = null) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const handledError =
        error instanceof AppError ? error : new ApiError(error.message);
      handleError(handledError, context);
      throw handledError;
    }
  };
}

// Component error boundary with fallback
export const ErrorBoundaryWithFallback = ({ children, ...props }) => (
  <ErrorBoundary fallback={ErrorFallback} {...props}>
    {children}
  </ErrorBoundary>
);
