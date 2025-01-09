// Re-export error utilities
export {
  AppError,
  AuthenticationError,
  ValidationError,
  NetworkError,
  ApiError,
  initializeErrorTracking,
  handleError,
  wrapWithErrorHandler,
  ErrorBoundaryWithFallback as ErrorBoundary,
} from "./errorHandler.jsx";

// Export hooks and HOCs
export { default as useErrorHandler } from "../../hooks/useErrorHandler";
export { withErrorHandling } from "../../hoc/withErrorHandling";
