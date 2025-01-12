import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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

    // Only handle 401s for non-auth endpoints and when token is actually expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/") &&
      error.response?.data?.detail?.includes("expired")
    ) {
      originalRequest._retry = true;
      localStorage.removeItem("token");
      delete instance.defaults.headers.common["Authorization"];

      window.dispatchEvent(
        new CustomEvent("authStateChange", {
          detail: { authenticated: false },
        })
      );
    }

    return Promise.reject(error);
  }
);

export default instance;
