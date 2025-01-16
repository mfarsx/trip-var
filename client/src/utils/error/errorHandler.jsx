import React from 'react';
import { logError, logWarn } from '../logger';
import { AUTH_ERRORS } from '../../constants/auth';

/**
 * Base error class for application errors
 */
export class AppError extends Error {
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
export class ValidationError extends AppError {
  constructor(message, field = 'form') {
    super(message, 'validation');
    this.field = field;
  }
}

/**
 * Error class for authentication errors
 */
export class AuthenticationError extends AppError {
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
export class NetworkError extends AppError {
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
export class ApiError extends AppError {
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
export function initializeErrorTracking() {
  // Add error tracking initialization here
  window.addEventListener('error', (event) => {
    logError('Global error:', event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    logError('Unhandled promise rejection:', event.reason);
  });
}

/**
 * Error boundary component with fallback UI
 */
export class ErrorBoundaryWithFallback extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logError('React error boundary caught error:', {
      error,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
          <p className="mt-2 text-sm text-red-600">{this.state.error.message}</p>
          {this.props.onRetry && (
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                this.props.onRetry();
              }}
              className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
            >
              Try again
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Create error state from error object
 */
function createErrorState(error, context = 'app') {
  const errorState = {
    message: error.message || 'An unexpected error occurred',
    type: error.type || 'generic',
    context,
    timestamp: new Date().toISOString(),
  };

  if (error instanceof ValidationError) {
    errorState.field = error.field;
  }

  if (error instanceof ApiError) {
    errorState.status = error.status;
    errorState.data = error.data;
  }

  if (error instanceof NetworkError) {
    errorState.details = error.details;
  }

  return errorState;
}

/**
 * Handle error and return formatted error state
 */
export function handleError(error, context = 'app') {
  // Log error
  logError(`Error in ${context}:`, error);

  // Create error state
  const errorState = createErrorState(error, context);

  // Return formatted error state
  return errorState;
}

/**
 * HOC to wrap component with error handling
 */
export function wrapWithErrorHandler(WrappedComponent, context = 'app') {
  return function ErrorHandlerWrapper(props) {
    return (
      <ErrorBoundaryWithFallback
        fallback={props.errorFallback}
        onRetry={props.onRetry}
      >
        <WrappedComponent {...props} />
      </ErrorBoundaryWithFallback>
    );
  };
}

/**
 * Create error from API response
 */
export function createErrorFromResponse(error) {
  if (!error.response) {
    return new NetworkError('Network error occurred', {
      isAxiosError: error.isAxiosError,
      message: error.message,
    });
  }

  const { status, data } = error.response;
  const message = data?.message || data?.detail || 'An error occurred';

  // Log the response data to help debug
  logError('API Error Response:', {
    status,
    data,
    message,
    error
  });

  switch (status) {
    case 400:
    case 422:
      return new ValidationError(message, data?.field || 'form');
    case 401:
      return new AuthenticationError(message, AUTH_ERRORS.INVALID_CREDENTIALS);
    case 403:
      return new AuthenticationError(message, AUTH_ERRORS.UNAUTHORIZED);
    case 404:
      return new ApiError(message, status, { type: 'not_found' });
    case 409:
      return new ValidationError(message, 'email');
    default:
      return new ApiError(message, status, data);
  }
}

/**
 * Format error for display to user
 */
export function formatErrorMessage(error) {
  if (!error) return 'An unknown error occurred';

  if (typeof error === 'string') return error;

  if (error instanceof ValidationError) {
    return error.message;
  }

  if (error instanceof AuthenticationError) {
    return error.message;
  }

  if (error instanceof NetworkError) {
    return 'Network error occurred. Please check your connection and try again.';
  }

  if (error instanceof ApiError) {
    return error.message;
  }

  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }

  return error.message || 'An unexpected error occurred';
}

/**
 * Try to execute a function and handle any errors
 */
export async function tryExecute(fn, context = 'app') {
  try {
    return await fn();
  } catch (error) {
    logWarn(`Failed to execute in ${context}:`, error);
    throw error;
  }
}
