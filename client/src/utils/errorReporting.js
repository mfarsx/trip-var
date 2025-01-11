import * as Sentry from "@sentry/react";
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
        if (!config.sentryDsn) {
          console.error("Sentry DSN not configured");
          return;
        }
        Sentry.init({
          dsn: config.sentryDsn,
          environment: config.environment || "production",
          release: config.version,
          tracesSampleRate: 1.0,
        });
      },
      captureException: (error, options) => {
        Sentry.captureException(error, options);
      },
      captureMessage: (message, options) => {
        Sentry.captureMessage(message, options);
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
