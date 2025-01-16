import PropTypes from 'prop-types';
import React from 'react';

import { LoadingSpinner } from '../ui/LoadingSpinner';

import Avatar from './Avatar';

const Message = ({ content, isUser, isLoading }) => (
  <div
    className={`group flex items-start space-x-3 px-4 ${
      isUser ? 'flex-row-reverse space-x-reverse' : ''
    }`}
  >
    <Avatar isUser={isUser} />
    <div className={`flex-1 ${isUser ? 'text-right' : ''} space-y-2 max-w-[80%]`}>
      <div
        className={`inline-block w-auto rounded-2xl px-6 py-3 shadow-lg ${
          isUser
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
            : 'bg-gray-900/70 backdrop-blur-sm text-gray-100 border border-gray-800'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center p-2">
            <LoadingSpinner className="w-5 h-5" />
          </div>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none">
            <p className="whitespace-pre-wrap m-0 text-sm leading-relaxed">{content}</p>
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isLoading && (
          <>
            <button
              className="p-1.5 hover:bg-gray-800/50 rounded-lg text-gray-400 hover:text-gray-300 transition-colors"
              title="Copy to clipboard"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              className="p-1.5 hover:bg-gray-800/50 rounded-lg text-gray-400 hover:text-gray-300 transition-colors"
              title="Regenerate response"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  </div>
);

Message.propTypes = {
  content: PropTypes.string,
  isUser: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default Message;
