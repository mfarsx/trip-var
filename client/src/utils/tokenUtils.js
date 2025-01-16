/**
 * Utility functions for token management
 */

import { AUTH_STORAGE_KEYS, AUTH_CONFIG } from '../constants/auth';

/**
 * Parse JWT token without validation
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const parseToken = (token) => {
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
export const getStoredToken = () => {
  try {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    if (!token) return null;

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
export const storeToken = (token, user = null) => {
  try {
    if (!token) {
      throw new Error('Token is required');
    }

    localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, token);

    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
    }
  } catch (error) {
    console.error('Error storing token:', error);
    throw error;
  }
};

/**
 * Remove the stored authentication token and user data
 */
export const removeToken = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

/**
 * Check if a valid token exists
 * @returns {boolean} True if a valid non-expired token exists
 */
export const hasValidToken = () => {
  try {
    const token = getStoredToken();
    if (!token) return false;

    const decoded = parseToken(token);
    return decoded && !isTokenExpired(decoded);
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
};

/**
 * Get the stored user data
 * @returns {Object|null} The stored user data or null if not found
 */
export const getStoredUser = () => {
  try {
    const userData = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
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
  const token = getStoredToken();
  return token ? `${AUTH_CONFIG.TOKEN_PREFIX} ${token}` : null;
};

const TOKEN_KEY = 'auth_token';

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeTokenLocal = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const hasToken = () => {
  return Boolean(getToken());
};
