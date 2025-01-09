import config from "../config";
import { logInfo } from "../utils/logger";

class AIService {
  constructor() {
    this.baseUrl = `${config.api.url}${config.api.path}/text`;
    logInfo("AIService initialized", "ai.init", { baseUrl: this.baseUrl });
  }

  async generateText(prompt, systemPrompt = null) {
    try {
      logInfo("Generating text", "ai.generate", { prompt });

      const response = await fetch(`${this.baseUrl}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(config.auth.tokenKey)}`,
        },
        body: JSON.stringify({
          prompt,
          system_prompt: systemPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Text generation failed");
      }

      return data.text;
    } catch (error) {
      logInfo("Text generation failed", "ai.generate", {
        error: error.message,
      });
      throw error;
    }
  }

  async getHistory() {
    try {
      logInfo("Getting history", "ai.history");

      const response = await fetch(`${this.baseUrl}/history`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem(config.auth.tokenKey)}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to get history");
      }

      return data;
    } catch (error) {
      logInfo("Failed to get history", "ai.history", { error: error.message });
      throw error;
    }
  }
}

export const aiService = new AIService();
