import api from "./api";

// Booking API service
export const bookingApi = {
  // Create a new booking
  createBooking: async (bookingData) => {
    const response = await api.post("/bookings", bookingData);
    return response.data;
  },

  // Get user's bookings
  getUserBookings: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append("status", params.status);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const response = await api.get(`/bookings?${queryParams.toString()}`);
    return response.data;
  },

  // Get specific booking by ID
  getBookingById: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  // Cancel a booking
  cancelBooking: async (bookingId, reason) => {
    const response = await api.delete(`/bookings/${bookingId}`, {
      data: { reason },
    });
    return response.data;
  },

  // Check availability for a destination
  checkAvailability: async (destinationId, checkInDate, checkOutDate) => {
    const params = new URLSearchParams({
      destinationId,
      checkInDate,
      checkOutDate,
    });

    const response = await api.get(
      `/bookings/availability?${params.toString()}`
    );
    return response.data;
  },
};

export default bookingApi;
