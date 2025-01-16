import React, { forwardRef } from "react";
import PropTypes from "prop-types";
import { LoadingSpinner } from "../ui/LoadingSpinner";

const ChatInput = forwardRef(({ value, onChange, onSubmit, isLoading }, ref) => (
  <div className="flex-none p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
    <form onSubmit={onSubmit} className="max-w-5xl mx-auto">
      <div className="relative flex items-center">
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder="Message AI Assistant..."
          className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm pr-20"
        />
        <div className="absolute right-2 flex items-center space-x-2">
          <button type="button" className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <button
            type="submit"
            disabled={isLoading || !value.trim()}
            className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md disabled:opacity-50"
          >
            {isLoading ? (
              <LoadingSpinner className="w-5 h-5" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div className="mt-1 text-xs text-center text-gray-500 dark:text-gray-400">
        AI Assistant can make mistakes. Consider checking important information.
      </div>
    </form>
  </div>
));

ChatInput.displayName = "ChatInput";

ChatInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default ChatInput;
