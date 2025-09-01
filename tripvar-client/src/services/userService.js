import api from "./api";

export const userService = {
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/profile");
      return response;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await api.patch("/auth/profile", userData);
      return response;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  updatePassword: async (passwordData) => {
    try {
      const response = await api.patch("/auth/update-password", passwordData);
      return response;
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  },
  
  getFavorites: async () => {
    try {
      const response = await api.get("/auth/favorites");
      return response;
    } catch (error) {
      console.error("Error fetching favorites:", error);
      throw error;
    }
  },
  
  toggleFavorite: async (destinationId) => {
    try {
      const response = await api.post(`/auth/favorites/${destinationId}`);
      return response;
    } catch (error) {
      console.error("Error toggling favorite:", error);
      throw error;
    }
  }
};

// Named exports for individual functions
export const { getCurrentUser, updateProfile, updatePassword, getFavorites, toggleFavorite } = userService;

export default userService;
