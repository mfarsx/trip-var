import axios from "axios";
import config from "./index";
import { logError } from "../utils/logger";
import { 
  ValidationError, 
  AuthenticationError, 
  NetworkError, 
  ApiError 
} from "../utils/error/errorHandler";
import { createErrorFromResponse } from "../utils/error/errorHandler";
import { AUTH_ERRORS } from "../constants/auth";

const API_CONFIG = {
  baseURL: config.api.url + config.api.path,
  timeout: config.api.timeout,
  secure: config.api.secure,
  changeOrigin: config.api.changeOrigin,
};

/**
 * Default axios configuration
 */
const defaultConfig = {
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
  secure: API_CONFIG.secure,
  changeOrigin: API_CONFIG.changeOrigin,
};

/**
 * Handles API error responses
 * @param {Error} error - The error object from axios
 * @returns {Error} Standardized error object
 */
const handleApiError = (error) => {
  let customError;

  // Handle network errors
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      customError = new NetworkError(
        `Request timed out after ${API_CONFIG.timeout / 1000} seconds`,
        { code: AUTH_ERRORS.NETWORK_ERROR }
      );
    } else {
      customError = new NetworkError(
        "Network error. Please check your connection",
        { code: AUTH_ERRORS.NETWORK_ERROR }
      );
    }
  } else {
    // Convert axios error to our custom error type
    customError = createErrorFromResponse(error);
  }

  // Handle authentication errors
  if (customError instanceof AuthenticationError) {
    // Clear auth data
    localStorage.removeItem(config.auth.tokenKey);
    localStorage.removeItem(config.auth.storageKey);
    
    // Dispatch authentication error event
    window.dispatchEvent(new CustomEvent("auth:error", { 
      detail: {
        type: "auth",
        message: customError.message,
        code: customError.code
      }
    }));
  }

  // Log error if enabled
  if (config.features.enableErrorReporting) {
    logError(customError.message, {
      error: customError,
      originalError: error,
      context: {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status
      }
    });
  }

  return customError;
};

/**
 * Create and configure axios instance
 * @param {Object} customConfig - Custom axios configuration
 * @returns {AxiosInstance} Configured axios instance
 */
const createAxiosInstance = (customConfig = {}) => {
  const instance = axios.create({
    ...defaultConfig,
    ...customConfig,
  });

  // Request interceptor
  instance.interceptors.request.use(
    (reqConfig) => {
      // Add auth token if available
      const token = localStorage.getItem(config.auth.tokenKey);
      if (token) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
      return reqConfig;
    },
    (error) => {
      return Promise.reject(handleApiError(error));
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      return Promise.reject(handleApiError(error));
    }
  );

  return instance;
};

// Export configured instance
export const axiosInstance = createAxiosInstance();
