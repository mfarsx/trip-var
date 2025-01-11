export const env = {
  API_URL: import.meta.env.VITE_API_URL,
  AI_API_URL: import.meta.env.VITE_AI_API_URL,
  APP_VERSION: import.meta.env.VITE_APP_VERSION,
  ENABLE_ERROR_REPORTING:
    import.meta.env.VITE_ENABLE_ERROR_REPORTING === "true",
};

// Validate required env vars
Object.entries(env).forEach(([key, value]) => {
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});
