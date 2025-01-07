import fetch from "cross-fetch";
import config from "../config";
import { analytics } from "../utils/analytics";
import { captureError } from "../utils/errorReporting";
import { requestCache } from "../utils/cache";

// AI Model configurations
export const AI_MODELS = {
  gpt2: {
    name: "GPT-2",
    provider: "huggingface",
    model: "gpt2",
    description: "OpenAI's GPT-2 language model",
    requiresKey: true,
  },
  mistral: {
    name: "Mistral-7B",
    provider: "mistral",
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    description: "Mistral AI's open source 7B parameter model",
    requiresKey: true,
  },
  llama2: {
    name: "Llama 2",
    provider: "meta",
    model: "meta-llama/Llama-2-70b-chat-hf",
    description: "Meta's Llama 2 70B chat model",
    requiresKey: true,
  },
  "llama-3.2-3b-instruct": {
    name: "Llama 3.2B Instruct",
    provider: "llm_studio",
    model: "llama-3.2-3b-instruct",
    description: "Local Llama 3.2B Instruct model",
    requiresKey: false,
  },
};

class AIService {
  constructor() {
    this.apiKeys = new Map();
    this.baseUrl = `${config.apiUrl}/api/v1`;
  }

  setApiKey(provider, key) {
    this.apiKeys.set(provider, key);
  }

  getApiKey(provider) {
    return this.apiKeys.get(provider);
  }

  async generateText(prompt, modelId = null) {
    const startTime = performance.now();
    try {
      const messages = [
        {
          role: "system",
          content:
            "You are a helpful AI assistant. Answer the questions clearly and concisely.",
        },
        {
          role: "user",
          content: prompt.trim(),
        },
      ];

      const response = await fetch(
        "http://localhost:1234/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelId || "llama-3.2-3b-instruct:2",
            messages: messages,
            temperature: 0.7,
            max_tokens: -1,
            stream: false,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "API request failed");
      }

      const data = await response.json();
      const result = {
        generated_text: data.choices[0].message.content,
        model: modelId || "llama-3.2-3b-instruct:2",
      };

      // Track successful generation
      analytics.trackEvent("text_generation", "success", modelId);
      analytics.trackTiming(
        "text_generation",
        "api_call",
        performance.now() - startTime
      );

      return result;
    } catch (error) {
      if (!navigator.onLine) {
        throw new Error("No internet connection");
      }
      captureError(error, { prompt, modelId });
      analytics.trackError(error);
      throw error;
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error("Health check failed");
      }
      return response.json();
    } catch (error) {
      console.error("Health check failed:", error);
      return { status: "error", error: error.message };
    }
  }
}

export const aiService = new AIService();
