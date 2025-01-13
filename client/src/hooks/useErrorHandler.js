import { useState, useCallback } from "react";
import { ValidationError } from "../utils/error";

export const useErrorHandler = (context = null) => {
  const [error, setError] = useState(null);

  const handleErrorWithContext = useCallback(
    (error) => {
      // Form validation errors
      if (error instanceof ValidationError) {
        setError({
          type: "validation",
          message: error.message,
          field: error.field,
        });
        return;
      }

      // Network or API errors
      if (error.response) {
        const message =
          error.response.data?.detail ||
          error.response.data?.message ||
          error.message;
        setError({
          type: "api",
          message: message,
          status: error.response.status,
        });
        return;
      }

      // Generic errors
      setError({
        type: "generic",
        message: error.message || "An unexpected error occurred",
      });
    },
    [context]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearFieldError = useCallback(
    (field) => {
      if (error?.type === "validation" && error.field === field) {
        clearError();
      }
    },
    [error, clearError]
  );

  return {
    error,
    setError: handleErrorWithContext,
    clearError,
    clearFieldError,
  };
};

export default useErrorHandler;
