import React, { useState } from "react";
import PropTypes from "prop-types";
import { withErrorHandling } from "../../utils/error";
import { useErrorHandler } from "../../hooks/useErrorHandler";
import { logError } from "../../utils/logger";
import { ApiError } from "../../utils/error";
import { InputForm } from "./components/InputForm";
import { GeneratedOutput } from "./components/GeneratedOutput";
import { BackgroundDecoration } from "./components/BackgroundDecoration";
import { FormError } from "../../components/ui/FormError";
import { aiService } from "../../services/aiService";

export function TextGeneratorPage() {
  const [text, setText] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { error, setError, clearError } = useErrorHandler("text-generator");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please enter some text to generate from");
      return;
    }

    setIsLoading(true);
    clearError();
    setGeneratedText("");

    try {
      const response = await aiService.generateText(text);
      setGeneratedText(response.text);
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
    } finally {
      setIsLoading(false);
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
      <BackgroundDecoration />

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
          {error && <FormError error={error} className="mb-6" />}

          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden transform transition-all hover:scale-[1.01]">
            <InputForm
              text={text}
              onTextChange={handleTextChange}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>

          <GeneratedOutput text={generatedText} />
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
