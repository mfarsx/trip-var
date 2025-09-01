const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // User who will receive the notification
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Notification must belong to a user"],
    },
    
    // Related entities (optional)
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: false
    },
    
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: false
    },
    
    // Notification content
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"]
    },
    
    // Notification type
    type: {
      type: String,
      required: [true, "Notification type is required"],
      enum: {
        values: [
          "booking_confirmed",
          "booking_cancelled", 
          "booking_reminder",
          "payment_success",
          "payment_failed",
          "review_request",
          "destination_update",
          "promotion",
          "system"
        ],
        message: "Invalid notification type"
      }
    },
    
    // Notification priority
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "urgent"],
        message: "Priority must be low, medium, high, or urgent"
      },
      default: "medium"
    },
    
    // Read status
    isRead: {
      type: Boolean,
      default: false
    },
    
    // Read timestamp
    readAt: {
      type: Date,
      required: false
    },
    
    // Action URL (optional)
    actionUrl: {
      type: String,
      required: false,
      maxlength: [200, "Action URL cannot exceed 200 characters"]
    },
    
    // Action text (optional)
    actionText: {
      type: String,
      required: false,
      maxlength: [50, "Action text cannot exceed 50 characters"]
    },
    
    // Expiration date (optional)
    expiresAt: {
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

// Index for better query performance
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Virtual field for notification age
notificationSchema.virtual("age").get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffMinutes = Math.floor(diffTime / (1000 * 60));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return created.toLocaleDateString();
});

// Static method to create notification
notificationSchema.statics.createNotification = async function(notificationData) {
  const notification = new this(notificationData);
  await notification.save();
  return notification;
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = async function(userId, notificationIds) {
  const updateData = {
    isRead: true,
    readAt: new Date()
  };
  
  if (notificationIds && notificationIds.length > 0) {
    return await this.updateMany(
      { _id: { $in: notificationIds }, user: userId },
      updateData
    );
  } else {
    return await this.updateMany(
      { user: userId, isRead: false },
      updateData
    );
  }
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ user: userId, isRead: false });
};

// Static method to cleanup expired notifications
notificationSchema.statics.cleanupExpired = async function() {
  return await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;