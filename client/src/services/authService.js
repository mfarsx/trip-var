import axios from "../utils/axiosConfig";
import { asyncHandler } from "../utils/apiUtils";

class AuthService {
  constructor() {
    // Initialize axios headers with stored token if exists
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
        const response = await axios.post("/api/v1/auth/register", {
          email,
          password,
          full_name,
        });
        this._handleAuthResponse(response.data);
        return response.data;
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
          if (response.data?.access_token) {
            this._handleAuthResponse(response.data);
            return response.data;
          } else {
            throw new Error("Invalid response from server");
          }
        } catch (error) {
          this._clearAuthData(); // Clear any existing auth data on login failure
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
        await axios.post("/api/v1/auth/logout");
        this._clearAuthData();
      },
      "auth"
    );
  }

  async checkAuth() {
    const token = this.getStoredToken();
    if (!token) {
      throw new Error("No token found");
    }

    return asyncHandler(
      "check",
      async () => {
        const response = await axios.get("/api/v1/auth/me");
        return response.data;
      },
      "auth"
    );
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
