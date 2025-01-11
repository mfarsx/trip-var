"use client";

import { memo } from "react";
import { AI_MODELS } from "../services/aiService";

export const ModelSelector = memo(function ModelSelector({
  selectedModel,
  onModelChange,
}) {
  return (
    <div>
      <label
        htmlFor="model"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        AI Model
      </label>
      <select
        id="model"
        name="model"
        value={selectedModel}
        onChange={onModelChange}
        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
      >
        <option value="">Select a model</option>
        {Object.entries(AI_MODELS).map(([key, model]) => (
          <option key={key} value={key}>
            {model.name} - {model.description}
          </option>
        ))}
      </select>
      {selectedModel && AI_MODELS[selectedModel]?.description && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {AI_MODELS[selectedModel].description}
        </p>
      )}
    </div>
  );
});
