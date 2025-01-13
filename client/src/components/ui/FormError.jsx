import React from "react";
import PropTypes from "prop-types";

export const FormError = ({ error, className = "" }) => {
  if (!error) return null;

  const getErrorStyle = () => {
    switch (error.type) {
      case "validation":
        return "bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200";
      case "api":
        return "bg-orange-50 dark:bg-orange-900/50 text-orange-700 dark:text-orange-200";
      default:
        return "bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200";
    }
  };

  return (
    <div
      className={`rounded-md p-3 animate-shake ${getErrorStyle()} ${className}`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {/* Error Icon */}
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm">{error.message}</p>
        </div>
      </div>
    </div>
  );
};

FormError.propTypes = {
  error: PropTypes.shape({
    type: PropTypes.oneOf(["validation", "api", "generic"]),
    message: PropTypes.string.isRequired,
    field: PropTypes.string,
    status: PropTypes.number,
  }),
  className: PropTypes.string,
};

export default FormError;
