import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const aiService = {
  generateText: async (prompt, options = {}) => {
    try {
      const response = await axios.post(`${API_URL}/generate`, {
        prompt,
        max_length: options.maxLength || 100,
        temperature: options.temperature || 0.7,
      });
      return response.data;
    } catch (error) {
      console.error("Error generating text:", error);
      throw error;
    }
  },
};
