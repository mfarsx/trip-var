import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  formData: {
    startDate: '',
    endDate: '',
    guests: 1,
    paymentMethod: 'credit-card',
    agreeTerms: false
  },
  validation: {},
  availability: null,
  isCheckingAvailability: false,
  availabilityChecked: false,
  pricingPreview: null,
  isQuickBooking: false,
  bookingSuccess: false,
  loading: false,
  error: null
};

export const bookingFormSlice = createSlice({
  name: "bookingForm",
  initialState,
  reducers: {
    // Form data management
    updateFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
      state.error = null;
    },
    
    resetFormData: (state) => {
      state.formData = initialState.formData;
      state.validation = {};
      state.availability = null;
      state.availabilityChecked = false;
      state.pricingPreview = null;
      state.error = null;
    },
    
    // Validation management
    setValidation: (state, action) => {
      state.validation = action.payload;
    },
    
    clearFieldError: (state, action) => {
      const field = action.payload;
      if (state.validation[field]) {
        delete state.validation[field];
      }
    },
    
    clearAllValidation: (state) => {
      state.validation = {};
    },
    
    // Availability management
    setAvailability: (state, action) => {
      state.availability = action.payload;
      state.availabilityChecked = true;
      state.isCheckingAvailability = false;
    },
    
    setCheckingAvailability: (state, action) => {
      state.isCheckingAvailability = action.payload;
      if (action.payload) {
        state.availabilityChecked = false;
      }
    },
    
    clearAvailability: (state) => {
      state.availability = null;
      state.availabilityChecked = false;
      state.isCheckingAvailability = false;
    },
    
    // Pricing preview
    setPricingPreview: (state, action) => {
      state.pricingPreview = action.payload;
    },
    
    clearPricingPreview: (state) => {
      state.pricingPreview = null;
    },
    
    // Quick booking
    setQuickBooking: (state, action) => {
      state.isQuickBooking = action.payload;
      if (action.payload) {
        // Pre-fill default dates for quick booking
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        
        state.formData = {
          ...state.formData,
          startDate: tomorrow.toISOString().split('T')[0],
          endDate: dayAfterTomorrow.toISOString().split('T')[0],
          guests: 2
        };
      }
    },
    
    // Booking success
    setBookingSuccess: (state, action) => {
      state.bookingSuccess = action.payload;
    },
    
    // Loading states
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    // Error handling
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  updateFormData,
  resetFormData,
  setValidation,
  clearFieldError,
  clearAllValidation,
  setAvailability,
  setCheckingAvailability,
  clearAvailability,
  setPricingPreview,
  clearPricingPreview,
  setQuickBooking,
  setBookingSuccess,
  setLoading,
  setError,
  clearError
} = bookingFormSlice.actions;

// Selectors
export const selectFormData = (state) => state.bookingForm.formData;
export const selectValidation = (state) => state.bookingForm.validation;
export const selectAvailability = (state) => state.bookingForm.availability;
export const selectIsCheckingAvailability = (state) => state.bookingForm.isCheckingAvailability;
export const selectAvailabilityChecked = (state) => state.bookingForm.availabilityChecked;
export const selectPricingPreview = (state) => state.bookingForm.pricingPreview;
export const selectIsQuickBooking = (state) => state.bookingForm.isQuickBooking;
export const selectBookingSuccess = (state) => state.bookingForm.bookingSuccess;
export const selectBookingLoading = (state) => state.bookingForm.loading;
export const selectBookingError = (state) => state.bookingForm.error;

export default bookingFormSlice.reducer;
