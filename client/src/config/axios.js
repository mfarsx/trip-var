import axios from "axios";
import config from "../config";

const api = axios.create({
  baseURL: config.apiUrl + config.apiPath,
});

// Add auth header interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
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
    return Promise.reject(error);
  }
);

export default api;
