import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { reviewApi } from "../../services/reviewApi";
import toast from "react-hot-toast";

// Async thunks
export const fetchDestinationReviews = createAsyncThunk(
  "review/fetchDestinationReviews",
  async ({ destinationId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await reviewApi.getDestinationReviews(destinationId, params);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch reviews";
      return rejectWithValue(message);
    }
  }
);

export const createReview = createAsyncThunk(
  "review/createReview",
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await reviewApi.createReview(reviewData);
      toast.success("Review created successfully!");
      return response.data.review;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create review";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchUserReviews = createAsyncThunk(
  "review/fetchUserReviews",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await reviewApi.getUserReviews(params);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch user reviews";
      return rejectWithValue(message);
    }
  }
);

export const updateReview = createAsyncThunk(
  "review/updateReview",
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await reviewApi.updateReview(reviewId, reviewData);
      toast.success("Review updated successfully!");
      return response.data.review;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update review";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteReview = createAsyncThunk(
  "review/deleteReview",
  async (reviewId, { rejectWithValue }) => {
    try {
      await reviewApi.deleteReview(reviewId);
      toast.success("Review deleted successfully!");
      return reviewId;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete review";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const markReviewHelpful = createAsyncThunk(
  "review/markReviewHelpful",
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await reviewApi.markReviewHelpful(reviewId);
      return { reviewId, ...response.data };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to mark review as helpful";
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  destinationReviews: [],
  userReviews: [],
  ratingStats: {
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  },
  pagination: {
    current: 1,
    pages: 1,
    total: 0
  },
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDestinationReviews: (state) => {
      state.destinationReviews = [];
      state.ratingStats = {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch destination reviews
      .addCase(fetchDestinationReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDestinationReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.destinationReviews = action.payload.reviews;
        state.ratingStats = action.payload.ratingStats;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchDestinationReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create review
      .addCase(createReview.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.creating = false;
        state.destinationReviews.unshift(action.payload);
        state.userReviews.unshift(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

      // Fetch user reviews
      .addCase(fetchUserReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.userReviews = action.payload.reviews;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update review
      .addCase(updateReview.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.updating = false;
        const index = state.destinationReviews.findIndex(review => review._id === action.payload._id);
        if (index !== -1) {
          state.destinationReviews[index] = action.payload;
        }
        const userIndex = state.userReviews.findIndex(review => review._id === action.payload._id);
        if (userIndex !== -1) {
          state.userReviews[userIndex] = action.payload;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

      // Delete review
      .addCase(deleteReview.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.deleting = false;
        state.destinationReviews = state.destinationReviews.filter(review => review._id !== action.payload);
        state.userReviews = state.userReviews.filter(review => review._id !== action.payload);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })

      // Mark review helpful
      .addCase(markReviewHelpful.fulfilled, (state, action) => {
        const { reviewId, helpfulVotes } = action.payload;
        const index = state.destinationReviews.findIndex(review => review._id === reviewId);
        if (index !== -1) {
          state.destinationReviews[index].helpfulVotes = helpfulVotes;
        }
        const userIndex = state.userReviews.findIndex(review => review._id === reviewId);
        if (userIndex !== -1) {
          state.userReviews[userIndex].helpfulVotes = helpfulVotes;
        }
      });
  }
});

export const { clearError, clearDestinationReviews } = reviewSlice.actions;
export default reviewSlice.reducer;