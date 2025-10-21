import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import logger from '../utils/logger';
import { setError } from '../store/slices/bookingFormSlice';

export const useErrorHandler = () => {
  const dispatch = useDispatch();
  
  const handleError = useCallback((error, context = '') => {
    let errorMessage = 'An unexpected error occurred';
    
    // Extract error message from different error formats
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    // Show user-friendly toast
    toast.error(errorMessage);
    
    // Log error for monitoring
    logger.error('Application Error', { 
      error: errorMessage, 
      context,
      stack: error.stack,
      response: error.response?.data
    });
    
    // Dispatch to global error state
    dispatch(setError({ message: errorMessage, context }));
    
    return errorMessage;
  }, [dispatch]);
  
  const handleApiError = useCallback((error, operation = '') => {
    const context = `API Error during ${operation}`;
    return handleError(error, context);
  }, [handleError]);
  
  const handleValidationError = useCallback((errors) => {
    const errorMessages = Object.values(errors);
    if (errorMessages.length > 0) {
      toast.error(errorMessages[0]); // Show first error
    }
    return errorMessages;
  }, []);
  
  const clearError = useCallback(() => {
    dispatch(setError(null));
  }, [dispatch]);
  
  return {
    handleError,
    handleApiError,
    handleValidationError,
    clearError
  };
};
