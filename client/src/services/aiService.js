import { logInfo } from "../utils/logger";
import { axiosInstance as axios } from "../config/axios";
import { tryExecute } from "../utils/error/errorHandler.jsx";
import { AI_MODELS } from "../constants/ai";

class AIService {
  constructor() {
    this.baseUrl = "/api/v1/text-generation";
    logInfo("AIService initialized", "ai.init", { baseUrl: this.baseUrl });
  }

  generateText = async (prompt, systemPrompt, selectedModel = null) => {
    try {
      const model = selectedModel ? AI_MODELS[selectedModel] : AI_MODELS["phi-4"];
      const payload = {
        temperature: 0.7,
        maxTokens: 2000,
        model: model.name,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      };

      logInfo("Generating text payload:", "ai.generate.request", {
        payload,
      });

      return tryExecute(
        "generate",
        async () => {
          const { data } = await axios.post(`${this.baseUrl}/generate`, payload);
          if (!data.success)
            throw new Error(data.message || "Failed to generate text");
          logInfo("Text generated successfully", "ai.generate.response", {
            responseLength: data.data.text.length,
            status: data.status,
          });
          return data.data;
        },
        "ai.generate"
      );
    } catch (error) {
      throw new Error(error.message || "Failed to generate text");
    }
  };

  getHistory = async () =>
    tryExecute(
      "history",
      async () => {
        const { data } = await axios.get(`${this.baseUrl}/history`);
        return data;
      },
      { namespace: "ai", tags: ["history"] }
    );
}

export const aiService = new AIService();
