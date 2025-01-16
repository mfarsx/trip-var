import { axiosInstance as axios } from "../config/axios";
import { tryExecute } from "../utils/error/errorHandler.jsx";
import { AuthenticationError, NetworkError } from "../utils/error";
import { getStoredToken, storeToken, removeToken, getAuthHeader, hasValidToken } from "../utils/tokenUtils";
import { AUTH_ENDPOINTS, AUTH_CONFIG } from "../constants/auth";

class AuthService {
  constructor() {
    this.initializeAuth();
    this.baseUrl = `${AUTH_CONFIG.API_URL}${AUTH_CONFIG.API_PATH}`;
  }

  initializeAuth() {
    const token = getStoredToken();
    if (token) {
      this.setAuthHeader(token);
    }
  }

  setAuthHeader(token) {
    if (token) {
      axios.defaults.headers.common["Authorization"] = getAuthHeader();
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }

  async login(credentials) {
    return tryExecute(async () => {
      try {
        const response = await axios.post(
          `${this.baseUrl}${AUTH_ENDPOINTS.LOGIN}`,
          credentials
        );
        const { access_token, user } = response.data;

        if (access_token) {
          storeToken(access_token, user);
          this.setAuthHeader(access_token);
        }

        return {
          success: true,
          data: { user, access_token },
          message: "Login successful",
        };
      } catch (error) {
        this._clearAuth();
        throw this._handleError(error);
      }
    }, "auth");
  }

  async register(userData) {
    return tryExecute(async () => {
      try {
        const response = await axios.post(
          `${this.baseUrl}${AUTH_ENDPOINTS.SIGNUP}`,
          userData
        );
        const { access_token, user } = response.data;

        if (access_token) {
          storeToken(access_token, user);
          this.setAuthHeader(access_token);
        }

        return {
          success: true,
          data: { user, access_token },
          message: "Registration successful",
        };
      } catch (error) {
        this._clearAuth();
        throw this._handleError(error);
      }
    }, "auth");
  }

  async logout() {
    return tryExecute(async () => {
      try {
        await axios.post(`${this.baseUrl}${AUTH_ENDPOINTS.LOGOUT}`);
      } finally {
        this._clearAuth();
      }
      return {
        success: true,
        message: "Logout successful",
      };
    }, "auth");
  }

  async checkAuth() {
    if (!hasValidToken()) {
      return {
        success: false,
        message: "No auth token found",
        user: null,
      };
    }

    return tryExecute(async () => {
      try {
        const response = await axios.get(`${this.baseUrl}${AUTH_ENDPOINTS.CHECK}`);
        const token = getStoredToken();
        
        // Handle the /auth/me response format
        const userData = response.data;
        
        if (!userData) {
          throw new Error("Invalid user data received from server");
        }

        return {
          success: true,
          data: {
            user: userData,
            access_token: token,
          },
          message: "Authentication valid",
        };
      } catch (error) {
        this._clearAuth();
        throw this._handleError(error);
      }
    }, "auth");
  }

  _clearAuth() {
    removeToken();
    this.setAuthHeader(null);
  }

  _handleError(error) {
    if (!error.response) {
      return new NetworkError("Network connection error");
    }

    const { status, data } = error.response;
    const message = data?.message || "An error occurred";

    switch (status) {
      case 401:
      case 403:
        return new AuthenticationError(message);
      default:
        return new Error(message);
    }
  }

  isAuthenticated() {
    return hasValidToken();
  }
}

export const authService = new AuthService();
