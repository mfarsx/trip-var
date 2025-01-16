/**
 * Authentication related constants
 */

// Import environment variables
const env = import.meta.env;

export const AUTH_ERRORS = {
  // Token errors
  TOKEN_EXPIRED: 'token_expired',
  INVALID_TOKEN: 'invalid_token',

  // Network errors
  NETWORK_ERROR: 'network_error',
  SERVER_ERROR: 'server_error',

  // Validation errors
  VALIDATION_ERROR: 'validation_error',
  INVALID_CREDENTIALS: 'invalid_credentials',
  DUPLICATE_EMAIL: 'duplicate_email',

  // Operation errors
  LOGIN_FAILED: 'login_failed',
  LOGOUT_FAILED: 'logout_failed',
  SIGNUP_FAILED: 'signup_failed',

  // Response errors
  INVALID_RESPONSE: 'invalid_response',
  UNKNOWN_ERROR: 'unknown_error',
};

export const AUTH_EVENTS = {
  LOGIN: 'auth:login',
  LOGOUT: 'auth:logout',
  TOKEN_EXPIRED: 'auth:token_expired',
  AUTH_ERROR: 'auth:error',
  AUTH_STATE_CHANGE: 'auth:state_change',
};

export const AUTH_STORAGE_KEYS = {
  TOKEN: env.VITE_AUTH_TOKEN_KEY || 'tripvar_token',
  USER: env.VITE_AUTH_STORAGE_KEY || 'tripvar_auth',
  REFRESH_TOKEN: 'tripvar_refresh_token',
};

export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  CHECK: '/auth/me',
};

export const AUTH_CONFIG = {
  API_URL: env.VITE_API_URL || 'http://localhost:8000',
  API_PATH: env.VITE_API_PATH || '/api/v1',
  API_TIMEOUT: parseInt(env.VITE_API_TIMEOUT || '30000', 10),
  API_SECURE: env.VITE_API_SECURE === 'true',
  TOKEN_PREFIX: 'Bearer',
  DEV_MODE: env.VITE_DEV_MODE !== 'false', // Enable dev mode by default
  ERROR_REPORTING: env.VITE_ENABLE_ERROR_REPORTING === 'true',
};
