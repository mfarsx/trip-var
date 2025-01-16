import React from "react";
import PropTypes from "prop-types";

const Avatar = ({ isUser }) => (
  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
    isUser ? 'bg-gray-300 dark:bg-gray-600' : 'bg-indigo-600'
  }`}>
    {isUser ? (
      <svg className="h-5 w-5 text-gray-600 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM7.5 21a4.5 4.5 0 11-.001-8.999A4.5 4.5 0 017.5 21z" />
      </svg>
    )}
  </div>
);

Avatar.propTypes = {
  isUser: PropTypes.bool
};

export default Avatar;
