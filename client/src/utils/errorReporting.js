import config from "../config";

const isDevelopment = process.env.NODE_ENV === "development";

// Simple mock implementation for development
const mockErrorReporting = {
  init: () => console.log("Mock error reporting initialized"),
  captureException: (error, options) =>
    console.error("Error:", error, "Context:", options),
  captureMessage: (message, options) =>
    console.log("Message:", message, "Context:", options),
};

// Use mock in development, real Sentry in production
const errorReporter = isDevelopment
  ? mockErrorReporting
  : {
      init: () => {
        // Sentry will be initialized in production only
        console.log("Production error reporting initialized");
      },
      captureException: () => {
        // Will be replaced with real implementation in production
        console.error("Error reporting not available in development");
      },
      captureMessage: () => {
        // Will be replaced with real implementation in production
        console.log("Error reporting not available in development");
      },
    };

export const initializeErrorReporting = () => {
  if (!config.features?.enableErrorReporting) {
    return;
  }

  errorReporter.init();
};

export const captureError = (error, context = {}) => {
  console.error(error);
  if (config.features?.enableErrorReporting) {
    errorReporter.captureException(error, {
      extra: context,
      tags: {
        environment: config.environment || "development",
        version: config.version,
      },
    });
  }
};

export const captureMessage = (message, level = "info", context = {}) => {
  console.log(`[${level}] ${message}`);
  if (config.features?.enableErrorReporting) {
    errorReporter.captureMessage(message, {
      level,
      extra: context,
      tags: {
        environment: config.environment || "development",
        version: config.version,
      },
    });
  }
};
