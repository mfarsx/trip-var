import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { ErrorBoundary } from "../utils/error";
import { useErrorHandler } from "../hooks/useErrorHandler";

export function withErrorHandling(WrappedComponent, context) {
  function WithErrorHandlingComponent(props) {
    const { error, setError, clearError } = useErrorHandler(context);

    const handleError = useCallback(
      (error, errorInfo) => {
        setError(error);
        console.error("Error caught in HOC:", error, errorInfo);
      },
      [setError]
    );

    const handleReset = useCallback(() => {
      clearError();
      if (props.onReset) {
        props.onReset();
      }
    }, [clearError, props.onReset]);

    return (
      <ErrorBoundary onError={handleError} onReset={handleReset}>
        <WrappedComponent
          {...props}
          error={error}
          onError={setError}
          clearError={clearError}
        />
      </ErrorBoundary>
    );
  }

  WithErrorHandlingComponent.displayName = `WithErrorHandling(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  WithErrorHandlingComponent.propTypes = {
    onReset: PropTypes.func,
    ...WrappedComponent.propTypes,
  };

  return WithErrorHandlingComponent;
}

export default withErrorHandling;
