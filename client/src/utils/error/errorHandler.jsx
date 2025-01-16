import PropTypes from 'prop-types';
import React from 'react';

import { AUTH_ERRORS } from '../../constants/auth';
import { logError, logWarn } from '../logger';

/**
 * Base error class for application errors
 */
class AppError extends Error {
  constructor(message, type = 'generic') {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      timestamp: this.timestamp,
      ...(this.code && { code: this.code }),
      ...(this.details && { details: this.details }),
      ...(this.field && { field: this.field }),
      ...(this.status && { status: this.status }),
      ...(this.data && { data: this.data }),
    };
  }
}

/**
 * Error class for validation errors
 */
class ValidationError extends AppError {
  constructor(message, field = 'form') {
    super(message, 'validation');
    this.field = field;
  }
}

/**
 * Error class for authentication errors
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', code = AUTH_ERRORS.UNKNOWN_ERROR) {
    super(message, 'auth');
    this.name = 'AuthenticationError';
    this.message = message;
    this.code = code;
  }
}

/**
 * Error class for network errors
 */
class NetworkError extends AppError {
  constructor(message = 'Network error occurred', details = {}) {
    super(message, 'network');
    this.name = 'NetworkError';
    this.message = message;
    this.details = details;
  }
}

/**
 * Error class for API errors
 */
class ApiError extends AppError {
  constructor(message, status, data = {}) {
    super(message, 'api');
    this.name = 'ApiError';
    this.message = message;
    this.status = status;
    this.data = data;
  }
}

/**
 * Initialize error tracking (e.g., Sentry)
 */
function initializeErrorTracking() {
  // TODO: Initialize error tracking service
  logWarn('Error tracking not initialized');
}

/**
 * Error fallback component
 */
const ErrorFallback = ({ error, resetError }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Oops! Something went wrong
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{formatErrorMessage(error)}</p>
        {resetError && (
          <button
            onClick={resetError}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

ErrorFallback.propTypes = {
  error: PropTypes.object.isRequired,
  resetError: PropTypes.func,
};

/**
 * Error boundary component with fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.resetError = this.resetError.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    logError('Error caught by boundary:', error, errorInfo);
  }

  resetError() {
    this.setState({ error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  }

  render() {
    const { children } = this.props;
    const { error } = this.state;

    if (error) {
      return <ErrorFallback error={error} resetError={this.resetError} />;
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onRetry: PropTypes.func,
};

/**
 * Create error state from error object
 */
function createErrorState(error, context = 'app') {
  const errorState = {
    message: error.message || 'An unknown error occurred',
    type: error.type || 'generic',
    timestamp: error.timestamp || new Date().toISOString(),
    context,
  };

  if (error.code) errorState.code = error.code;
  if (error.field) errorState.field = error.field;
  if (error.status) errorState.status = error.status;
  if (error.data) errorState.data = error.data;
  if (error.details) errorState.details = error.details;

  return errorState;
}

/**
 * Handle error and return formatted error state
 */
function handleError(error, context = 'app') {
  logError(`Error in ${context}:`, error);
  return createErrorState(error, context);
}

/**
 * HOC to wrap component with error handling
 */
function wrapWithErrorHandler(WrappedComponent) {
  const ErrorHandlerWrapper = ({ onRetry, ...props }) => {
    return (
      <ErrorBoundary onRetry={onRetry}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  ErrorHandlerWrapper.propTypes = {
    onRetry: PropTypes.func,
  };

  return ErrorHandlerWrapper;
}

/**
 * Create error from API response
 */
function createErrorFromResponse(error) {
  if (!error.response) {
    return new NetworkError('Network error occurred', {
      isAxiosError: error.isAxiosError,
      message: error.message,
    });
  }

  const { status, data } = error.response;
  let message = data?.message || error.message || 'API request failed';

  switch (status) {
    case 400:
      return new ValidationError(message, data?.field);
    case 401:
    case 403:
      return new AuthenticationError(message, data?.code);
    case 404:
      return new ApiError('Resource not found', status, data);
    case 500:
      return new ApiError('Internal server error', status, data);
    default:
      return new ApiError(message, status, data);
  }
}

/**
 * Format error message for display
 */
function formatErrorMessage(error) {
  if (!error) return 'An unknown error occurred';

  if (error instanceof ValidationError) {
    return `Validation error: ${error.message}`;
  }

  if (error instanceof AuthenticationError) {
    return `Authentication error: ${error.message}`;
  }

  if (error instanceof NetworkError) {
    return `Network error: ${error.message}`;
  }

  if (error instanceof ApiError) {
    return `API error: ${error.message}`;
  }

  return error.message || 'An unknown error occurred';
}

/**
 * Try to execute a function and handle any errors
 */
function tryExecute(fn, context = 'app') {
  try {
    return fn();
  } catch (error) {
    return handleError(error, context);
  }
}

// Export a pre-configured error boundary for convenience
const ErrorBoundaryWithFallback = ErrorBoundary;
const ErrorFallbackWithFallback = ErrorFallback;

// Export everything as a single object
export {
  AppError,
  ValidationError,
  AuthenticationError,
  NetworkError,
  ApiError,
  ErrorBoundaryWithFallback,
  ErrorFallback,
  ErrorFallbackWithFallback,
  handleError,
  wrapWithErrorHandler,
  createErrorFromResponse,
  formatErrorMessage,
  tryExecute,
  createErrorState,
  initializeErrorTracking,
};
