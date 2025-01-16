import { useState, useCallback } from 'react';

import { AI_MODELS } from '../constants/ai';
import { aiService } from '../services/aiService';

import { useErrorHandler } from './useErrorHandler';

export function useTextGenerator() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    error,
    setError: handleError,
    clearError,
  } = useErrorHandler({
    context: 'text-generator',
    onError: (error) => {
      if (error?.type === 'validation' && error.field === 'apiKey') {
        setShowApiKeyInput(true);
      }
    },
  });
  const [selectedModel, setSelectedModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!prompt.trim()) {
        handleError({ type: 'validation', message: 'Please enter a prompt' });
        return;
      }

      setLoading(true);
      clearError();
      setResult('');

      try {
        if (!selectedModel) {
          throw new Error('Please select a model');
        }

        const model = AI_MODELS[selectedModel];
        if (model.requiresKey && !aiService.getApiKey(model.provider)) {
          if (!apiKey) {
            setShowApiKeyInput(true);
            throw new Error(`API key required for ${model.name}`);
          }
          aiService.setApiKey(model.provider, apiKey);
        }

        const response = await aiService.generateText(prompt, selectedModel);
        setResult(response);
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    },
    [prompt, selectedModel, apiKey, handleError, clearError]
  );

  const handleModelSelect = useCallback(
    (model) => {
      setSelectedModel(model);
      clearError();
    },
    [clearError]
  );

  const handleApiKeySubmit = useCallback(
    (key) => {
      setApiKey(key);
      setShowApiKeyInput(false);
      clearError();
    },
    [clearError]
  );

  return {
    prompt,
    setPrompt,
    result,
    loading,
    error,
    selectedModel,
    showApiKeyInput,
    handleSubmit,
    handleModelSelect,
    handleApiKeySubmit,
  };
}
