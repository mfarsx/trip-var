import config from "../config";
import { logInfo } from "../utils/logger";
import {
  AuthenticationError,
  NetworkError,
  ValidationError,
  ApiError,
} from "../utils/error";
import axiosInstance from "../utils/axiosConfig";

class AuthService {
  constructor() {
    this.baseUrl = `${config.api.url}/api/v1/auth`;
  }

  async signup(userData) {
    if (!userData?.email?.trim() || !userData?.password?.trim()) {
      throw new ValidationError("Email and password are required");
    }

    try {
      const response = await axiosInstance.post(`${this.baseUrl}/register`, {
        email: userData.email.trim(),
        password: userData.password.trim(),
        full_name: userData.full_name?.trim(),
      });

      if (!response.data) {
        throw new ApiError("No response from server");
      }

      if (!response.data.access_token || !response.data.user) {
        console.error("Invalid response:", response.data);
        throw new ApiError("Invalid response format from server");
      }

      this.setAuth(response.data);
      return response.data;
    } catch (error) {
      if (!error.response) {
        throw new NetworkError(
          "Network error occurred. Please check your connection."
        );
      }

      console.error("Signup error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 409) {
        throw new ValidationError("Email already exists");
      }

      if (error.response?.status === 400) {
        const errorMessage = error.response.data.detail || "Invalid input data";
        throw new ValidationError(errorMessage);
      }

      if (error.response?.status === 422) {
        const details = error.response.data.detail;
        const errorMessage = details?.[0]?.msg || "Please provide valid data";
        throw new ValidationError(errorMessage);
      }

      if (error instanceof ValidationError) {
        throw error;
      }

      throw new ApiError(
        error.response?.data?.message ||
          "Unable to create account. Please try again later.",
        error.response?.status,
        "SIGNUP_ERROR",
        { originalError: error }
      );
    }
  }

  async checkAuth() {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/verify`);
      return response.data.user;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        // Clean up on auth errors
        this.clearAuth();
        return null;
      }
      if (error instanceof NetworkError) {
        // On network errors, preserve the session
        throw error;
      }
      // For other errors, clear auth and rethrow
      this.clearAuth();
      throw error;
    }
  }

  async login(email, password) {
    if (!email?.trim() || !password?.trim()) {
      throw new ValidationError("Email and password are required");
    }

    try {
      const response = await axiosInstance.post(`${this.baseUrl}/login`, {
        email: email.trim(),
        password: password.trim(),
      });

      if (!response.data) {
        throw new ApiError("No response from server");
      }

      if (!response.data.access_token || !response.data.user) {
        console.error("Invalid response:", response.data);
        throw new ApiError("Invalid response format from server");
      }

      this.setAuth(response.data);
      return response.data;
    } catch (error) {
      console.error("Login error:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      if (error.response?.status === 401) {
        throw new AuthenticationError("Invalid email or password");
      }

      if (error.response?.status === 400) {
        const errorMessage = error.response.data.detail || "Invalid input data";
        throw new ValidationError(errorMessage);
      }

      if (error.response?.status === 422) {
        const details = error.response.data.detail;
        const errorMessage =
          details?.[0]?.msg || "Please provide both email and password";
        throw new ValidationError(errorMessage);
      }

      if (
        error instanceof ValidationError ||
        error instanceof AuthenticationError
      ) {
        throw error;
      }

      throw new ApiError(
        "Unable to login. Please try again later.",
        error.response?.status,
        "LOGIN_ERROR",
        { originalError: error }
      );
    }
  }

  async logout() {
    try {
      await axiosInstance.post(`${this.baseUrl}/logout`);
    } finally {
      this.clearAuth();
    }
  }

  setAuth(data) {
    localStorage.setItem("auth_token", data.access_token);
    localStorage.setItem("user_data", JSON.stringify(data.user));
  }

  clearAuth() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
  }

  getToken() {
    return localStorage.getItem("auth_token");
  }

  getUser() {
    const userData = localStorage.getItem("user_data");
    return userData ? JSON.parse(userData) : null;
  }
}

export const authService = new AuthService();
