const Booking = require("../public/models/booking.model");
const Destination = require("../public/models/destination.model");

/**
 * Utility class for checking destination availability
 */
class AvailabilityChecker {
  /**
   * Check if a destination is available for the given dates
   * @param {string} destinationId - The destination ID
   * @param {Date} startDate - Check-in date
   * @param {Date} endDate - Check-out date
   * @param {number} guestCount - Number of guests
   * @returns {Promise<Object>} Availability status and details
   */
  static async checkAvailability(
    destinationId,
    startDate,
    endDate,
    guestCount
  ) {
    try {
      // Get destination
      const destination = await Destination.findById(destinationId);
      if (!destination) {
        return {
          available: false,
          reason: "Destination not found",
        };
      }

      // Check guest capacity
      const capacityCheck = this.checkGuestCapacity(destination, guestCount);
      if (!capacityCheck.valid) {
        return {
          available: false,
          reason: capacityCheck.reason,
          maxGuests: capacityCheck.maxGuests,
        };
      }

      // Check for conflicting bookings
      const conflictingBookings = await Booking.find({
        destination: destinationId,
        status: { $in: ["pending", "confirmed"] },
        $or: [
          // Booking starts during the requested period
          {
            startDate: { $gte: startDate, $lt: endDate },
          },
          // Booking ends during the requested period
          {
            endDate: { $gt: startDate, $lte: endDate },
          },
          // Booking encompasses the entire requested period
          {
            startDate: { $lte: startDate },
            endDate: { $gte: endDate },
          },
        ],
      });

      // Calculate total guests during the period
      const totalGuestsBooked = conflictingBookings.reduce(
        (sum, booking) => sum + (booking.guests || 0),
        0
      );

      const maxCapacity = capacityCheck.maxGuests;
      const availableSpots = maxCapacity - totalGuestsBooked;

      if (availableSpots < guestCount) {
        return {
          available: false,
          reason: "Insufficient capacity for the selected dates",
          requestedGuests: guestCount,
          availableSpots: Math.max(0, availableSpots),
          conflictingBookings: conflictingBookings.length,
        };
      }

      return {
        available: true,
        availableSpots,
        maxCapacity,
        conflictingBookings: conflictingBookings.length,
        message: "Destination is available for the selected dates",
      };
    } catch (error) {
      console.error("Error checking availability:", error);
      return {
        available: false,
        reason: "Error checking availability",
        error: error.message,
      };
    }
  }

  /**
   * Parse group size string to get max capacity
   * @param {string} groupSize - e.g., "2-8 people" or "10 people"
   * @returns {number} Maximum guest capacity
   */
  static parseGroupSize(groupSize) {
    if (!groupSize) return 8; // Default capacity

    // Extract numbers from the string
    const numbers = groupSize.match(/\d+/g);
    if (!numbers || numbers.length === 0) return 8;

    // If range format (e.g., "2-8 people"), return the max
    if (numbers.length >= 2) {
      return parseInt(numbers[numbers.length - 1], 10);
    }

    // If single number
    return parseInt(numbers[0], 10);
  }

  /**
   * Check if guest count is within capacity
   * @param {Object} destination - Destination object
   * @param {number} guestCount - Number of guests
   * @returns {Object} Validation result
   */
  static checkGuestCapacity(destination, guestCount) {
    const maxGuests = this.parseGroupSize(destination.groupSize);

    if (guestCount < 1) {
      return {
        valid: false,
        reason: "Guest count must be at least 1",
        maxGuests,
      };
    }

    if (guestCount > maxGuests) {
      return {
        valid: false,
        reason: `Guest count exceeds maximum capacity of ${maxGuests}`,
        maxGuests,
      };
    }

    return {
      valid: true,
      maxGuests,
    };
  }

  /**
   * Get available dates for a destination in a date range
   * @param {string} destinationId - Destination ID
   * @param {Date} startRange - Start of date range to check
   * @param {Date} endRange - End of date range to check
   * @returns {Promise<Array>} Array of available date ranges
   */
  static async getAvailableDateRanges(destinationId, startRange, endRange) {
    try {
      const bookings = await Booking.find({
        destination: destinationId,
        status: { $in: ["pending", "confirmed"] },
        startDate: { $lte: endRange },
        endDate: { $gte: startRange },
      }).sort({ startDate: 1 });

      const availableRanges = [];
      let currentDate = new Date(startRange);

      for (const booking of bookings) {
        // If there's a gap before this booking
        if (currentDate < booking.startDate) {
          availableRanges.push({
            start: new Date(currentDate),
            end: new Date(booking.startDate),
          });
        }
        // Move current date to after this booking
        if (booking.endDate > currentDate) {
          currentDate = new Date(booking.endDate);
        }
      }

      // Add remaining range if there's space after last booking
      if (currentDate < endRange) {
        availableRanges.push({
          start: new Date(currentDate),
          end: new Date(endRange),
        });
      }

      return availableRanges;
    } catch (error) {
      console.error("Error getting available date ranges:", error);
      return [];
    }
  }
}

module.exports = AvailabilityChecker;
