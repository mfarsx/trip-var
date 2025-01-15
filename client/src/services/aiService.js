import config from "../config";
import { logInfo } from "../utils/logger";
import axios from "../utils/axiosConfig";
import { asyncHandler } from "../utils/apiUtils";

class AIService {
  constructor() {
    this.baseUrl = "/api/v1/text-generation";
    logInfo("AIService initialized", "ai.init", { baseUrl: this.baseUrl });
  }

  generateText(prompt, systemPrompt = null) {
    const payload = {
      temperature: 0.7,
      max_tokens: 2000,
      model: "phi-4",
    };

    if (systemPrompt) {
      payload.messages = [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: prompt,
        },
      ];
    } else {
      payload.messages = [
        {
          role: "system",
          content:
            "You are a helpful AI assistant. Provide detailed, well-structured responses.",
        },
        {
          role: "user",
          content: prompt,
        },
      ];
    }

    return asyncHandler(
      "generate",
      async () => {
        const response = await axios.post(`${this.baseUrl}/generate`, payload);

        if (!response.data.success) {
          throw new Error(response.data.message || "Failed to generate text");
        }

        return response.data.data;
      },
      "ai"
    );
  }

  getHistory() {
    return asyncHandler(
      "history",
      () =>
        axios.get(`${this.baseUrl}/history`).then((response) => response.data),
      "ai"
    );
  }
}

export const aiService = new AIService();
