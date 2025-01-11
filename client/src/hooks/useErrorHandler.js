import { useState, useCallback } from "react";
import { ValidationError } from "../utils/error";

export const useErrorHandler = (context = null) => {
  const [error, setError] = useState(null);

  const handleErrorWithContext = useCallback(
    (error) => {
      // Form validasyon hataları için özel mesaj
      if (error instanceof ValidationError) {
        setError(error.message);
        return;
      }

      // Backend'den gelen hata mesajını kullan
      setError(error.message);
    },
    [context]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    setError: handleErrorWithContext,
    clearError,
  };
};

export default useErrorHandler;
