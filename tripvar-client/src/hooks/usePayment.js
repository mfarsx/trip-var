import { useSelector, useDispatch } from 'react-redux';
import { 
  processPayment,
  getPaymentStatus,
  processRefund,
  getPaymentHistory,
  createPaymentIntent,
  confirmPaymentIntent,
  clearError,
  clearCurrentPayment,
  clearPaymentIntent
} from '../store/slices/paymentSlice';

export const usePayment = () => {
  const dispatch = useDispatch();
  const {
    paymentHistory,
    currentPayment,
    paymentIntent,
    pagination,
    loading,
    error,
    processing,
    confirming
  } = useSelector((state) => state.payments);

  const handleProcessPayment = (bookingId, paymentData) => {
    return dispatch(processPayment({ bookingId, paymentData }));
  };

  const handleGetPaymentStatus = (bookingId) => {
    return dispatch(getPaymentStatus(bookingId));
  };

  const handleProcessRefund = (bookingId, refundData) => {
    return dispatch(processRefund({ bookingId, refundData }));
  };

  const handleGetPaymentHistory = (params) => {
    return dispatch(getPaymentHistory(params));
  };

  const handleCreatePaymentIntent = (bookingId, amount, currency) => {
    return dispatch(createPaymentIntent({ bookingId, amount, currency }));
  };

  const handleConfirmPaymentIntent = (paymentIntentId, paymentMethodId) => {
    return dispatch(confirmPaymentIntent({ paymentIntentId, paymentMethodId }));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const handleClearCurrentPayment = () => {
    dispatch(clearCurrentPayment());
  };

  const handleClearPaymentIntent = () => {
    dispatch(clearPaymentIntent());
  };

  return {
    // State
    paymentHistory,
    currentPayment,
    paymentIntent,
    pagination,
    loading,
    error,
    processing,
    confirming,
    
    // Actions
    processPayment: handleProcessPayment,
    getPaymentStatus: handleGetPaymentStatus,
    processRefund: handleProcessRefund,
    getPaymentHistory: handleGetPaymentHistory,
    createPaymentIntent: handleCreatePaymentIntent,
    confirmPaymentIntent: handleConfirmPaymentIntent,
    clearError: handleClearError,
    clearCurrentPayment: handleClearCurrentPayment,
    clearPaymentIntent: handleClearPaymentIntent
  };
};

export default usePayment;