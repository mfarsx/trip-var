import axios from "axios";
import config from "../config";
import { AuthenticationError, NetworkError, ApiError } from "./error";

const axiosInstance = axios.create({
  baseURL: `${config.api.url}/api/v1`,
  timeout: config.api.timeout,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      if (error.code === "ERR_NETWORK") {
        throw new NetworkError("Unable to connect to server");
      }
      if (error.code === "ECONNABORTED") {
        throw new NetworkError("Request timeout");
      }
      throw new NetworkError(error.message);
    }

    const status = error.response.status;
    const data = error.response.data;

    if (status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      throw new AuthenticationError(
        data?.message || "Authentication failed",
        status,
        "AUTH_ERROR",
        { originalError: error }
      );
    }

    throw new ApiError(
      data?.message || "An unexpected error occurred",
      status,
      data?.code || "API_ERROR",
      { originalError: error, response: data }
    );
  }
);

export default axiosInstance;
