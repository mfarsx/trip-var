import axios from "../utils/axiosConfig";
import { asyncHandler } from "../utils/apiUtils";
import { AUTH_STORAGE_KEYS, AUTH_ERRORS } from "../constants/auth";
import { AuthenticationError, NetworkError } from "../utils/error";

class AuthService {
  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state
   * @private
   */
  initializeAuth() {
    const token = this.getStoredToken();
    if (token && this._isTokenValid(token)) {
      this.setAuthHeader(token);
    } else {
      this._clearAuthData();
    }
  }

  /**
   * Check if a token is valid (not expired)
   * @private
   * @param {string} token - JWT token to validate
   * @returns {boolean} Whether token is valid
   */
  _isTokenValid(token) {
    try {
      if (!token || typeof token !== "string") {
        console.debug("Invalid token format:", token);
        return false;
      }

      const parts = token.split(".");
      if (parts.length !== 3) {
        console.debug("Token does not have three parts");
        return false;
      }

      const [, payload] = parts;
      if (!payload) {
        console.debug("Token has no payload");
        return false;
      }

      const decodedPayload = JSON.parse(atob(payload));
      if (!decodedPayload.exp) {
        console.debug("Token has no expiration");
        return false;
      }

      const isValid = decodedPayload.exp * 1000 > Date.now();
      if (!isValid) {
        console.debug("Token has expired");
      }
      return isValid;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }

  /**
   * Sign up a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Response with user and token
   */
  async signup(userData) {
    const { email, password, full_name } = userData;
    return asyncHandler(
      "register",
      async () => {
        try {
          const response = await axios.post("/api/v1/auth/register", {
            email,
            password,
            full_name,
          });

          const data = this._normalizeAuthResponse(response.data);
          if (data?.access_token && data?.user) {
            this._handleAuthResponse(data);
            return data;
          }
          throw new Error("Invalid response format");
        } catch (error) {
          this._clearAuthData();
          throw this._normalizeError(error);
        }
      },
      "auth"
    );
  }

  /**
   * Log in an existing user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} Response with user and token
   */
  async login(credentials) {
    return asyncHandler(
      "login",
      async () => {
        try {
          const response = await axios.post("/api/v1/auth/login", credentials);
          const data = this._normalizeAuthResponse(response.data);
          if (data?.access_token && data?.user) {
            this._handleAuthResponse(data);
            return data;
          }
          throw new Error("Invalid response format");
        } catch (error) {
          this._clearAuthData();
          throw this._normalizeError(error);
        }
      },
      "auth"
    );
  }

  /**
   * Log out the current user
   * @returns {Promise<void>}
   */
  async logout() {
    return asyncHandler(
      "logout",
      async () => {
        try {
          const token = this.getStoredToken();
          if (token) {
            await axios.post("/api/v1/auth/logout");
          }
        } finally {
          this._clearAuthData();
        }
      },
      "auth"
    );
  }

  /**
   * Check authentication status
   * @returns {Promise<Object>} Response with user data
   */
  async checkAuth() {
    const token = this.getStoredToken();

    // If no token or invalid token, return early
    if (!token || !this._isTokenValid(token)) {
      this._clearAuthData();
      return { user: null };
    }

    return asyncHandler(
      "check",
      async () => {
        try {
          // Ensure token is set for this request
          this.setAuthHeader(token);

          const response = await axios.get("/api/v1/auth/me");

          // Log the response for debugging
          console.debug("Auth check response:", response.data);

          // More detailed response validation
          if (!response.data) {
            throw new Error("Empty response received");
          }

          const userData = response.data.user || response.data;

          if (!userData || !userData.id) {
            console.error("Invalid user data format:", userData);
            throw new Error("Invalid user data format in response");
          }

          return {
            user: userData,
            token,
          };
        } catch (error) {
          // Log the original error
          console.error("Auth check error:", error.response || error);

          // Clear auth data for auth-related errors
          if (
            error.response?.status === 401 ||
            error.response?.data?.detail?.includes("expired") ||
            error.message.includes("Invalid")
          ) {
            this._clearAuthData();
          }

          // Rethrow with more context
          throw this._normalizeError(error);
        }
      },
      "auth"
    );
  }

  /**
   * Normalize API response to consistent format
   * @private
   * @param {Object} data - Response data to normalize
   * @returns {Object|null} Normalized response data
   */
  _normalizeAuthResponse(data) {
    if (!data) return null;

    // Handle different token formats
    const token = data.access_token || data.token;
    if (!token) return null;

    // Skip token validation for registration response
    if (data.user) {
      return {
        user: data.user,
        access_token: token,
      };
    }

    // Validate token format for other responses
    if (!this._isTokenValid(token)) {
      return null;
    }

    return {
      user: data.user,
      access_token: token,
    };
  }

  /**
   * Handle successful auth response
   * @private
   * @param {Object} data - Auth response data
   */
  _handleAuthResponse(data) {
    if (data?.access_token) {
      // Store the token
      localStorage.setItem(AUTH_STORAGE_KEYS.TOKEN, data.access_token);

      // Set the auth header
      this.setAuthHeader(data.access_token);

      // Store user data
      if (data.user) {
        localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(data.user));
      }
    }
  }

  /**
   * Clear all auth-related data
   * @private
   */
  _clearAuthData() {
    localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
    delete axios.defaults.headers.common["Authorization"];
  }

  /**
   * Get stored auth token
   * @returns {string|null} Stored token
   */
  getStoredToken() {
    return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  }

  /**
   * Set auth header with token
   * @param {string} token - Token to set in header
   */
  setAuthHeader(token) {
    if (token && this._isTokenValid(token)) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = this.getStoredToken();
    return token ? this._isTokenValid(token) : false;
  }

  /**
   * Normalize error response
   * @private
   * @param {Error} error - Error to normalize
   * @returns {Error} Normalized error
   */
  _normalizeError(error) {
    // Handle API error responses
    if (error.response?.data) {
      const errorData = error.response.data;
      const message =
        errorData.detail ||
        errorData.message ||
        errorData.error ||
        "An unexpected error occurred";
      const status = error.response.status;

      // Handle specific error types
      if (status === 401) {
        return new AuthenticationError(message, status);
      }

      return new Error(message);
    }

    // Handle network errors
    if (!error.response) {
      return new NetworkError(
        "Network error occurred. Please check your connection."
      );
    }

    // Return original error if no specific handling
    return error;
  }
}

export const authService = new AuthService();
