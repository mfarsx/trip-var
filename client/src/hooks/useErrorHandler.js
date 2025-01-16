import { useCallback, useState } from 'react';

import { logError } from '../utils/logger';

/**
 * Custom hook for handling errors across the application
 * @returns {Object} Error handling utilities
 */
export function useErrorHandler() {
  const [error, setError] = useState(null);

  const handleErrorState = useCallback(async (err) => {
    try {
      logError('Error occurred:', err);
      setError(err);
    } catch (handlingError) {
      console.error('Error while handling error:', handlingError);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    setError: handleErrorState,
    clearError,
  };
}
