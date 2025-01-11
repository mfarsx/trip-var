import React, { useState } from "react";
import PropTypes from "prop-types";
import { withErrorHandling } from "../utils/error";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { logError } from "../utils/logger";
import { ApiError } from "../utils/error";

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
      const response = await fetch(
        `${import.meta.env.VITE_API_PATH}/text-generation/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(
              import.meta.env.VITE_AUTH_TOKEN_KEY
            )}`,
          },
          body: JSON.stringify({
            prompt: text.trim(),
            max_length: 100,
            temperature: 0.7,
            top_p: 0.9,
            model: import.meta.env.VITE_DEFAULT_MODEL || "gpt2",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new ApiError(
          errorData.detail || "Failed to generate text",
          response.status,
          "TEXT_GENERATION_ERROR",
          { response: errorData }
        );
      }

      const data = await response.json();
      setGeneratedText(data.generated_text);
    } catch (error) {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError(
              error.message || "Failed to generate text",
              500,
              "TEXT_GENERATION_ERROR",
              { originalError: error }
            );

      logError(apiError, "text-generator.submit", {
        text_length: text.length,
      });

      setError(apiError.message);
      setError(apiError.message);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Background decoration */}
      <div className="hidden sm:block sm:absolute sm:inset-y-0 sm:h-full sm:w-full">
        <div className="relative h-full max-w-7xl mx-auto">
          <svg
            className="absolute right-full transform translate-y-1/4 translate-x-1/4 lg:translate-x-1/2"
            width="404"
            height="784"
            fill="none"
            viewBox="0 0 404 784"
          >
            <defs>
              <pattern
                id="f210dbf6-a58d-4871-961e-36d5016a0f49"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x="0"
                  y="0"
                  width="4"
                  height="4"
                  className="text-gray-200 dark:text-gray-700"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect
              width="404"
              height="784"
              fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)"
            />
          </svg>
          <svg
            className="absolute left-full transform -translate-y-3/4 -translate-x-1/4 md:-translate-y-1/2 lg:-translate-x-1/2"
            width="404"
            height="784"
            fill="none"
            viewBox="0 0 404 784"
          >
            <defs>
              <pattern
                id="5d0dd344-b041-4d26-bec4-8d33ea57ec9b"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x="0"
                  y="0"
                  width="4"
                  height="4"
                  className="text-gray-200 dark:text-gray-700"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect
              width="404"
              height="784"
              fill="url(#5d0dd344-b041-4d26-bec4-8d33ea57ec9b)"
            />
          </svg>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            <span className="block">AI Text Generator</span>
            <span className="block text-indigo-600 dark:text-indigo-400">
              Transform Your Ideas
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Create high-quality content with our advanced AI model. Fast,
            accurate, and tailored to your needs.
          </p>

          {/* Feature Pills */}
          <div className="mt-8 flex justify-center space-x-4 animate-float">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
              🚀 Real-time Generation
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              🎯 Context-Aware
            </span>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
              🔄 Multiple Styles
            </span>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4 mb-6 animate-shake">
              <div className="text-sm text-red-700 dark:text-red-200">
                {error}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden transform transition-all hover:scale-[1.01]">
            <form onSubmit={handleSubmit} className="p-8">
              <div className="mb-6">
                <label
                  htmlFor="text-input"
                  className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Input Text
                </label>
                <textarea
                  id="text-input"
                  value={text}
                  onChange={handleTextChange}
                  className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-base"
                  placeholder="Enter your text here..."
                  disabled={loading}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600 transform transition-all duration-200 hover:scale-[1.02]"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                    "Generate Text"
                  )}
                </button>
              </div>
            </form>
          </div>

          {generatedText && (
            <div className="mt-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden transform transition-all hover:scale-[1.01]">
              <div className="p-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Generated Text
                </h2>
                <div className="prose prose-indigo dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {generatedText}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

TextGeneratorPage.propTypes = {
  error: PropTypes.string,
  onError: PropTypes.func,
  clearError: PropTypes.func,
};

export default withErrorHandling(TextGeneratorPage, "text-generator");
