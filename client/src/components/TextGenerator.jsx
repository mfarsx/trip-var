import { useState, useEffect, useCallback } from "react";
import { aiService, AI_MODELS } from "../services/aiService";

export function TextGenerator() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");

  // Örnek promptlar
  const examplePrompts = [
    {
      title: "Quantum Physics Explanation",
      text: "How would you explain quantum physics to a 5-year-old?",
    },
    {
      title: "AI Training",
      text: "How are AI models trained? Explain step by step.",
    },
  ];

  useEffect(() => {
    // Check for default API keys
    const defaultHfToken = import.meta.env.VITE_HF_API_KEY;
    if (defaultHfToken) {
      aiService.setApiKey("huggingface", defaultHfToken);
    }

    const defaultOpenAIKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (defaultOpenAIKey) {
      aiService.setApiKey("openai", defaultOpenAIKey);
    }

    const defaultAnthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (defaultAnthropicKey) {
      aiService.setApiKey("anthropic", defaultAnthropicKey);
    }

    const defaultGoogleKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (defaultGoogleKey) {
      aiService.setApiKey("google", defaultGoogleKey);
    }
  }, []);

  // Memoize form submission handler
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-purple-900/20 p-6 transition-all duration-300 hover:shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              AI Model
            </label>
            <select
              value={selectedModel}
              onChange={handleModelChange}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:text-white transition-colors cursor-pointer"
            >
              <option value="">Default Model</option>
              {Object.entries(AI_MODELS).map(([id, model]) => (
                <option key={id} value={id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>

          {showApiKeyInput && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                {selectedProvider.charAt(0).toUpperCase() +
                  selectedProvider.slice(1)}{" "}
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`${selectedProvider}_xxx...`}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:text-white transition-colors"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                You can store the API key in the .env file: VITE_
                {selectedProvider.toUpperCase()}_API_KEY
              </p>
            </div>
          )}
        </div>

        {selectedModel && (
          <div className="bg-violet-50 dark:bg-violet-900/20 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-violet-800 dark:text-violet-300 mb-2">
              {AI_MODELS[selectedModel].name}
            </h4>
            <p className="text-sm text-violet-600 dark:text-violet-400">
              {AI_MODELS[selectedModel].description}
            </p>
          </div>
        )}

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter a prompt to generate text..."
            rows={4}
            className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors dark:text-white resize-none"
            disabled={loading}
            spellCheck="false"
            autoComplete="off"
          />
          <div className="absolute bottom-3 right-3 text-sm text-gray-400 dark:text-gray-500">
            {prompt.length} characters
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !prompt}
          className={`w-full py-3 px-6 rounded-lg font-medium text-white transition-all duration-200
            ${
              loading
                ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transform hover:-translate-y-0.5 dark:from-violet-500 dark:to-purple-500 dark:hover:from-violet-600 dark:hover:to-purple-600"
            }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
              <span>Generating...</span>
            </div>
          ) : (
            "Generate Text"
          )}
        </button>

        {/* Example Prompts */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Example Prompts:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPrompt(example.text)}
                className="text-left p-2 text-sm bg-violet-50 dark:bg-violet-900/20 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors"
              >
                <span className="font-medium text-violet-700 dark:text-violet-300">
                  {example.title}
                </span>
                <p className="text-violet-600 dark:text-violet-400 mt-1 line-clamp-2">
                  {example.text}
                </p>
              </button>
            ))}
          </div>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-red-500 dark:text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="mt-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Generated Text:
          </h3>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
              {result}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
