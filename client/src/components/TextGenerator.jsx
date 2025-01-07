import { useState } from "react";
import axios from "axios";

export function TextGenerator() {
  const [formData, setFormData] = useState({
    prompt: "",
    maxLength: 100,
    temperature: 0.7,
    topP: 0.9,
  });
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/text/generate`,
        {
          prompt: formData.prompt,
          max_length: formData.maxLength,
          temperature: formData.temperature,
          top_p: formData.topP,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setGeneratedText(response.data.generated_text);
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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label
                htmlFor="maxLength"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Max Length
              </label>
              <input
                type="number"
                id="maxLength"
                name="maxLength"
                min="1"
                max="1000"
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                value={formData.maxLength}
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
  );
}
