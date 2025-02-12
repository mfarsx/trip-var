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
};

export default userService;
