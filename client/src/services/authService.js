import axios from "../utils/axiosConfig";
import { asyncHandler } from "../utils/apiUtils";

class AuthService {
  constructor() {
    this.initializeAuth();
  }

  initializeAuth() {
    const token = this.getStoredToken();
    if (token) {
      this.setAuthHeader(token);
    }
  }

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
          if (data) {
            this._handleAuthResponse(data);
            return data;
          }
          throw new Error("Invalid response from server");
        } catch (error) {
          this._clearAuthData();
          if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail);
          }
          throw error;
        }
      },
      "auth"
    );
  }

  async login(credentials) {
    return asyncHandler(
      "login",
      async () => {
        try {
          const response = await axios.post("/api/v1/auth/login", credentials);
          const data = this._normalizeAuthResponse(response.data);
          if (data) {
            this._handleAuthResponse(data);
            return data;
          }
          throw new Error("Invalid response from server");
        } catch (error) {
          this._clearAuthData();
          if (error.response?.data?.detail) {
            throw new Error(error.response.data.detail);
          }
          throw error;
        }
      },
      "auth"
    );
  }

  async logout() {
    return asyncHandler(
      "logout",
      async () => {
        try {
          await axios.post("/api/v1/auth/logout");
        } finally {
          this._clearAuthData();
        }
      },
      "auth"
    );
  }

  async checkAuth() {
    const token = this.getStoredToken();
    if (!token) {
      return { user: null };
    }

    return asyncHandler(
      "check",
      async () => {
        try {
          const response = await axios.get("/api/v1/auth/me");
          return response.data;
        } catch (error) {
          if (
            error.response?.status === 401 &&
            error.response?.data?.detail?.includes("expired")
          ) {
            this._clearAuthData();
          }
          throw error;
        }
      },
      "auth"
    );
  }

  _normalizeAuthResponse(data) {
    if (data?.access_token) {
      return data;
    } else if (data?.token) {
      return {
        ...data,
        access_token: data.token,
      };
    }
    return null;
  }

  _handleAuthResponse(data) {
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
      this.setAuthHeader(data.access_token);
    }
  }

  _clearAuthData() {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  }

  getStoredToken() {
    return localStorage.getItem("token");
  }

  setAuthHeader(token) {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }

  isAuthenticated() {
    const token = this.getStoredToken();
    return !!token;
  }
}

export const authService = new AuthService();
