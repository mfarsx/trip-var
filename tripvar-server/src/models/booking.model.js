const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    // User who made the booking
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user']
    },

    // Destination being booked
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination',
      required: [true, 'Booking must be for a destination']
    },

    // Booking dates
    checkInDate: {
      type: Date,
      required: [true, 'Check-in date is required'],
      validate: {
        validator: function(v) {
          // Check-in date must be in the future
          return v > new Date();
        },
        message: 'Check-in date must be in the future'
      }
    },

    checkOutDate: {
      type: Date,
      required: [true, 'Check-out date is required'],
      validate: {
        validator: function(v) {
          // Check-out date must be after check-in date
          return v > this.checkInDate;
        },
        message: 'Check-out date must be after check-in date'
      }
    },

    // Number of guests
    numberOfGuests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'At least 1 guest is required'],
      max: [10, 'Maximum 10 guests allowed']
    },

    // Pricing information
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [0, 'Price cannot be negative']
    },

    totalNights: {
      type: Number,
      required: true,
      min: [1, 'At least 1 night is required']
    },

    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },

    // Payment information
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['credit-card', 'paypal', 'bank-transfer'],
        message: 'Payment method must be credit-card, paypal, or bank-transfer'
      }
    },

    paymentStatus: {
      type: String,
      required: true,
      enum: {
        values: ['pending', 'paid', 'failed', 'refunded'],
        message: 'Payment status must be pending, paid, failed, or refunded'
      },
      default: 'pending'
    },

    paymentIntentId: {
      type: String,
      required: false // Will be set when payment is processed
    },

    // Booking status
    status: {
      type: String,
      required: true,
      enum: {
        values: ['confirmed', 'cancelled', 'completed', 'no-show'],
        message: 'Status must be confirmed, cancelled, completed, or no-show'
      },
      default: 'confirmed'
    },

    // Additional information
    specialRequests: {
      type: String,
      maxlength: [500, 'Special requests cannot exceed 500 characters'],
      required: false
    },

    // Contact information for the booking
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please provide a valid email address'
      }
    },

    contactPhone: {
      type: String,
      required: false,
      trim: true
    },

    // Cancellation information
    cancelledAt: {
      type: Date,
      required: false
    },

    cancellationReason: {
      type: String,
      required: false,
      maxlength: [200, 'Cancellation reason cannot exceed 200 characters']
    },

    // Refund information
    refundAmount: {
      type: Number,
      required: false,
      min: [0, 'Refund amount cannot be negative']
    },

    refundedAt: {
      type: Date,
      required: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual field for booking duration in days
bookingSchema.virtual('duration').get(function() {
  if (this.checkInDate && this.checkOutDate) {
    const timeDiff = this.checkOutDate.getTime() - this.checkInDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }
  return 0;
});

// Virtual field for booking reference number
bookingSchema.virtual('bookingReference').get(function() {
  return `TRV-${this._id.toString().slice(-8).toUpperCase()}`;
});

// Pre-save middleware to calculate total nights and amount
bookingSchema.pre('save', function(next) {
  if (this.checkInDate && this.checkOutDate && this.pricePerNight) {
    const timeDiff = this.checkOutDate.getTime() - this.checkInDate.getTime();
    this.totalNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    this.totalAmount = this.totalNights * this.pricePerNight * this.numberOfGuests;
  }
  next();
});

// Index for better query performance
bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ destination: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });

// Static method to check availability
bookingSchema.statics.checkAvailability = async function(destinationId, checkInDate, checkOutDate) {
  const existingBookings = await this.find({
    destination: destinationId,
    status: { $in: ['confirmed', 'completed'] },
    $or: [
      {
        checkInDate: { $lt: checkOutDate },
        checkOutDate: { $gt: checkInDate }
      }
    ]
  });

  return existingBookings.length === 0;
};

// Instance method to calculate refund amount
bookingSchema.methods.calculateRefund = function() {
  if (this.status !== 'cancelled') {
    return 0;
  }

  const now = new Date();
  const daysUntilCheckIn = Math.ceil((this.checkInDate - now) / (1000 * 3600 * 24));

  // Refund policy: 100% if cancelled 7+ days before, 50% if 3-6 days, 0% if less than 3 days
  if (daysUntilCheckIn >= 7) {
    return this.totalAmount;
  } else if (daysUntilCheckIn >= 3) {
    return this.totalAmount * 0.5;
  } else {
    return 0;
  }
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;