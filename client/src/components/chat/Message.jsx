import React from "react";
import PropTypes from "prop-types";
import Avatar from "./Avatar";
import { LoadingSpinner } from "../ui/LoadingSpinner";

const Message = ({ content, isUser, isLoading }) => (
  <div className={`group flex items-start space-x-3 px-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
    <Avatar isUser={isUser} />
    <div className={`flex-1 ${isUser ? 'text-right' : ''} space-y-2`}>
      <div className={`inline-block max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
        isUser
          ? 'bg-indigo-600 text-white'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
      }`}>
        {isLoading ? (
          <LoadingSpinner className="w-5 h-5" />
        ) : (
          <p className="whitespace-pre-wrap">{content}</p>
        )}
      </div>
      <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

Message.propTypes = {
  content: PropTypes.string,
  isUser: PropTypes.bool,
  isLoading: PropTypes.bool
};

export default Message;
