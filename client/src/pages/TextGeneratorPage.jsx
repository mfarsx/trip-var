import React, { useState } from "react";
import PropTypes from "prop-types";
import { withErrorHandling, NetworkError } from "../utils/error";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { logError } from "../utils/logger";

export function TextGeneratorPage() {
  const [text, setText] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);
  const { error, setError, clearError } = useErrorHandler("text-generator");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please enter some text to generate from");
      return;
    }

    setLoading(true);
    clearError();

    try {
      // TODO: Replace with actual API call
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new NetworkError("Failed to generate text");
      }

      const data = await response.json();
      setGeneratedText(data.generated_text);
    } catch (error) {
      logError("Failed to generate text", "text-generator.submit", {
        error: error?.message,
        text_length: text.length,
      });
      setError(error.message || "Failed to generate text. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (error) {
      clearError();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Text Generator
      </h1>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 mb-4">
          <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="text-input"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Input Text
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={handleTextChange}
            className="w-full h-32 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter your text here..."
            disabled={loading}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </>
            ) : (
              "Generate"
            )}
          </button>
        </div>
      </form>

      {generatedText && (
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Generated Text
          </h2>
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {generatedText}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

TextGeneratorPage.propTypes = {
  error: PropTypes.string,
  onError: PropTypes.func,
  clearError: PropTypes.func,
};

export default withErrorHandling(TextGeneratorPage, "text-generator");
