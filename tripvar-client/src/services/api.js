import axios from "axios";
import logger from "../utils/logger";

// Flag to track if we're already handling token expiration
let isRefreshing = false;

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log the request
    logger.logRequest(config.method.toUpperCase(), config.url, config.data);

    // Add request timestamp for duration calculation
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    logger.error("Request error", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata.startTime;
    logger.logResponse(
      response.config.method.toUpperCase(),
      response.config.url,
      response,
      duration
    );
    // Return the full response to handle in the actions
    return response;
  },
  (error) => {
    const duration = new Date() - error.config.metadata.startTime;
    logger.error("Response error", {
      method: error.config.method.toUpperCase(),
      url: error.config.url,
      duration: `${duration}ms`,
      error: error.response?.data || error.message,
    });

    // Handle unauthorized error
    if (error.response?.status === 401) {
      // Prevent infinite loops by checking if we're already handling token expiration
      if (!isRefreshing && !window.location.pathname.includes("/login")) {
        isRefreshing = true;
        
        // Clear token from localStorage
        localStorage.removeItem("token");
        
        // Dispatch logout action to update Redux store
        // We need to import the store dynamically to avoid circular dependency
        import("../store").then(({ store }) => {
          import("../store/slices/authSlice").then(({ logout }) => {
            store.dispatch(logout());
            
            // Redirect to login page
            window.location.href = "/login";
            
            // Reset the flag after a delay to ensure all pending requests are completed
            setTimeout(() => {
              isRefreshing = false;
            }, 1000);
          }).catch((error) => {
            logger.error('Failed to import auth slice', error);
            isRefreshing = false;
          });
        }).catch((error) => {
          logger.error('Failed to import store', error);
          isRefreshing = false;
        });
      }
    }
    return Promise.reject(error);
  }
);

// Destination API
export const destinationApi = {
  getDestinations: async (params) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append("category", params.category);
    if (params?.featured) searchParams.append("featured", params.featured);

    const response = await api.get(`/destinations?${searchParams.toString()}`);
    return response.data;
  },

  getDestinationById: async (id) => {
    const response = await api.get(`/destinations/${id}`);
    return response.data;
  },
  
  searchDestinations: async (searchParams) => {
    const params = new URLSearchParams();
    
    // Add search term for title, description, and location
    if (searchParams.from) params.append("from", searchParams.from);
    if (searchParams.to) params.append("search", searchParams.to);
    if (searchParams.date) params.append("date", searchParams.date);
    if (searchParams.guests) params.append("guests", searchParams.guests);
    
    const response = await api.get(`/destinations?${params.toString()}`);
    return response.data;
  },
};

export default api;
