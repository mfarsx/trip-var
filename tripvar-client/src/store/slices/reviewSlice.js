import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { reviewApi } from "../../services/reviewApi";
import toast from "react-hot-toast";

// Async thunks
export const fetchDestinationReviews = createAsyncThunk(
  "review/fetchDestinationReviews",
  async ({ destinationId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await reviewApi.getDestinationReviews(
        destinationId,
        params
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch reviews";
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
      const message =
        error.response?.data?.message || "Failed to create review";
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
      const message =
        error.response?.data?.message || "Failed to fetch user reviews";
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
      const message =
        error.response?.data?.message || "Failed to update review";
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
      const message =
        error.response?.data?.message || "Failed to delete review";
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
      const message =
        error.response?.data?.message || "Failed to mark review as helpful";
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
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  },
  pagination: {
    current: 1,
    pages: 1,
    total: 0,
  },
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
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
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    },
    // WebSocket event handlers
    addReviewFromWebSocket: (state, action) => {
      const newReview = action.payload;

      // Check if review already exists (avoid duplicates)
      const exists = state.destinationReviews.some(
        (review) => review._id === newReview._id
      );

      if (!exists) {
        // Add the new review to the beginning of the list
        state.destinationReviews.unshift(newReview);

        // Update rating stats
        const currentStats = state.ratingStats;
        const totalReviews = currentStats.totalReviews + 1;
        const newAverage =
          (currentStats.averageRating * currentStats.totalReviews +
            newReview.rating) /
          totalReviews;

        state.ratingStats = {
          ...currentStats,
          averageRating: Math.round(newAverage * 10) / 10,
          totalReviews: totalReviews,
          distribution: {
            ...currentStats.distribution,
            [newReview.rating]:
              (currentStats.distribution[newReview.rating] || 0) + 1,
          },
        };
      }
    },
    updateReviewFromWebSocket: (state, action) => {
      const updatedReview = action.payload;

      // Find and update the review in destination reviews
      const index = state.destinationReviews.findIndex(
        (review) => review._id === updatedReview._id
      );

      if (index !== -1) {
        const oldReview = state.destinationReviews[index];
        state.destinationReviews[index] = updatedReview;

        // Update rating stats
        const currentStats = state.ratingStats;
        const totalReviews = currentStats.totalReviews;
        const oldRating = oldReview.rating;
        const newRating = updatedReview.rating;

        // Recalculate average rating
        const currentTotal = currentStats.averageRating * totalReviews;
        const newTotal = currentTotal - oldRating + newRating;
        const newAverage = newTotal / totalReviews;

        // Update distribution
        const newDistribution = { ...currentStats.distribution };
        newDistribution[oldRating] = Math.max(
          0,
          (newDistribution[oldRating] || 0) - 1
        );
        newDistribution[newRating] = (newDistribution[newRating] || 0) + 1;

        state.ratingStats = {
          ...currentStats,
          averageRating: Math.round(newAverage * 10) / 10,
          distribution: newDistribution,
        };
      }

      // Update in user reviews
      const userIndex = state.userReviews.findIndex(
        (review) => review._id === updatedReview._id
      );
      if (userIndex !== -1) {
        state.userReviews[userIndex] = updatedReview;
      }
    },
    removeReviewFromWebSocket: (state, action) => {
      const { reviewId } = action.payload;

      // Find the review before deleting to update stats
      const deletedReview = state.destinationReviews.find(
        (review) => review._id === reviewId
      );

      // Remove from both lists
      state.destinationReviews = state.destinationReviews.filter(
        (review) => review._id !== reviewId
      );
      state.userReviews = state.userReviews.filter(
        (review) => review._id !== reviewId
      );

      // Update rating stats if review was found
      if (deletedReview) {
        const currentStats = state.ratingStats;
        const totalReviews = Math.max(0, currentStats.totalReviews - 1);

        if (totalReviews === 0) {
          // No reviews left
          state.ratingStats = {
            averageRating: 0,
            totalReviews: 0,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          };
        } else {
          // Recalculate average rating
          const currentTotal =
            currentStats.averageRating * currentStats.totalReviews;
          const newTotal = currentTotal - deletedReview.rating;
          const newAverage = newTotal / totalReviews;

          // Update distribution
          const newDistribution = { ...currentStats.distribution };
          newDistribution[deletedReview.rating] = Math.max(
            0,
            (newDistribution[deletedReview.rating] || 0) - 1
          );

          state.ratingStats = {
            ...currentStats,
            averageRating: Math.round(newAverage * 10) / 10,
            totalReviews: totalReviews,
            distribution: newDistribution,
          };
        }
      }
    },
    updateReviewHelpfulFromWebSocket: (state, action) => {
      const { reviewId, helpfulVotes } = action.payload;

      // Update in destination reviews
      const destIndex = state.destinationReviews.findIndex(
        (review) => review._id === reviewId
      );
      if (destIndex !== -1) {
        state.destinationReviews[destIndex].helpfulVotes = helpfulVotes;
      }

      // Update in user reviews
      const userIndex = state.userReviews.findIndex(
        (review) => review._id === reviewId
      );
      if (userIndex !== -1) {
        state.userReviews[userIndex].helpfulVotes = helpfulVotes;
      }
    },
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
        // Add the new review to the beginning of the list
        state.destinationReviews.unshift(action.payload);
        state.userReviews.unshift(action.payload);

        // Update rating stats
        const newReview = action.payload;
        const currentStats = state.ratingStats;
        const totalReviews = currentStats.totalReviews + 1;
        const newAverage =
          (currentStats.averageRating * currentStats.totalReviews +
            newReview.rating) /
          totalReviews;

        state.ratingStats = {
          ...currentStats,
          averageRating: Math.round(newAverage * 10) / 10,
          totalReviews: totalReviews,
          distribution: {
            ...currentStats.distribution,
            [newReview.rating]:
              (currentStats.distribution[newReview.rating] || 0) + 1,
          },
        };
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
        const updatedReview = action.payload;

        // Find and update the review in destination reviews
        const index = state.destinationReviews.findIndex(
          (review) => review._id === updatedReview._id
        );
        if (index !== -1) {
          const oldReview = state.destinationReviews[index];
          state.destinationReviews[index] = updatedReview;

          // Update rating stats
          const currentStats = state.ratingStats;
          const totalReviews = currentStats.totalReviews;
          const oldRating = oldReview.rating;
          const newRating = updatedReview.rating;

          // Recalculate average rating
          const currentTotal = currentStats.averageRating * totalReviews;
          const newTotal = currentTotal - oldRating + newRating;
          const newAverage = newTotal / totalReviews;

          // Update distribution
          const newDistribution = { ...currentStats.distribution };
          newDistribution[oldRating] = Math.max(
            0,
            (newDistribution[oldRating] || 0) - 1
          );
          newDistribution[newRating] = (newDistribution[newRating] || 0) + 1;

          state.ratingStats = {
            ...currentStats,
            averageRating: Math.round(newAverage * 10) / 10,
            distribution: newDistribution,
          };
        }

        // Update in user reviews
        const userIndex = state.userReviews.findIndex(
          (review) => review._id === updatedReview._id
        );
        if (userIndex !== -1) {
          state.userReviews[userIndex] = updatedReview;
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
        const deletedReviewId = action.payload;

        // Find the review before deleting to update stats
        const deletedReview = state.destinationReviews.find(
          (review) => review._id === deletedReviewId
        );

        // Remove from both lists
        state.destinationReviews = state.destinationReviews.filter(
          (review) => review._id !== deletedReviewId
        );
        state.userReviews = state.userReviews.filter(
          (review) => review._id !== deletedReviewId
        );

        // Update rating stats if review was found
        if (deletedReview) {
          const currentStats = state.ratingStats;
          const totalReviews = Math.max(0, currentStats.totalReviews - 1);

          if (totalReviews === 0) {
            // No reviews left
            state.ratingStats = {
              averageRating: 0,
              totalReviews: 0,
              distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            };
          } else {
            // Recalculate average rating
            const currentTotal =
              currentStats.averageRating * currentStats.totalReviews;
            const newTotal = currentTotal - deletedReview.rating;
            const newAverage = newTotal / totalReviews;

            // Update distribution
            const newDistribution = { ...currentStats.distribution };
            newDistribution[deletedReview.rating] = Math.max(
              0,
              (newDistribution[deletedReview.rating] || 0) - 1
            );

            state.ratingStats = {
              ...currentStats,
              averageRating: Math.round(newAverage * 10) / 10,
              totalReviews: totalReviews,
              distribution: newDistribution,
            };
          }
        }
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      })

      // Mark review helpful
      .addCase(markReviewHelpful.fulfilled, (state, action) => {
        const { reviewId, helpfulVotes } = action.payload;
        const index = state.destinationReviews.findIndex(
          (review) => review._id === reviewId
        );
        if (index !== -1) {
          state.destinationReviews[index].helpfulVotes = helpfulVotes;
        }
        const userIndex = state.userReviews.findIndex(
          (review) => review._id === reviewId
        );
        if (userIndex !== -1) {
          state.userReviews[userIndex].helpfulVotes = helpfulVotes;
        }
      });
  },
});

export const {
  clearError,
  clearDestinationReviews,
  addReviewFromWebSocket,
  updateReviewFromWebSocket,
  removeReviewFromWebSocket,
  updateReviewHelpfulFromWebSocket,
} = reviewSlice.actions;
export default reviewSlice.reducer;
