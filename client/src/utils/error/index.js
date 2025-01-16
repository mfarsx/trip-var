// Export error classes
export {
  AppError,
  ValidationError,
  AuthenticationError,
  NetworkError,
  ApiError,
} from './errorHandler.jsx';

// Export error handling utilities
export {
  initializeErrorTracking,
  handleError,
  wrapWithErrorHandler as withErrorHandling,
  ErrorBoundaryWithFallback,
  ErrorFallback,
  createErrorFromResponse,
  formatErrorMessage,
  tryExecute,
} from './errorHandler.jsx';

// Export error hooks
export { useErrorHandler } from '../../hooks/useErrorHandler';
