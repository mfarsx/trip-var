import api from './api';

// Payment API service
export const paymentApi = {
  // Process payment for a booking
  processPayment: async (paymentData) => {
    const response = await api.post(`/payments`, paymentData);
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },

  // Process refund for a payment
  processRefund: async (paymentId, refundData) => {
    const response = await api.post(`/payments/${paymentId}/refunds`, refundData);
    return response.data;
  },

  // Get payment history for user
  getPaymentHistory: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);

    const response = await api.get(`/payments?${queryParams.toString()}`);
    return response.data;
  },

  // Create payment intent (for Stripe integration)
  createPaymentIntent: async (bookingId, amount, currency = 'USD') => {
    const response = await api.post('/payments/create-intent', {
      bookingId,
      amount,
      currency
    });
    return response.data;
  },

  // Confirm payment intent
  confirmPaymentIntent: async (paymentIntentId, paymentMethodId) => {
    const response = await api.post('/payments/confirm-intent', {
      paymentIntentId,
      paymentMethodId
    });
    return response.data;
  }
};

export default paymentApi;