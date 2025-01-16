import { useState, useCallback } from 'react';
import { logError, logWarn } from '../utils/logger';
import { handleError, formatErrorMessage } from '../utils/error/errorHandler';

/**
 * @typedef {Object} ErrorState
 * @property {string} message - Error message
 * @property {string} type - Error type (validation, api, auth, network, generic)
 * @property {string} context - Context where error occurred
 * @property {string} timestamp - Error timestamp
 * @property {string} [field] - Field name for validation errors
 * @property {number} [status] - HTTP status code for API errors
 * @property {Object} [details] - Additional error details
 */

/**
 * Custom hook for handling errors across the application
 * @param {Object} options - Hook options
 * @param {string} [options.context] - Context identifier for the error
 * @param {function} [options.onError] - Callback function when error occurs
 * @param {boolean} [options.captureStack=false] - Whether to capture error stack trace
 * @returns {Object} Error handling utilities
 */
export function useErrorHandler(options = {}) {
  const { context = 'app', onError, captureStack = false } = options;
  const [error, setError] = useState(null);

  const handleErrorState = useCallback(
    (err) => {
      if (!err) {
        setError(null);
        return null;
      }

      try {
        // Create error state using centralized handler
        const errorState = handleError(err, context);

        // Set error state
        setError(errorState);

        // Call onError callback if provided
        if (onError) {
          try {
            onError(errorState);
          } catch (callbackError) {
            logWarn('Error in onError callback:', callbackError);
          }
        }

        return errorState;
      } catch (handlerError) {
        logError('Error in error handler:', handlerError);
        // Fallback error state
        const fallbackError = {
          message: 'An unexpected error occurred',
          type: 'generic',
          context,
          timestamp: new Date().toISOString(),
        };
        setError(fallbackError);
        return fallbackError;
      }
    },
    [context, onError]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getErrorMessage = useCallback(() => {
    return error ? formatErrorMessage(error) : '';
  }, [error]);

  return {
    error,
    setError: handleErrorState,
    clearError,
    getErrorMessage,
    isError: Boolean(error),
  };
}
