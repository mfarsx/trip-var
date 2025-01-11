import React from "react";

export const Feature = ({ title, description, icon }) => {
  return (
    <div className="relative">
      <div className="feature-card">
        <div className="feature-icon">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={icon}
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-base text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
};
