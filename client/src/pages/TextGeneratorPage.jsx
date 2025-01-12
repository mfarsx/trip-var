import React, { useState } from "react";
import PropTypes from "prop-types";
import { withErrorHandling } from "../utils/error";
import { useErrorHandler } from "../hooks/useErrorHandler";
import { logError } from "../utils/logger";
import { ApiError } from "../utils/error";
import LoadingSpinner from "../components/ui/LoadingSpinner";

export function TextGeneratorPage() {
  const [systemMessage, setSystemMessage] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { error, setError, clearError } = useErrorHandler("text-generator");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userMessage.trim()) {
      setError("Please enter a message");
      return;
    }

    setIsLoading(true);
    clearError();

    try {
      const messages = [];
      if (systemMessage.trim()) {
        messages.push({
          role: "system",
          content: systemMessage.trim(),
        });
      }
      messages.push({
        role: "user",
        content: userMessage.trim(),
      });

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
            messages,
            max_tokens: 100,
            temperature: 0.7,
            model: "phi-4",
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
      if (!data.success) {
        throw new ApiError(
          data.message || "Failed to generate text",
          response.status,
          "TEXT_GENERATION_ERROR",
          { response: data }
        );
      }
      setGeneratedText(data.data.text);
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
        system_message_length: systemMessage.length,
        user_message_length: userMessage.length,
      });

      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemMessageChange = (e) => {
    setSystemMessage(e.target.value);
    if (error) clearError();
  };

  const handleUserMessageChange = (e) => {
    setUserMessage(e.target.value);
    if (error) clearError();
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
                  htmlFor="system-message"
                  className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  System Instructions (Optional)
                </label>
                <textarea
                  id="system-message"
                  value={systemMessage}
                  onChange={handleSystemMessageChange}
                  className="w-full h-24 p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-base"
                  placeholder="Enter system instructions (e.g., 'Always answer in rhymes')"
                  disabled={isLoading}
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="user-message"
                  className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Your Message
                </label>
                <textarea
                  id="user-message"
                  value={userMessage}
                  onChange={handleUserMessageChange}
                  className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-base"
                  placeholder="Enter your message here..."
                  disabled={isLoading}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-600 transform transition-all duration-200 hover:scale-[1.02]"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="5" color="white" />
                      <span className="ml-2">Generating...</span>
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
