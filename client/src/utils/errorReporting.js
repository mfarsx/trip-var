import config from "../config";
import { logError, logWarning, logInfo } from "./logger";

/**
 * Redact sensitive data from objects
 */
const redactSensitiveData = (data) => {
  if (!data) return data;

  const redactKeys = config.logging?.redactKeys || [
    "password",
    "token",
    "secret",
    "key",
  ];
  const redacted = { ...data };

  const redactObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        obj[key] = redactObject({ ...obj[key] });
        continue;
      }

      if (
        redactKeys.some((redactKey) =>
          key.toLowerCase().includes(redactKey.toLowerCase())
        )
      ) {
        obj[key] = "[REDACTED]";
      }
    }
    return obj;
  };

  return redactObject(redacted);
};

/**
 * Sanitize error object for logging
 */
const sanitizeError = (error) => {
  const sanitized = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code,
    statusCode: error.statusCode,
  };

  if (error.response) {
    sanitized.response = {
      status: error.response.status,
      statusText: error.response.statusText,
      data: redactSensitiveData(error.response.data),
    };
  }

  if (error.config) {
    sanitized.request = {
      url: error.config.url,
      method: error.config.method,
      headers: redactSensitiveData(error.config.headers),
    };
  }

  return sanitized;
};

/**
 * Capture and report error with context
 */
export const captureError = (error, context = {}) => {
  const sanitizedError = sanitizeError(error);
  const sanitizedContext = redactSensitiveData(context);

  // Log locally
  logError(sanitizedError, context.source || "app");

  // Send to error reporting service if enabled
  if (config.features?.enableErrorReporting) {
    const errorReporter = window.Sentry;
    if (errorReporter) {
      errorReporter.withScope((scope) => {
        scope.setExtra("context", sanitizedContext);
        scope.setLevel(context.level || "error");
        scope.setTags({
          environment: config.environment || "development",
          version: config.version,
          source: context.source || "app",
        });
        errorReporter.captureException(sanitizedError);
      });
    }
  }
};

/**
 * Capture and report message with context
 */
export const captureMessage = (message, level = "info", context = {}) => {
  const sanitizedContext = redactSensitiveData(context);

  // Log locally
  switch (level) {
    case "error":
      logError(new Error(message), context.source || "app");
      break;
    case "warning":
      logWarning(message, context.source || "app", sanitizedContext);
      break;
    default:
      logInfo(message, context.source || "app", sanitizedContext);
  }

  // Send to error reporting service if enabled
  if (config.features?.enableErrorReporting) {
    const errorReporter = window.Sentry;
    if (errorReporter) {
      errorReporter.withScope((scope) => {
        scope.setExtra("context", sanitizedContext);
        scope.setLevel(level);
        scope.setTags({
          environment: config.environment || "development",
          version: config.version,
          source: context.source || "app",
        });
        errorReporter.captureMessage(message);
      });
    }
  }
};
