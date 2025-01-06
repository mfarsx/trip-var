import { useState, useCallback } from "react";
import { aiService, AI_MODELS } from "../services/aiService";

export function useTextGenerator() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!prompt.trim()) return;

      setLoading(true);
      setError("");
      setResult("");

      try {
        if (selectedModel) {
          const model = AI_MODELS[selectedModel];
          if (model.requiresKey && !aiService.getApiKey(model.provider)) {
            throw new Error(`API key required for ${model.name}`);
          }

          if (apiKey) {
            aiService.setApiKey(model.provider, apiKey);
          }
        }

        const response = await aiService.generateText(prompt, selectedModel);
        setResult(response.generated_text);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    },
    [prompt, selectedModel, apiKey]
  );

  const handleModelChange = (e) => {
    const newModel = e.target.value;
    setSelectedModel(newModel);

    if (newModel) {
      const model = AI_MODELS[newModel];
      setSelectedProvider(model.provider);
      setShowApiKeyInput(
        model.requiresKey && !aiService.getApiKey(model.provider)
      );
    } else {
      setSelectedProvider("");
      setShowApiKeyInput(false);
    }
  };

  return {
    prompt,
    setPrompt,
    result,
    loading,
    error,
    selectedModel,
    apiKey,
    setApiKey,
    showApiKeyInput,
    selectedProvider,
    handleSubmit,
    handleModelChange,
  };
}
