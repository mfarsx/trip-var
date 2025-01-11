import { logInfo } from "./logger";
import { ApiError, NetworkError } from "./error";

/**
 * Handles API errors in a consistent way across the application
 */
export const handleApiError = (error, operation) => {
  if (error.response) {
    // Error response from backend
    throw new ApiError(
      error.response.data.detail || `${operation} failed`,
      error.response.status,
      `api.${operation}.failed`,
      { response: error.response.data }
    );
  } else if (error.request) {
    // Request was made but no response received
    throw new NetworkError(
      "Network error occurred. Please check your connection.",
      503,
      `api.${operation}.network`,
      { request: error.request }
    );
  } else {
    // Error occurred while setting up the request
    throw new ApiError(
      `An error occurred during ${operation}`,
      500,
      `api.${operation}.error`,
      { error: error.message }
    );
  }
};

/**
 * Wraps async operations with consistent error handling and logging
 */
export const asyncHandler = async (operation, fn, context = "api") => {
  try {
    logInfo(`Starting ${operation}`, `${context}.${operation}`);
    const result = await fn();
    logInfo(`Completed ${operation}`, `${context}.${operation}`);
    return result;
  } catch (error) {
    logInfo(`${operation} failed`, `${context}.${operation}`, {
      error: error.message,
    });
    handleApiError(error, operation);
  }
};
