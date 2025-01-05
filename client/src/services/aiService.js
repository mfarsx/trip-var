import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const HF_API_URL = "https://api-inference.huggingface.co/models";
const DEFAULT_HF_API_KEY = import.meta.env.VITE_HF_API_KEY;

// Hugging Face için kullanılabilir modeller
export const HF_MODELS = {
  gpt2: {
    id: "gpt2",
    name: "GPT-2",
    description: "OpenAI tarafından geliştirilen GPT-2 dil modeli",
    endpoint: "gpt2",
  },
  bart: {
    id: "bart",
    name: "BART",
    description: "Facebook tarafından geliştirilen metin üretme modeli",
    endpoint: "facebook/bart-large",
  },
  t5: {
    id: "t5",
    name: "T5",
    description: "Google tarafından geliştirilen çok amaçlı dil modeli",
    endpoint: "google/t5-v1_1-base",
  },
};

// Add request timeout
const axiosInstance = axios.create({
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

class AIService {
  constructor() {
    this.hfToken = DEFAULT_HF_API_KEY || null;
  }

  setHuggingFaceToken(token) {
    this.hfToken = token || DEFAULT_HF_API_KEY;
  }

  getHuggingFaceToken() {
    return this.hfToken;
  }

  async generateText(prompt, modelId = null) {
    try {
      // Add input validation
      if (!prompt || typeof prompt !== "string") {
        throw new Error("Invalid prompt");
      }

      if (prompt.length > 1000) {
        throw new Error("Prompt too long (max 1000 characters)");
      }

      if (modelId) {
        // Hugging Face modeli kullan
        const model = HF_MODELS[modelId];
        if (!model) {
          throw new Error("Geçersiz model seçimi");
        }

        if (!this.hfToken) {
          throw new Error(
            "Hugging Face API token'ı gerekli. Lütfen .env dosyasında VITE_HF_API_KEY'i ayarlayın veya token girişi yapın."
          );
        }

        try {
          const response = await axiosInstance.post(
            `${HF_API_URL}/${model.endpoint}`,
            { inputs: prompt },
            {
              headers: {
                Authorization: `Bearer ${this.hfToken}`,
                "Content-Type": "application/json",
              },
              timeout: 60000, // Timeout süresini 60 saniyeye çıkar
            }
          );

          // Model yanıtını işle
          let generatedText = "";
          if (Array.isArray(response.data)) {
            generatedText =
              response.data[0]?.generated_text ||
              response.data[0] ||
              response.data;
          } else {
            generatedText = response.data.generated_text || response.data;
          }

          return { generated_text: generatedText };
        } catch (error) {
          console.error("Hugging Face API Error:", error);
          if (error.response?.status === 401) {
            throw new Error(
              "Geçersiz Hugging Face API token'ı. Lütfen token'ınızı kontrol edin."
            );
          }
          throw new Error(`Hugging Face API Hatası: ${error.message}`);
        }
      } else {
        // Varsayılan API'yi kullan
        try {
          const response = await axiosInstance.post(`${API_URL}/generate`, {
            prompt,
            max_length: 1024,
            temperature: 0.7,
          });
          return response.data;
        } catch (error) {
          console.error("Local API Error:", error);
          throw new Error(`API Hatası: ${error.message}`);
        }
      }
    } catch (error) {
      // Improved error handling
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(`Text generation failed: ${errorMessage}`);
    }
  }
}

export const aiService = new AIService();
