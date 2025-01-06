import fetch from "cross-fetch";

// AI Model configurations
export const AI_MODELS = {
  gpt2: {
    name: "GPT-2",
    provider: "huggingface",
    model: "gpt2",
    description: "OpenAI'ın GPT-2 dil modeli",
    requiresKey: true,
  },
  mistral: {
    name: "Mistral-7B",
    provider: "mistral",
    model: "mistralai/Mistral-7B-Instruct-v0.1",
    description: "Mistral AI'nin 7B parametreli açık kaynak modeli",
    requiresKey: true,
  },
  llama2: {
    name: "Llama 2",
    provider: "meta",
    model: "meta-llama/Llama-2-70b-chat-hf",
    description: "Meta'nın Llama 2 70B chat modeli",
    requiresKey: true,
  },
  "llama-3.2-3b-instruct": {
    name: "Llama 3.2B Instruct",
    provider: "llm_studio",
    model: "llama-3.2-3b-instruct",
    description: "Yerel Llama 3.2B Instruct modeli",
    requiresKey: false,
  },
};

class AIService {
  constructor() {
    this.apiKeys = new Map();
    this.baseUrl = import.meta.env.VITE_API_URL || "";
  }

  setApiKey(provider, key) {
    this.apiKeys.set(provider, key);
  }

  getApiKey(provider) {
    return this.apiKeys.get(provider);
  }

  async generateText(prompt, modelId = null) {
    try {
      console.log(
        `Sending request - Model: ${modelId}, Prompt: ${prompt.substring(
          0,
          50
        )}...`
      );

      const response = await fetch(`${this.baseUrl}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          model_id: modelId || "gpt2",
          max_tokens: 100,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("API Error:", error);
        throw new Error(error.detail || "API request failed");
      }

      const data = await response.json();
      console.log("API Response:", data);
      return data;
    } catch (error) {
      console.error("Error generating text:", error);
      throw error;
    }
  }

  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.json();
    } catch (error) {
      console.error("Health check failed:", error);
      return { status: "error", error: error.message };
    }
  }
}

export const aiService = new AIService();
