import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { bookingApi } from "../../services/bookingApi";
import toast from "react-hot-toast";

// Async thunks
export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await bookingApi.createBooking(bookingData);
      toast.success("Booking created successfully!");
      return response.data.booking;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to create booking";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchUserBookings = createAsyncThunk(
  "booking/fetchUserBookings",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await bookingApi.getUserBookings(params);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch bookings";
      return rejectWithValue(message);
    }
  }
);

export const fetchBookingById = createAsyncThunk(
  "booking/fetchBookingById",
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await bookingApi.getBookingById(bookingId);
      return response.data.booking;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch booking";
      return rejectWithValue(message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  "booking/cancelBooking",
  async ({ bookingId, reason }, { rejectWithValue }) => {
    try {
      const response = await bookingApi.cancelBooking(bookingId, reason);
      toast.success("Booking cancelled successfully!");
      return response.data.booking;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to cancel booking";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const checkAvailability = createAsyncThunk(
  "booking/checkAvailability",
  async ({ destinationId, checkInDate, checkOutDate }, { rejectWithValue }) => {
    try {
      const response = await bookingApi.checkAvailability(
        destinationId,
        checkInDate,
        checkOutDate
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to check availability";
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  bookings: [],
  currentBooking: null,
  availability: null,
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
  },
  loading: false,
  error: null,
  creating: false,
  cancelling: false,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBooking: (state) => {
      state.currentBooking = null;
    },
    clearAvailability: (state) => {
      state.availability = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create booking
      .addCase(createBooking.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.creating = false;
        state.currentBooking = action.payload;
        state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

      // Fetch user bookings
      .addCase(fetchUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch booking by ID
      .addCase(fetchBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel booking
      .addCase(cancelBooking.pending, (state) => {
        state.cancelling = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.cancelling = false;
        const index = state.bookings.findIndex(
          (booking) => booking._id === action.payload._id
        );
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (
          state.currentBooking &&
          state.currentBooking._id === action.payload._id
        ) {
          state.currentBooking = action.payload;
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.cancelling = false;
        state.error = action.payload;
      })

      // Check availability
      .addCase(checkAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.availability = action.payload;
      })
      .addCase(checkAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentBooking, clearAvailability } =
  bookingSlice.actions;
export default bookingSlice.reducer;
