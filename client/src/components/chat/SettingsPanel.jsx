import React from "react";
import PropTypes from "prop-types";

const SettingsPanel = ({ systemMessage, onSystemMessageChange }) => (
  <div className="flex-none border-b border-gray-200 dark:border-gray-800">
    <div className="max-w-5xl mx-auto p-4">
      <div className="space-y-2">
        <label
          htmlFor="system-message"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          System Message
        </label>
        <textarea
          id="system-message"
          value={systemMessage}
          onChange={onSystemMessageChange}
          className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white text-sm"
          rows="3"
          placeholder="Customize how the AI assistant should behave..."
        />
      </div>
    </div>
  </div>
);

SettingsPanel.propTypes = {
  systemMessage: PropTypes.string.isRequired,
  onSystemMessageChange: PropTypes.func.isRequired
};

export default SettingsPanel;
