const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // User who wrote the review
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },

    // Destination being reviewed
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: [true, "Review must be for a destination"],
    },

    // Booking reference (optional - user can review without booking)
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: false,
    },

    // Review content
    title: {
      type: String,
      required: [true, "Review title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },

    content: {
      type: String,
      required: [true, "Review content is required"],
      trim: true,
      maxlength: [1000, "Review content cannot exceed 1000 characters"],
    },

    // Rating (1-5 stars)
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    // Additional ratings (optional)
    ratings: {
      cleanliness: {
        type: Number,
        min: 1,
        max: 5,
        required: false,
      },
      location: {
        type: Number,
        min: 1,
        max: 5,
        required: false,
      },
      value: {
        type: Number,
        min: 1,
        max: 5,
        required: false,
      },
      service: {
        type: Number,
        min: 1,
        max: 5,
        required: false,
      },
    },

    // Review status
    status: {
      type: String,
      enum: {
        values: ["pending", "approved", "rejected"],
        message: "Status must be pending, approved, or rejected",
      },
      default: "approved",
    },

    // Helpful votes
    helpfulVotes: {
      type: Number,
      default: 0,
    },

    // Users who found this review helpful
    helpfulUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Admin response (optional)
    adminResponse: {
      content: {
        type: String,
        maxlength: [500, "Admin response cannot exceed 500 characters"],
      },
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      respondedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
reviewSchema.index({ destination: 1, createdAt: -1 });
reviewSchema.index({ user: 1, destination: 1 }, { unique: true }); // One review per user per destination
reviewSchema.index({ status: 1 });
reviewSchema.index({ rating: 1 });

// Virtual field for review age
reviewSchema.virtual("age").get(function () {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return "1 day ago";
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  if (diffDays < 30) {
    return `${Math.ceil(diffDays / 7)} weeks ago`;
  }
  if (diffDays < 365) {
    return `${Math.ceil(diffDays / 30)} months ago`;
  }
  return `${Math.ceil(diffDays / 365)} years ago`;
});

// Static method to calculate average rating for a destination
reviewSchema.statics.calculateAverageRating = async function (destinationId) {
  try {
    const stats = await this.aggregate([
      {
        $match: {
          destination: destinationId,
          status: "approved",
        },
      },
      {
        $group: {
          _id: "$destination",
          nRating: { $sum: 1 },
          avgRating: { $avg: "$rating" },
          avgCleanliness: { $avg: "$ratings.cleanliness" },
          avgLocation: { $avg: "$ratings.location" },
          avgValue: { $avg: "$ratings.value" },
          avgService: { $avg: "$ratings.service" },
        },
      },
    ]);

    const Destination = mongoose.model("Destination");

    if (stats.length > 0) {
      const newRating = Math.round(stats[0].avgRating * 10) / 10;
      const newCount = stats[0].nRating;

      await Destination.findByIdAndUpdate(destinationId, {
        rating: newRating,
        ratingCount: newCount,
      });

      console.log(
        `Updated destination ${destinationId} rating: ${newRating} (${newCount} reviews)`
      );
    } else {
      await Destination.findByIdAndUpdate(destinationId, {
        rating: 0,
        ratingCount: 0,
      });

      console.log(
        `Reset destination ${destinationId} rating to 0 (no approved reviews)`
      );
    }
  } catch (error) {
    console.error("Error calculating average rating:", error);
  }
};

// Post-save middleware to update destination rating
reviewSchema.post("save", async function (doc) {
  // Use doc.constructor to access the model
  await this.constructor.calculateAverageRating(doc.destination);
});

// Post-deleteOne middleware to update destination rating
reviewSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function (doc) {
    // This runs when .deleteOne() is called on a document
    await this.constructor.calculateAverageRating(doc.destination);
  }
);

// Post-findOneAndDelete middleware to update destination rating
reviewSchema.post("findOneAndDelete", async function (doc) {
  // doc is the deleted document
  if (doc && doc.destination) {
    await Review.calculateAverageRating(doc.destination);
  }
});

// Post-findByIdAndDelete also triggers findOneAndDelete, so that middleware will handle it

// Post-deleteMany middleware to update destination rating
reviewSchema.post("deleteMany", async function (result) {
  // This is called when multiple reviews are deleted
  // We need to update all affected destinations
  if (this.getQuery && this.getQuery().destination) {
    await Review.calculateAverageRating(this.getQuery().destination);
  }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
