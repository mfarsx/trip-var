import React from 'react';
import PropTypes from 'prop-types';

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="mx-4 rounded-lg bg-red-50 dark:bg-red-900/50 p-4 animate-shake">
      <div className="text-sm text-red-700 dark:text-red-200">
        {message}
      </div>
    </div>
  );
};

ErrorMessage.propTypes = {
  message: PropTypes.string
};

export default ErrorMessage;
