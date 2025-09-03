import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentApi } from '../../services/paymentApi';
import toast from 'react-hot-toast';

// Async thunks
export const processPayment = createAsyncThunk(
  'payment/processPayment',
  async ({ bookingId, paymentData }, { rejectWithValue }) => {
    try {
      const response = await paymentApi.processPayment(bookingId, paymentData);
      toast.success('Payment processed successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to process payment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getPaymentStatus = createAsyncThunk(
  'payment/getPaymentStatus',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await paymentApi.getPaymentStatus(bookingId);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to get payment status';
      return rejectWithValue(message);
    }
  }
);

export const processRefund = createAsyncThunk(
  'payment/processRefund',
  async ({ bookingId, refundData }, { rejectWithValue }) => {
    try {
      const response = await paymentApi.processRefund(bookingId, refundData);
      toast.success('Refund processed successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to process refund';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getPaymentHistory = createAsyncThunk(
  'payment/getPaymentHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await paymentApi.getPaymentHistory(params);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch payment history';
      return rejectWithValue(message);
    }
  }
);

export const createPaymentIntent = createAsyncThunk(
  'payment/createPaymentIntent',
  async ({ bookingId, amount, currency }, { rejectWithValue }) => {
    try {
      const response = await paymentApi.createPaymentIntent(bookingId, amount, currency);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create payment intent';
      return rejectWithValue(message);
    }
  }
);

export const confirmPaymentIntent = createAsyncThunk(
  'payment/confirmPaymentIntent',
  async ({ paymentIntentId, paymentMethodId }, { rejectWithValue }) => {
    try {
      const response = await paymentApi.confirmPaymentIntent(paymentIntentId, paymentMethodId);
      toast.success('Payment confirmed successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to confirm payment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  paymentHistory: [],
  currentPayment: null,
  paymentIntent: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0
  },
  loading: false,
  error: null,
  processing: false,
  confirming: false
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    },
    clearPaymentIntent: (state) => {
      state.paymentIntent = null;
    },
    setPaymentIntent: (state, action) => {
      state.paymentIntent = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Process payment
      .addCase(processPayment.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.processing = false;
        state.currentPayment = action.payload.payment;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
      })

      // Get payment status
      .addCase(getPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload.payment;
      })
      .addCase(getPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Process refund
      .addCase(processRefund.pending, (state) => {
        state.processing = true;
        state.error = null;
      })
      .addCase(processRefund.fulfilled, (state, action) => {
        state.processing = false;
        state.currentPayment = action.payload.payment;
      })
      .addCase(processRefund.rejected, (state, action) => {
        state.processing = false;
        state.error = action.payload;
      })

      // Get payment history
      .addCase(getPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory = action.payload.payments;
        state.pagination = action.payload.pagination;
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create payment intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentIntent = action.payload.paymentIntent;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Confirm payment intent
      .addCase(confirmPaymentIntent.pending, (state) => {
        state.confirming = true;
        state.error = null;
      })
      .addCase(confirmPaymentIntent.fulfilled, (state, action) => {
        state.confirming = false;
        state.currentPayment = action.payload.payment;
        state.paymentIntent = null;
      })
      .addCase(confirmPaymentIntent.rejected, (state, action) => {
        state.confirming = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearCurrentPayment,
  clearPaymentIntent,
  setPaymentIntent
} = paymentSlice.actions;

export default paymentSlice.reducer;