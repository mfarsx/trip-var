const config = {
  apiUrl: import.meta.env.VITE_API_URL || "/api",
  environment: import.meta.env.MODE,
  version: import.meta.env.VITE_APP_VERSION || "1.0.0",
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
    enableErrorReporting:
      import.meta.env.VITE_ENABLE_ERROR_REPORTING === "true",
  },
};

export default config;
