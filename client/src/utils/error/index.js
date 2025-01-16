// Error Classes
export {
  AppError,
  ValidationError,
  AuthenticationError,
  NetworkError,
  ApiError,
} from "./errorHandler.jsx";

// Error Utilities
export {
  initializeErrorTracking,
  handleError,
  wrapWithErrorHandler,
} from "./errorHandler.jsx";

// Hooks and HOCs
export { useErrorHandler } from "../../hooks/useErrorHandler";
export { withErrorHandling } from "../../hoc/withErrorHandling";
