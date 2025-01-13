/**
 * Application configuration
 * Using unified .env file at the project root
 */

/**
 * Get environment variable with fallback
 */
const getEnvVar = (key, defaultValue = "") => {
  const value = import.meta.env[key];
  if (value === undefined && defaultValue === undefined) {
    console.warn(`Environment variable ${key} is not defined`);
  }
  return value ?? defaultValue;
};

/**
 * Application configuration object
 */
const config = {
  // API Configuration
  api: {
    url: getEnvVar("VITE_API_URL", "http://localhost:8000"),
    path: getEnvVar("VITE_API_PATH", "/api/v1"),
    timeout: parseInt(getEnvVar("VITE_API_TIMEOUT", "10000")),
    retryAttempts: parseInt(getEnvVar("VITE_API_RETRY_ATTEMPTS", "3")),
    retryDelay: parseInt(getEnvVar("VITE_API_RETRY_DELAY", "1000")),
  },

  // App Settings
  app: {
    name: getEnvVar("VITE_APP_NAME", "TripVar"),
    version: getEnvVar("VITE_APP_VERSION", "1.0.0"),
    environment: getEnvVar("VITE_APP_ENV", "development"),
  },

  // Authentication
  auth: {
    tokenKey: getEnvVar("VITE_AUTH_TOKEN_KEY", "tripvar_token"),
    storageKey: getEnvVar("VITE_AUTH_STORAGE_KEY", "tripvar_auth"),
    tokenExpiry: parseInt(getEnvVar("VITE_AUTH_TOKEN_EXPIRY", "3600")), // 1 hour
    refreshTokenEnabled:
      getEnvVar("VITE_AUTH_REFRESH_ENABLED", "false") === "true",
  },

  // Feature Flags
  features: {
    analytics: getEnvVar("VITE_ENABLE_ANALYTICS") === "true",
    errorReporting: getEnvVar("VITE_ENABLE_ERROR_REPORTING") === "true",
  },

  // Logging Configuration
  logging: {
    level: getEnvVar("VITE_LOG_LEVEL", "info"),
    format: getEnvVar("VITE_LOG_FORMAT", "auto"), // auto, json, or pretty
    includeTimestamp: getEnvVar("VITE_LOG_TIMESTAMP", "true") === "true",
    service: getEnvVar("VITE_SERVICE_NAME", "client"),
    redactKeys: ["password", "token", "secret", "key"],
  },

  // Error Reporting
  sentry: {
    dsn: getEnvVar("VITE_SENTRY_DSN"),
    enabled: getEnvVar("VITE_ENABLE_ERROR_REPORTING") === "true",
    environment: getEnvVar("VITE_APP_ENV", "development"),
  },

  // Environment Helpers
  isDevelopment: getEnvVar("VITE_APP_ENV", "development") === "development",
  isProduction: getEnvVar("VITE_APP_ENV", "development") === "production",
};

// Validate required settings
const requiredSettings = [
  "api.url",
  "api.path",
  "app.name",
  "app.version",
  "auth.tokenKey",
  "auth.storageKey",
];

requiredSettings.forEach((path) => {
  const value = path.split(".").reduce((obj, key) => obj?.[key], config);
  if (value === undefined || value === "") {
    throw new Error(`Missing required configuration: ${path}`);
  }
});

export default config;
