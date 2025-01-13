import axios from "axios";
import config from "../config";
import { AUTH_STORAGE_KEYS, AUTH_EVENTS } from "../constants/auth";

const instance = axios.create({
  baseURL: config.api.url,
  timeout: config.api.timeout,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we have a response, it's not a network error
    if (error.response) {
      // Handle 401s for non-auth endpoints and when token is expired
      if (
        error.response.status === 401 &&
        !originalRequest._retry &&
        !originalRequest.url.includes("/auth/") &&
        error.response?.data?.detail?.includes("expired")
      ) {
        originalRequest._retry = true;

        // Clear auth data
        localStorage.removeItem(AUTH_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
        delete instance.defaults.headers.common["Authorization"];

        // Notify about auth state change
        window.dispatchEvent(
          new CustomEvent(AUTH_EVENTS.AUTH_STATE_CHANGE, {
            detail: { authenticated: false },
          })
        );
      }
      return Promise.reject(error);
    }

    // Handle timeout errors
    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("Request timeout. Please try again."));
    }

    // Handle network errors
    return Promise.reject(
      new Error("Network error occurred. Please check your connection.")
    );
  }
);

export default instance;
