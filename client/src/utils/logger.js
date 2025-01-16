/**
 * Logger utility for consistent logging across the application
 */

const LOG_LEVELS = {
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
};

const isDevelopment = process.env.NODE_ENV !== "production";

/**
 * Format log message with timestamp and additional data
 */
function formatLogMessage(level, message, data) {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data && { data }),
  };
}

/**
 * Format console output
 */
function formatConsoleOutput(timestamp, level, message, data) {
  return [`[${timestamp}] [${level.toUpperCase()}]`, message, data || ""].filter(Boolean);
}

/**
 * Log debug message (only in development)
 */
export function logDebug(message, data) {
  const logData = formatLogMessage(LOG_LEVELS.DEBUG, message, data);
  if (isDevelopment) {
    console.debug(...formatConsoleOutput(logData.timestamp, LOG_LEVELS.DEBUG, message, data));
  }
  return logData;
}

/**
 * Log info message
 */
export function logInfo(message, data) {
  const logData = formatLogMessage(LOG_LEVELS.INFO, message, data);
  console.info(...formatConsoleOutput(logData.timestamp, LOG_LEVELS.INFO, message, data));
  return logData;
}

/**
 * Log warning message
 */
export function logWarn(message, data) {
  const logData = formatLogMessage(LOG_LEVELS.WARN, message, data);
  console.warn(...formatConsoleOutput(logData.timestamp, LOG_LEVELS.WARN, message, data));
  return logData;
}

/**
 * Log error message with enhanced error details
 */
export function logError(message, error) {
  const errorData = {
    name: error?.name,
    message: error?.message,
    ...(isDevelopment && { stack: error?.stack }),
    ...(error?.response && {
      status: error.response.status,
      data: error.response.data,
    }),
  };

  const logData = formatLogMessage(LOG_LEVELS.ERROR, message, errorData);
  console.error(...formatConsoleOutput(logData.timestamp, LOG_LEVELS.ERROR, message, errorData));
  return logData;
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error) {
  if (!error) return "An unknown error occurred";
  if (typeof error === "string") return error;
  
  return error.response?.data?.detail || 
         error.message || 
         "An unexpected error occurred";
}
