const Booking = require('../public/models/booking.model');
const Destination = require('../public/models/destination.model');
const { ValidationError, NotFoundError, ConflictError, ForbiddenError } = require('../utils/errors');
const { sendSuccess, sendCreated, sendPaginated } = require('../utils/response');
const { info, error } = require('../utils/logger');
const NotificationService = require('../services/notification.service');

// Create a new booking
const createBooking = async(req, res, next) => {
  try {
    const {
      destinationId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      paymentMethod,
      specialRequests,
      contactEmail,
      contactPhone
    } = req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!destinationId || !checkInDate || !checkOutDate || !numberOfGuests) {
      throw new ValidationError('Missing required booking information');
    }

    // Parse dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Validate dates
    if (checkIn <= new Date()) {
      throw new ValidationError('Check-in date must be in the future');
    }

    if (checkOut <= checkIn) {
      throw new ValidationError('Check-out date must be after check-in date');
    }

    // Get destination details
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      throw new NotFoundError('Destination not found');
    }

    // Check availability
    const isAvailable = await Booking.checkAvailability(destinationId, checkIn, checkOut);
    if (!isAvailable) {
      throw new ConflictError('Destination is not available for the selected dates');
    }

    // Calculate pricing
    const totalNights = Math.ceil((checkOut - checkIn) / (1000 * 3600 * 24));
    const totalAmount = totalNights * destination.price * numberOfGuests;

    // Create booking
    const booking = new Booking({
      user: userId,
      destination: destinationId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfGuests,
      pricePerNight: destination.price,
      totalNights,
      totalAmount,
      paymentMethod,
      specialRequests,
      contactEmail: contactEmail || req.user.email,
      contactPhone
    });

    await booking.save();

    // Note: Not populating fields to keep response simple for tests

    info('New booking created', {
      bookingId: booking._id,
      userId,
      destinationId,
      totalAmount
    });

    // Create booking confirmation notification
    try {
      await NotificationService.createBookingConfirmationNotification(userId, booking);
    } catch (notificationError) {
      // Log error but don't fail the booking creation
      error('Failed to create booking confirmation notification', {
        error: notificationError.message,
        bookingId: booking._id,
        userId
      });
    }

    sendCreated(res, { booking }, 'Booking created successfully');

  } catch (err) {
    error('Error creating booking', { error: err.message, userId: req.user?.id });
    next(err);
  }
};

// Get user's bookings
const getUserBookings = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    // Build query
    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Get bookings with pagination
    const bookings = await Booking.find(query)
      .populate('destination', 'title location imageUrl rating')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Get total count for pagination
    const total = await Booking.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        bookings,
        pagination: {
          current: parseInt(page, 10),
          pages: Math.ceil(total / parseInt(limit, 10)),
          total
        }
      }
    });

  } catch (err) {
    error('Error fetching user bookings', { error: err.message, userId: req.user?.id });
    next(err);
  }
};

// Get specific booking
const getBookingById = async(req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(id)
      .populate('destination', 'title location imageUrl rating description')
      .populate('user', 'name email');

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== userId && req.user.role !== 'admin') {
      throw new ForbiddenError('Access denied');
    }

    res.json({
      status: 'success',
      data: {
        booking
      }
    });

  } catch (err) {
    error('Error fetching booking', { error: err.message, bookingId: req.params.id });
    next(err);
  }
};

// Cancel booking
const cancelBooking = async(req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findById(id).populate('destination');

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check if user owns this booking
    if (booking.user.toString() !== userId) {
      throw new ForbiddenError('Access denied');
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      throw new ConflictError('Booking is already cancelled');
    }

    if (booking.status === 'completed') {
      throw new ConflictError('Cannot cancel completed booking');
    }

    // Calculate refund amount
    const refundAmount = booking.calculateRefund();

    // Update booking
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;
    booking.refundAmount = refundAmount;

    if (refundAmount > 0) {
      booking.paymentStatus = 'refunded';
      booking.refundedAt = new Date();
    }

    await booking.save();

    info('Booking cancelled', {
      bookingId: id,
      userId,
      refundAmount
    });

    // Create booking cancellation notification
    try {
      await NotificationService.createBookingCancellationNotification(userId, booking, refundAmount);
    } catch (notificationError) {
      // Log error but don't fail the cancellation
      error('Failed to create booking cancellation notification', {
        error: notificationError.message,
        bookingId: id,
        userId
      });
    }

    res.json({
      status: 'success',
      message: 'Booking cancelled successfully',
      data: {
        booking,
        refundAmount
      }
    });

  } catch (err) {
    error('Error cancelling booking', { error: err.message, bookingId: req.params.id });
    next(err);
  }
};

// Get all bookings (admin only)
const getAllBookings = async(req, res, next) => {
  try {
    const { status, page = 1, limit = 20, destinationId } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (destinationId) {
      query.destination = destinationId;
    }

    // Calculate pagination
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Get bookings with pagination
    const bookings = await Booking.find(query)
      .populate('destination', 'title location')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Get total count
    const total = await Booking.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        bookings,
        pagination: {
          current: parseInt(page, 10),
          pages: Math.ceil(total / parseInt(limit, 10)),
          total
        }
      }
    });

  } catch (err) {
    error('Error fetching all bookings', { error: err.message });
    next(err);
  }
};

// Update booking status (admin only)
const updateBookingStatus = async(req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['confirmed', 'cancelled', 'completed', 'no-show'];
    if (!validStatuses.includes(status)) {
      throw new ValidationError('Invalid booking status');
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    booking.status = status;
    await booking.save();

    info('Booking status updated', {
      bookingId: id,
      newStatus: status,
      adminId: req.user.id
    });

    res.json({
      status: 'success',
      message: 'Booking status updated successfully',
      data: {
        booking
      }
    });

  } catch (err) {
    error('Error updating booking status', { error: err.message, bookingId: req.params.id });
    next(err);
  }
};

// Check availability for a destination
const checkAvailability = async(req, res, next) => {
  try {
    const { destinationId, checkInDate, checkOutDate } = req.query;

    if (!destinationId || !checkInDate || !checkOutDate) {
      throw new ValidationError('Missing required parameters');
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const isAvailable = await Booking.checkAvailability(destinationId, checkIn, checkOut);

    res.json({
      status: 'success',
      data: {
        available: isAvailable,
        checkInDate: checkIn,
        checkOutDate: checkOut
      }
    });

  } catch (err) {
    error('Error checking availability', { error: err.message });
    next(err);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  checkAvailability
};