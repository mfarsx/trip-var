/**
 * Application configuration
 * Using unified .env file at the project root
 */

const getEnvVar = (key, defaultValue = "") => {
  const value = import.meta.env[key];
  if (value === undefined && defaultValue === undefined) {
    console.warn(`Environment variable ${key} is not defined`);
  }
  return value ?? defaultValue;
};

const config = {
  // API Configuration
  api: {
    url: import.meta.env.VITE_API_URL || "http://localhost:8000",
    timeout: 10000,
  },

  // App Settings
  app: {
    name: getEnvVar("VITE_APP_NAME", "TripVar"),
    version: getEnvVar("VITE_APP_VERSION", "1.0.0"),
  },

  // Authentication
  auth: {
    tokenKey: getEnvVar("VITE_AUTH_TOKEN_KEY", "tripvar_token"),
    storageKey: getEnvVar("VITE_AUTH_STORAGE_KEY", "tripvar_auth"),
  },

  // Feature Flags
  features: {
    analytics: getEnvVar("VITE_ENABLE_ANALYTICS") === "true",
    errorReporting: getEnvVar("VITE_ENABLE_ERROR_REPORTING") === "true",
  },

  // Error Reporting
  sentry: {
    dsn: getEnvVar("VITE_SENTRY_DSN"),
    enabled: getEnvVar("VITE_ENABLE_ERROR_REPORTING") === "true",
  },

  // Environment
  isDevelopment: getEnvVar("VITE_DEV_MODE") === "true",
  isProduction: import.meta.env.MODE === "production",
};

export default config;
