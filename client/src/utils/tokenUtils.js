/**
 * Utility functions for token management
 */

import { AUTH_STORAGE_KEYS, AUTH_CONFIG } from '../constants/auth';

const TOKEN_KEY = AUTH_STORAGE_KEYS.TOKEN;
const USER_KEY = AUTH_STORAGE_KEYS.USER;

/**
 * Parse JWT token without validation
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const parseToken = (token) => {
  // In development mode, accept mock tokens
  if (AUTH_CONFIG.DEV_MODE && token === 'mock_token') {
    return { exp: Math.floor(Date.now() / 1000) + 3600 }; // 1 hour expiry
  }

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {Object} decodedToken - Decoded JWT token
 * @returns {boolean} True if token is expired
 */
const isTokenExpired = (decodedToken) => {
  if (!decodedToken?.exp) return true;
  const currentTime = Math.floor(Date.now() / 1000);
  return decodedToken.exp < currentTime;
};

/**
 * Get the stored authentication token
 * @returns {string|null} The stored token or null if not found
 */
export const getToken = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    // In development mode, always accept mock token
    if (AUTH_CONFIG.DEV_MODE && token === 'mock_token') {
      return token;
    }

    const decoded = parseToken(token);
    if (!decoded || isTokenExpired(decoded)) {
      removeToken();
      return null;
    }

    return token;
  } catch (error) {
    console.error('Error getting stored token:', error);
    return null;
  }
};

/**
 * Store the authentication token and user data
 * @param {string} token - The token to store
 * @param {Object} user - User data to store
 */
export const setToken = (token, user = null) => {
  try {
    if (!token) {
      throw new Error('Token is required');
    }

    // Store token first
    localStorage.setItem(TOKEN_KEY, token);

    // Then store user data if provided
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch (error) {
    console.error('Error storing token:', error);
    removeToken();
  }
};

/**
 * Remove the stored authentication token and user data
 */
export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

/**
 * Check if a valid token exists
 * @returns {boolean} True if a valid non-expired token exists
 */
export const hasValidToken = () => {
  const token = getToken();
  return !!token;
};

/**
 * Get the stored user data
 * @returns {Object|null} The stored user data or null if not found
 */
export const getStoredUser = () => {
  try {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error getting stored user:', error);
    return null;
  }
};

/**
 * Get authorization header value
 * @returns {string|null} Authorization header value or null if no valid token
 */
export const getAuthHeader = () => {
  const token = getToken();
  return token ? `${AUTH_CONFIG.TOKEN_PREFIX} ${token}` : null;
};
