import config from "../config";
import { logInfo } from "../utils/logger";
import axios from "../utils/axiosConfig";
import { asyncHandler } from "../utils/apiUtils";
import { useState } from "react";

class AIService {
  constructor() {
    this.baseUrl = `${config.api.url}${config.api.path}/text`;
    logInfo("AIService initialized", "ai.init", { baseUrl: this.baseUrl });
  }

  generateText(prompt, systemPrompt = null) {
    return asyncHandler(
      "generate",
      () =>
        axios
          .post(`${this.baseUrl}/generate`, {
            prompt,
            system_prompt: systemPrompt,
          })
          .then((response) => response.data.text),
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
