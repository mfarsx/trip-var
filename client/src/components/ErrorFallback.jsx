import React from "react";
import PropTypes from "prop-types";

export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const errorMessage = error?.message || "An unexpected error occurred";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Something went wrong
          </h2>
          <pre className="text-sm text-gray-500 dark:text-gray-400 break-words whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
            {errorMessage}
          </pre>
        </div>
        <button
          onClick={resetErrorBoundary}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-600 transition-colors duration-200"
        >
          Try again
        </button>
      </div>
    </div>
  );
};

ErrorFallback.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
  resetErrorBoundary: PropTypes.func.isRequired,
};

export default ErrorFallback;
