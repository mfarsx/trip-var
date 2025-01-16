/**
 * Application configuration
 * Central configuration module that combines all config sources
 */

const getEnvVar = (key, defaultValue) => {
  return import.meta.env[key] ?? defaultValue;
};

/**
 * Default configuration values
 */
const defaults = {
  api: {
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  auth: {
    tokenKey: 'auth_token',
    refreshTokenKey: 'refresh_token',
    tokenExpiry: 3600, // 1 hour
  },
  app: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es', 'fr'],
    itemsPerPage: 10,
    maxUploadSize: 5 * 1024 * 1024, // 5MB
  },
  features: {
    enableChat: true,
    enableNotifications: true,
    enableDarkMode: true,
  },
  ui: {
    theme: {
      primary: '#4F46E5',
      secondary: '#6B7280',
      success: '#10B981',
      danger: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
    },
    toast: {
      duration: 5000,
      position: 'top-right',
    },
  },
};

/**
 * Merged configuration object
 * Combines environment variables with default values
 */
const config = {
  api: {
    url: getEnvVar("VITE_API_URL", "http://localhost:8000"),
    aiUrl: getEnvVar("VITE_API_AI_URL", ""),
    ...defaults.api,
  },
  auth: {
    ...defaults.auth,
  },
  app: {
    version: getEnvVar("VITE_APP_VERSION", "1.0.0"),
    enableErrorReporting: getEnvVar("VITE_ENABLE_ERROR_REPORTING", "true") === "true",
    ...defaults.app,
  },
  features: {
    ...defaults.features,
  },
  ui: {
    ...defaults.ui,
  },
};

// Freeze configuration to prevent runtime modifications
Object.freeze(config);

export default config;
