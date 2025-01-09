import { useState, useCallback } from "react";
import {
  ValidationError,
  NetworkError,
  AuthenticationError,
  handleError,
} from "../utils/error";

export const useErrorHandler = (context = null) => {
  const [error, setError] = useState(null);

  const handleErrorWithContext = useCallback(
    (error) => {
      handleError(error, context);

      let userMessage = "An unexpected error occurred";

      if (error instanceof ValidationError) {
        userMessage = error.message;
      } else if (error instanceof NetworkError) {
        userMessage =
          "Unable to connect to server. Please check your internet connection.";
      } else if (error instanceof AuthenticationError) {
        userMessage = "Authentication failed. Please try again.";
      }

      setError(userMessage);
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
