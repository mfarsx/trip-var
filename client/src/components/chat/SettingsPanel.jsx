import PropTypes from 'prop-types';
import React from 'react';

const SettingsPanel = ({ systemMessage, onSystemMessageChange }) => (
  <div className="flex-none bg-gray-900/70 backdrop-blur-sm border-b border-gray-800">
    <div className="max-w-5xl mx-auto p-4">
      <div className="bg-gray-800/50 rounded-xl shadow-lg border border-gray-700/50 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="system-message" className="block text-sm font-medium text-gray-200">
              System Message
            </label>
            <button
              type="button"
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
            >
              Reset to default
            </button>
          </div>
          <div className="relative">
            <textarea
              id="system-message"
              value={systemMessage}
              onChange={(e) => onSystemMessageChange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-gray-100 text-sm transition-colors resize-none"
              rows="3"
              placeholder="Customize how the AI assistant should behave..."
            />
            <div className="absolute bottom-3 right-3 flex items-center space-x-2">
              <span className="text-xs text-gray-500">{systemMessage.length} characters</span>
              <button
                type="button"
                className="p-1.5 text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 rounded-lg transition-colors"
                title="Clear message"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

SettingsPanel.propTypes = {
  systemMessage: PropTypes.string.isRequired,
  onSystemMessageChange: PropTypes.func.isRequired,
};

export default SettingsPanel;
