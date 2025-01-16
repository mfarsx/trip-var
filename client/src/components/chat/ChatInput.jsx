import PropTypes from 'prop-types';
import React, { forwardRef } from 'react';

import { LoadingSpinner } from '../ui/LoadingSpinner';

const ChatInput = forwardRef(({ value, onChange, onSubmit, isLoading }, ref) => (
  <div className="sticky bottom-0 z-10 bg-gradient-to-b from-transparent via-[#0F172A] to-[#0F172A] pt-6 pb-8">
    <div className="max-w-5xl mx-auto px-4">
      <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/80 ring-1 ring-white/10">
        <form onSubmit={onSubmit} className="relative">
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Message AI Assistant..."
            className="w-full px-6 py-4 bg-transparent text-gray-100 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 rounded-2xl transition-shadow duration-200"
            disabled={isLoading}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            <button
              type="button"
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/90 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20"
              title="Attach file"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                />
              </svg>
            </button>
            <div className="w-px h-6 bg-gray-700" />
            <button
              type="submit"
              disabled={isLoading || !value.trim()}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/90 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:shadow-none"
              title="Send message"
            >
              {isLoading ? (
                <LoadingSpinner className="w-5 h-5" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
        </form>
        <div className="px-4 py-2.5 text-xs text-center text-gray-400 border-t border-gray-700/80">
          AI Assistant can make mistakes. Consider checking important information.
        </div>
      </div>
    </div>
  </div>
));

ChatInput.displayName = 'ChatInput';

ChatInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default ChatInput;
