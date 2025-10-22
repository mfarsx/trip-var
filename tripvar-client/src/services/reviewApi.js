import api from "./api";

// Review API service
export const reviewApi = {
  // Get reviews for a destination
  getDestinationReviews: async (destinationId, params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.sort) queryParams.append("sort", params.sort);

    const response = await api.get(
      `/reviews/destination/${destinationId}?${queryParams.toString()}`
    );
    return response.data;
  },

  // Create a new review
  createReview: async (reviewData) => {
    const response = await api.post("/reviews", reviewData);
    return response.data;
  },

  // Get user's reviews
  getUserReviews: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const response = await api.get(`/reviews?${queryParams.toString()}`);
    return response.data;
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Mark review as helpful
  markReviewHelpful: async (reviewId) => {
    const response = await api.post(`/reviews/${reviewId}/likes`);
    return response.data;
  },
};

export default reviewApi;
