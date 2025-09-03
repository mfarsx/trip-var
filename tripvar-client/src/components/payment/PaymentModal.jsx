import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCreditCard, FiLock, FiCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import PropTypes from 'prop-types';
import { 
  createPaymentIntent
} from '../../store/slices/paymentSlice';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  bookingData, 
  onPaymentSuccess,
  onPaymentError 
}) => {
  const dispatch = useDispatch();
  const { paymentIntent, loading, error } = useSelector((state) => state.payments);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && bookingData) {
      // Create payment intent when modal opens
      dispatch(createPaymentIntent({
        bookingId: bookingData.bookingId,
        amount: bookingData.totalAmount,
        currency: 'USD'
      }));
    }
  }, [isOpen, bookingData, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      onPaymentError?.(error);
    }
  }, [error, onPaymentError]);

  const handleCardInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'number') {
      // Format card number with spaces
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      setCardDetails(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'expiry') {
      // Format expiry date
      const formatted = value.replace(/\D/g, '').replace(/(.{2})/, '$1/');
      setCardDetails(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'cvc') {
      // Limit CVC to 4 digits
      const formatted = value.replace(/\D/g, '').slice(0, 4);
      setCardDetails(prev => ({ ...prev, [name]: formatted }));
    } else {
      setCardDetails(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateCardDetails = () => {
    if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 16) {
      toast.error('Please enter a valid card number');
      return false;
    }
    if (!cardDetails.expiry || cardDetails.expiry.length < 5) {
      toast.error('Please enter a valid expiry date');
      return false;
    }
    if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
      toast.error('Please enter a valid CVC');
      return false;
    }
    if (!cardDetails.name.trim()) {
      toast.error('Please enter the cardholder name');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateCardDetails()) return;

    setIsProcessing(true);
    
    try {
      // In a real implementation, you would:
      // 1. Create a payment method with Stripe
      // 2. Confirm the payment intent
      // For now, we'll simulate the process
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      // Simulate successful payment
      toast.success('Payment processed successfully!');
      onPaymentSuccess?.({
        paymentIntentId: paymentIntent?.id,
        amount: bookingData.totalAmount,
        status: 'succeeded'
      });
      
      onClose();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      onPaymentError?.(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <FiCreditCard className="w-5 h-5 text-purple-400" />
              Payment Details
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Booking Summary */}
          {bookingData && (
            <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-white mb-2">Booking Summary</h3>
              <div className="space-y-1 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Destination:</span>
                  <span>{bookingData.destinationTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-in:</span>
                  <span>{new Date(bookingData.checkInDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-out:</span>
                  <span>{new Date(bookingData.checkOutDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guests:</span>
                  <span>{bookingData.numberOfGuests}</span>
                </div>
                <div className="flex justify-between font-medium text-white border-t border-gray-600 pt-2 mt-2">
                  <span>Total:</span>
                  <span>{formatAmount(bookingData.totalAmount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Payment Method
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 p-3 rounded-lg border transition-colors ${
                  paymentMethod === 'card'
                    ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                    : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <FiCreditCard className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Card</span>
              </button>
            </div>
          </div>

          {/* Card Details Form */}
          {paymentMethod === 'card' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  name="number"
                  value={cardDetails.number}
                  onChange={handleCardInputChange}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiry"
                    value={cardDetails.expiry}
                    onChange={handleCardInputChange}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    CVC
                  </label>
                  <input
                    type="text"
                    name="cvc"
                    value={cardDetails.cvc}
                    onChange={handleCardInputChange}
                    placeholder="123"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={cardDetails.name}
                  onChange={handleCardInputChange}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <FiLock className="w-4 h-4" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePayment}
              disabled={isProcessing || loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  Pay {formatAmount(bookingData?.totalAmount || 0)}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

PaymentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  bookingData: PropTypes.shape({
    bookingId: PropTypes.string.isRequired,
    destinationTitle: PropTypes.string.isRequired,
    checkInDate: PropTypes.string.isRequired,
    checkOutDate: PropTypes.string.isRequired,
    numberOfGuests: PropTypes.number.isRequired,
    totalAmount: PropTypes.number.isRequired,
  }),
  onPaymentSuccess: PropTypes.func,
  onPaymentError: PropTypes.func,
};

export default PaymentModal;