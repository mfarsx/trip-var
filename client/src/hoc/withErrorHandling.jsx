import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import { useErrorHandler } from '../hooks/useErrorHandler';
import { ErrorBoundaryWithFallback } from '../utils/error/errorHandler';
import { logError } from '../utils/logger';

/**
 * HOC that adds error handling capabilities to a component
 * @param {React.ComponentType} WrappedComponent - Component to wrap
 * @param {string} context - Error context identifier
 */
export function withErrorHandling(WrappedComponent, context = 'component') {
  function WithErrorHandlingComponent(props) {
    const { error, setError, clearError } = useErrorHandler({
      context,
      onError: (error) => {
        logError(`Error in ${context}:`, error);
      },
    });

    const { onError, onReset } = props;

    const handleError = useCallback(
      (error) => {
        setError(error);
        if (onError) {
          onError(error);
        }
      },
      [setError, onError]
    );

    const handleReset = useCallback(() => {
      clearError();
      if (onReset) {
        onReset();
      }
    }, [clearError, onReset]);

    return (
      <ErrorBoundaryWithFallback onRetry={handleReset} fallback={props.errorFallback}>
        <WrappedComponent {...props} error={error} onError={handleError} onReset={handleReset} />
      </ErrorBoundaryWithFallback>
    );
  }

  WithErrorHandlingComponent.propTypes = {
    onError: PropTypes.func,
    onReset: PropTypes.func,
    errorFallback: PropTypes.element,
  };

  WithErrorHandlingComponent.displayName = `withErrorHandling(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithErrorHandlingComponent;
}

export default withErrorHandling;
