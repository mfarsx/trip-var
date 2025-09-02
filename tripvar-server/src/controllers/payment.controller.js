const Booking = require('../models/booking.model');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');
const { successResponse } = require('../utils/response');
const { info, error } = require('../utils/logger');

// Process payment for a booking
const processPayment = async(req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { paymentMethod, paymentDetails } = req.body;
    const userId = req.user.id;

    // Find the booking
    const booking = await Booking.findById(bookingId).populate('destination');

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check if user owns this booking
    if (booking.user.toString() !== userId) {
      throw new ValidationError('Access denied');
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      throw new ConflictError('Booking is already paid');
    }

    // Check if booking is cancelled
    if (booking.status === 'cancelled') {
      throw new ConflictError('Cannot process payment for cancelled booking');
    }

    // Simulate payment processing
    // In a real application, you would integrate with payment providers like Stripe, PayPal, etc.
    const paymentResult = await simulatePaymentProcessing({
      amount: booking.totalAmount,
      paymentMethod,
      paymentDetails,
      bookingId
    });

    if (paymentResult.success) {
      // Update booking with payment information
      booking.paymentStatus = 'paid';
      booking.paymentIntentId = paymentResult.paymentIntentId;
      booking.paymentMethod = paymentMethod;

      await booking.save();

      info('Payment processed successfully', {
        bookingId,
        userId,
        amount: booking.totalAmount,
        paymentMethod
      });

      res.json(
        successResponse(
          {
            booking,
            paymentResult
          },
          'Payment processed successfully'
        )
      );
    } else {
      // Payment failed
      booking.paymentStatus = 'failed';
      await booking.save();

      throw new ValidationError(paymentResult.error || 'Payment processing failed');
    }

  } catch (err) {
    error('Error processing payment', { error: err.message, bookingId: req.params.bookingId });
    next(err);
  }
};

// Get payment status for a booking
const getPaymentStatus = async(req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId)
      .select('paymentStatus paymentMethod totalAmount paymentIntentId createdAt')
      .populate('destination', 'title');

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check if user owns this booking
    if (booking.user.toString() !== userId) {
      throw new ValidationError('Access denied');
    }

    res.json(
      successResponse(
        {
          booking: {
            id: booking._id,
            destination: booking.destination,
            paymentStatus: booking.paymentStatus,
            paymentMethod: booking.paymentMethod,
            totalAmount: booking.totalAmount,
            paymentIntentId: booking.paymentIntentId,
            createdAt: booking.createdAt
          }
        },
        'Payment status retrieved successfully'
      )
    );

  } catch (err) {
    error('Error fetching payment status', { error: err.message, bookingId: req.params.bookingId });
    next(err);
  }
};

// Refund a booking
const processRefund = async(req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check if user owns this booking or is admin
    if (booking.user.toString() !== userId && req.user.role !== 'admin') {
      throw new ValidationError('Access denied');
    }

    // Check if booking is paid
    if (booking.paymentStatus !== 'paid') {
      throw new ConflictError('Cannot refund unpaid booking');
    }

    // Check if booking is already refunded
    if (booking.paymentStatus === 'refunded') {
      throw new ConflictError('Booking is already refunded');
    }

    // Calculate refund amount
    const refundAmount = booking.calculateRefund();

    if (refundAmount === 0) {
      throw new ValidationError('No refund available for this booking');
    }

    // Simulate refund processing
    const refundResult = await simulateRefundProcessing({
      paymentIntentId: booking.paymentIntentId,
      amount: refundAmount,
      reason
    });

    if (refundResult.success) {
      // Update booking with refund information
      booking.paymentStatus = 'refunded';
      booking.refundAmount = refundAmount;
      booking.refundedAt = new Date();
      booking.cancellationReason = reason;

      await booking.save();

      info('Refund processed successfully', {
        bookingId,
        userId,
        refundAmount,
        reason
      });

      res.json(
        successResponse(
          {
            booking,
            refundResult
          },
          'Refund processed successfully'
        )
      );
    } else {
      throw new ValidationError(refundResult.error || 'Refund processing failed');
    }

  } catch (err) {
    error('Error processing refund', { error: err.message, bookingId: req.params.bookingId });
    next(err);
  }
};

// Get payment history for a user
const getPaymentHistory = async(req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    // Build query
    const query = { user: userId };
    if (status) {
      query.paymentStatus = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get bookings with payment information
    const bookings = await Booking.find(query)
      .select('paymentStatus paymentMethod totalAmount paymentIntentId createdAt refundAmount refundedAt')
      .populate('destination', 'title location imageUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Booking.countDocuments(query);

    // Calculate payment statistics
    const stats = await Booking.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$totalAmount' },
          totalRefunded: { $sum: { $ifNull: ['$refundAmount', 0] } },
          paidBookings: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
          },
          refundedBookings: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'refunded'] }, 1, 0] }
          }
        }
      }
    ]);

    const paymentStats = stats.length > 0 ? stats[0] : {
      totalSpent: 0,
      totalRefunded: 0,
      paidBookings: 0,
      refundedBookings: 0
    };

    res.json(
      successResponse(
        {
          bookings,
          paymentStats,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            total
          }
        },
        'Payment history retrieved successfully'
      )
    );

  } catch (err) {
    error('Error fetching payment history', { error: err.message, userId: req.user?.id });
    next(err);
  }
};

// Simulate payment processing (replace with real payment provider integration)
const simulatePaymentProcessing = async(paymentData) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate 95% success rate
  const success = Math.random() > 0.05;

  if (success) {
    return {
      success: true,
      paymentIntentId: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: paymentData.amount,
      currency: 'USD',
      status: 'succeeded'
    };
  } else {
    return {
      success: false,
      error: 'Payment processing failed. Please try again.'
    };
  }
};

// Simulate refund processing (replace with real payment provider integration)
const simulateRefundProcessing = async(refundData) => {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate 98% success rate for refunds
  const success = Math.random() > 0.02;

  if (success) {
    return {
      success: true,
      refundId: `re_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: refundData.amount,
      currency: 'USD',
      status: 'succeeded'
    };
  } else {
    return {
      success: false,
      error: 'Refund processing failed. Please contact support.'
    };
  }
};

module.exports = {
  processPayment,
  getPaymentStatus,
  processRefund,
  getPaymentHistory
};