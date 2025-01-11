import React from "react";
import PropTypes from "prop-types";

export function GeneratedOutput({ text }) {
  if (!text) return null;

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden transform transition-all hover:scale-[1.01]">
      <div className="p-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Generated Text
        </h2>
        <div className="prose prose-indigo dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

GeneratedOutput.propTypes = {
  text: PropTypes.string,
};
