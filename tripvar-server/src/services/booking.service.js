const BaseService = require('./base.service');

class BookingService extends BaseService {
  constructor(repository) {
    super(repository);
  }

  // Create a new booking
  async createBooking(bookingData) {
    try {
      // Check for overlapping bookings
      const overlapping = await this.repository.findOverlappingBookings(
        bookingData.destination,
        bookingData.checkIn,
        bookingData.checkOut
      );

      if (overlapping.length > 0) {
        throw new Error('Destination is not available for the selected dates');
      }

      return await this.repository.create(bookingData);
    } catch (error) {
      throw error;
    }
  }

  // Get bookings by user
  async getBookingsByUser(userId) {
    try {
      return await this.repository.findByUser(userId);
    } catch (error) {
      throw error;
    }
  }

  // Get bookings by destination
  async getBookingsByDestination(destinationId) {
    try {
      return await this.repository.findByDestination(destinationId);
    } catch (error) {
      throw error;
    }
  }

  // Get bookings by status
  async getBookingsByStatus(status) {
    try {
      return await this.repository.findByStatus(status);
    } catch (error) {
      throw error;
    }
  }

  // Get active bookings
  async getActiveBookings() {
    try {
      return await this.repository.findActive();
    } catch (error) {
      throw error;
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId, status) {
    try {
      return await this.repository.updateStatus(bookingId, status);
    } catch (error) {
      throw error;
    }
  }

  // Cancel booking
  async cancelBooking(bookingId, userId) {
    try {
      const booking = await this.repository.findById(bookingId);
      
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.user.toString() !== userId) {
        throw new Error('Unauthorized to cancel this booking');
      }

      if (booking.status === 'cancelled') {
        throw new Error('Booking is already cancelled');
      }

      return await this.repository.updateStatus(bookingId, 'cancelled');
    } catch (error) {
      throw error;
    }
  }

  // Get booking statistics
  async getBookingStatistics() {
    try {
      return await this.repository.getStatistics();
    } catch (error) {
      throw error;
    }
  }

  // Get revenue by date range
  async getRevenueByDateRange(startDate, endDate) {
    try {
      return await this.repository.getRevenueByDateRange(startDate, endDate);
    } catch (error) {
      throw error;
    }
  }

  // Check availability
  async checkAvailability(destinationId, checkIn, checkOut, excludeBookingId = null) {
    try {
      const overlapping = await this.repository.findOverlappingBookings(
        destinationId,
        checkIn,
        checkOut,
        excludeBookingId
      );

      return {
        available: overlapping.length === 0,
        conflictingBookings: overlapping.length
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user booking history
  async getUserBookingHistory(userId, page = 1, limit = 10) {
    try {
      const bookings = await this.repository.findByUser(userId);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const paginatedBookings = bookings.slice(startIndex, endIndex);
      
      return {
        bookings: paginatedBookings,
        pagination: {
          page,
          limit,
          total: bookings.length,
          pages: Math.ceil(bookings.length / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BookingService;