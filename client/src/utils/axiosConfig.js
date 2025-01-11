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

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Only clear token and redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("token");
        delete instance.defaults.headers.common["Authorization"];

        // Use history.pushState to avoid reload
        window.history.pushState({}, "", "/login");
        // Dispatch a custom event to notify the app of the auth change
        window.dispatchEvent(
          new CustomEvent("authStateChange", {
            detail: { authenticated: false },
          })
        );
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
