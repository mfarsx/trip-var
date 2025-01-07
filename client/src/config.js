const config = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:8000",
  apiPath: "/api/v1",
  environment: import.meta.env.MODE,
  version: import.meta.env.VITE_APP_VERSION || "0.1.0",
  sentryDsn: import.meta.env.VITE_SENTRY_DSN,
  features: {
    enableErrorReporting:
      import.meta.env.VITE_ENABLE_ERROR_REPORTING === "true",
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
  },
  ai: {
    defaultModel: "llama-3.2-3b-instruct:2",
    apiEndpoint: import.meta.env.VITE_AI_API_URL || "http://localhost:1234/v1",
  },
};

export default config;
