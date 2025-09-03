import api from './api';

// Payment API service
export const paymentApi = {
  // Process payment for a booking
  processPayment: async (bookingId, paymentData) => {
    const response = await api.post(`/payments/booking/${bookingId}/process`, paymentData);
    return response.data;
  },

  // Get payment status for a booking
  getPaymentStatus: async (bookingId) => {
    const response = await api.get(`/payments/booking/${bookingId}/status`);
    return response.data;
  },

  // Process refund for a booking
  processRefund: async (bookingId, refundData) => {
    const response = await api.post(`/payments/booking/${bookingId}/refund`, refundData);
    return response.data;
  },

  // Get payment history for user
  getPaymentHistory: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);

    const response = await api.get(`/payments/history?${queryParams.toString()}`);
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