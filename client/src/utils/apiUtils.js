import { logInfo, logError } from "./logger";

/**
 * Formats an error message from an API error response
 * @param {Error} error - The error object
 * @returns {string} Formatted error message
 */
const formatErrorMessage = (error) => {
  if (!error.response) {
    return "Network error occurred";
  }

  const { status, data } = error.response;
  const detail = data?.detail || data?.message || data?.error;

  if (typeof detail === "string") {
    return detail;
  }

  switch (status) {
    case 400:
      return "Invalid request";
    case 401:
      return "Authentication failed";
    case 403:
      return "Access denied";
    case 404:
      return "Resource not found";
    case 422:
      return "Validation error";
    default:
      return "An unexpected error occurred";
  }
};

/**
 * Handles API errors and creates a standardized error object
 * @param {Error} error - The error object
 * @returns {Error} Standardized error object
 */
export const handleApiError = (error) => {
  const message = formatErrorMessage(error);
  logError(`API Error: ${message}`, error);

  const apiError = new Error(message);
  apiError.status = error.response?.status;
  apiError.originalError = error;
  return apiError;
};

/**
 * Wraps an async function with error handling and logging
 * @param {string} operation - Name of the operation
 * @param {Function} fn - Async function to wrap
 * @param {string} [category="api"] - Logging category
 * @returns {Promise<*>} Result of the async function
 */
export const asyncHandler = async (operation, fn, category = "api") => {
  try {
    // Skip logging for auth operations as they are handled by AuthContext
    const shouldLog = !category.includes("auth");

    if (shouldLog) {
      logInfo(`Starting ${operation}`, category, {
        operation,
        timestamp: new Date().toISOString(),
      });
    }

    const result = await fn();

    if (shouldLog) {
      logInfo(`${operation} completed successfully`, category, {
        operation,
        timestamp: new Date().toISOString(),
      });
    }

    return result;
  } catch (error) {
    // Always log errors, but with appropriate context
    logError(error, category);
    throw handleApiError(error);
  }
};
