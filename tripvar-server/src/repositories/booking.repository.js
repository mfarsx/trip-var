const BaseRepository = require('./base.repository');

class BookingRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  // Find bookings by user
  async findByUser(userId) {
    try {
      return await this.model.find({ user: userId }).populate('destination');
    } catch (error) {
      throw error;
    }
  }

  // Find bookings by destination
  async findByDestination(destinationId) {
    try {
      return await this.model.find({ destination: destinationId }).populate('user');
    } catch (error) {
      throw error;
    }
  }

  // Find bookings by status
  async findByStatus(status) {
    try {
      return await this.model.find({ status }).populate('user destination');
    } catch (error) {
      throw error;
    }
  }

  // Find bookings by date range
  async findByDateRange(startDate, endDate) {
    try {
      return await this.model.find({
        checkIn: { $gte: startDate },
        checkOut: { $lte: endDate }
      }).populate('user destination');
    } catch (error) {
      throw error;
    }
  }

  // Find active bookings
  async findActive() {
    try {
      const now = new Date();
      return await this.model.find({
        status: { $in: ['confirmed', 'pending'] },
        checkOut: { $gte: now }
      }).populate('user destination');
    } catch (error) {
      throw error;
    }
  }

  // Find bookings by payment status
  async findByPaymentStatus(paymentStatus) {
    try {
      return await this.model.find({ paymentStatus }).populate('user destination');
    } catch (error) {
      throw error;
    }
  }

  // Get booking statistics
  async getStatistics() {
    try {
      const stats = await this.model.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' }
          }
        }
      ]);
      return stats;
    } catch (error) {
      throw error;
    }
  }

  // Find overlapping bookings for a destination
  async findOverlappingBookings(destinationId, checkIn, checkOut, excludeBookingId = null) {
    try {
      const query = {
        destination: destinationId,
        status: { $in: ['confirmed', 'pending'] },
        $or: [
          {
            checkIn: { $lt: checkOut },
            checkOut: { $gt: checkIn }
          }
        ]
      };

      if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
      }

      return await this.model.find(query);
    } catch (error) {
      throw error;
    }
  }

  // Update booking status
  async updateStatus(bookingId, status) {
    try {
      return await this.model.findByIdAndUpdate(
        bookingId,
        { $set: { status } },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }

  // Get revenue by date range
  async getRevenueByDateRange(startDate, endDate) {
    try {
      const result = await this.model.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: 'confirmed'
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            bookingCount: { $sum: 1 }
          }
        }
      ]);
      return result[0] || { totalRevenue: 0, bookingCount: 0 };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BookingRepository;