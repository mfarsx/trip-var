/**
 * Authentication related constants
 */

export const AUTH_ERRORS = {
  EXPIRED_TOKEN: "expired_token",
  INVALID_TOKEN: "invalid_token",
  NETWORK_ERROR: "network_error",
  UNKNOWN_ERROR: "unknown_error",
  DUPLICATE_EMAIL: "duplicate_email",
  INVALID_CREDENTIALS: "invalid_credentials",
  LOGIN_FAILED: "login_failed",
  LOGOUT_FAILED: "logout_failed",
  SIGNUP_FAILED: "signup_failed",
};

export const AUTH_EVENTS = {
  STORAGE: "storage",
  AUTH_STATE_CHANGE: "authStateChange",
};

export const AUTH_STORAGE_KEYS = {
  TOKEN: "tripvar_token",
  USER: "tripvar_auth",
};

export const AUTH_ENDPOINTS = {
  LOGIN: "/api/v1/auth/login",
  SIGNUP: "/api/v1/auth/register",
  LOGOUT: "/api/v1/auth/logout",
  CHECK_AUTH: "/api/v1/auth/me",
};
