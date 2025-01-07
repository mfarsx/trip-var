import axios from "axios";
import config from "../config";

const api = axios.create({
  baseURL: `${config.apiUrl}${config.apiPath}`,
  timeout: config.apiTimeout,
  withCredentials: true,
});

// Add auth header interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(config.auth.tokenKey);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      return Promise.reject(new Error("Unable to connect to server"));
    }
    if (error.code === "ECONNABORTED") {
      return Promise.reject(new Error("Request timeout"));
    }
    if (error.response?.status === 401) {
      localStorage.removeItem(config.auth.tokenKey);
      localStorage.removeItem(config.auth.userDataKey);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
