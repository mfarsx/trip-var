import { useState } from "react";
import axios from "axios";
import { ModelSelector } from "../components";

export function TextGeneratorPage() {
  const [formData, setFormData] = useState({
    prompt: "",
    temperature: 0.7,
    model: "",
  });
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.model) {
      setError("Please select an AI model");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const messages = [
        {
          role: "system",
          content:
            "You are a helpful AI assistant. Answer the questions clearly and concisely.",
        },
        {
          role: "user",
          content: formData.prompt.trim(),
        },
      ];

      const response = await axios.post(
        "http://localhost:1234/v1/chat/completions",
        {
          model: formData.model,
          messages: messages,
          temperature: formData.temperature,
          max_tokens: -1,
          stream: false,
        }
      );

      setGeneratedText(response.data.choices[0].message.content);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to generate text");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Text Generator
            </h3>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 dark:bg-red-900/50 p-4">
                <div className="text-sm text-red-700 dark:text-red-200">
                  {error}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-6">
              <ModelSelector
                selectedModel={formData.model}
                onModelChange={handleChange}
              />

              <div>
                <label
                  htmlFor="prompt"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Prompt
                </label>
                <textarea
                  id="prompt"
                  name="prompt"
                  rows={4}
                  required
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="Enter your prompt here..."
                  value={formData.prompt}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="temperature"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Temperature
                  </label>
                  <input
                    type="number"
                    id="temperature"
                    name="temperature"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    value={formData.temperature}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Generate"}
                </button>
              </div>
            </form>

            {generatedText && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Generated Text
                </h4>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {generatedText}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
