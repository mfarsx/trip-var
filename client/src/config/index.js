/**
 * Application configuration
 * All environment variables should be defined in .env.example
 */
const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:8000",
  apiPath: import.meta.env.VITE_API_PATH || "/api/v1",
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "30000", 10),

  // Environment & Version
  environment: import.meta.env.MODE,
  isDevelopment: import.meta.env.VITE_DEV_MODE === "true",
  version: import.meta.env.VITE_APP_VERSION || "1.0.0",

  // Error Reporting
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,

  // Feature Flags
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
    enableErrorReporting:
      import.meta.env.VITE_ENABLE_ERROR_REPORTING === "true",
  },

  // Auth Configuration
  auth: {
    tokenKey: "token",
    userDataKey: "userData",
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    githubClientId: import.meta.env.VITE_GITHUB_CLIENT_ID,
  },
};

export default config;
