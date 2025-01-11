import React from "react";
import PropTypes from "prop-types";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

export function InputForm({ text, onTextChange, onSubmit, isLoading }) {
  return (
    <form onSubmit={onSubmit} className="p-8">
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
          onChange={onTextChange}
          className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all duration-200 text-base"
          placeholder="Enter your text here..."
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
  );
}

InputForm.propTypes = {
  text: PropTypes.string.isRequired,
  onTextChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
};
