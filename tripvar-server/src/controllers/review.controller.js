const Review = require("../public/models/review.model");
const Destination = require("../public/models/destination.model");
const Booking = require("../public/models/booking.model");
const {
  ValidationError,
  NotFoundError,
  ConflictError,
} = require("../utils/errors");
const {
  sendSuccess,
  sendCreated,
  sendPaginated,
} = require("../utils/response");
const { info, error } = require("../utils/logger");
const mongoose = require("mongoose");
const websocketService = require("../services/websocketService");

// Create a new review
const createReview = async (req, res, next) => {
  try {
    const { destinationId, bookingId, title, content, rating, ratings } =
      req.body;

    const userId = req.user.id;

    // Validate required fields
    if (!destinationId || !title || !content || !rating) {
      throw new ValidationError("Missing required review information");
    }

    // Check if destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      throw new NotFoundError("Destination not found");
    }

    // Check if user already reviewed this destination
    const existingReview = await Review.findOne({
      user: userId,
      destination: destinationId,
    });

    if (existingReview) {
      throw new ConflictError("You have already reviewed this destination");
    }

    // If bookingId is provided, verify the booking belongs to the user
    if (bookingId) {
      const booking = await Booking.findOne({
        _id: bookingId,
        user: userId,
        destination: destinationId,
      });

      if (!booking) {
        throw new ValidationError("Invalid booking reference");
      }
    }

    // Create review
    const review = new Review({
      user: userId,
      destination: destinationId,
      booking: bookingId,
      title,
      content,
      rating,
      ratings,
    });

    await review.save();

    // Populate the review with user details
    await review.populate("user", "name email");

    info("New review created", {
      reviewId: review._id,
      userId,
      destinationId,
      rating,
    });

    // Broadcast review creation to all connected clients
    websocketService.broadcastReviewCreated(review.toObject());

    // Update and broadcast destination rating
    try {
      const ratingStats = await Review.aggregate([
        {
          $match: {
            destination: new mongoose.Types.ObjectId(destinationId),
            status: "approved",
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      if (ratingStats.length > 0) {
        const stats = ratingStats[0];
        websocketService.broadcastDestinationRatingUpdated(destinationId, {
          averageRating: Math.round(stats.averageRating * 10) / 10,
          totalReviews: stats.totalReviews,
        });
      }
    } catch (ratingError) {
      error("Failed to broadcast destination rating", {
        error: ratingError.message,
        destinationId,
      });
    }

    sendCreated(res, { review }, "Review created successfully");
  } catch (err) {
    error("Error creating review", {
      error: err.message,
      userId: req.user?.id,
    });
    next(err);
  }
};

// Get reviews for a destination
const getDestinationReviews = async (req, res, next) => {
  try {
    const { destinationId } = req.params;
    const { page = 1, limit = 10, sort = "newest" } = req.query;

    // Check if destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      throw new NotFoundError("Destination not found");
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case "newest":
        sortObj = { createdAt: -1 };
        break;
      case "oldest":
        sortObj = { createdAt: 1 };
        break;
      case "highest":
        sortObj = { rating: -1 };
        break;
      case "lowest":
        sortObj = { rating: 1 };
        break;
      case "most_helpful":
        sortObj = { helpfulVotes: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    // Calculate pagination
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Get reviews with pagination
    const reviews = await Review.find({
      destination: new mongoose.Types.ObjectId(destinationId),
      status: "approved",
    })
      .populate("user", "name email")
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Get total count
    const total = await Review.countDocuments({
      destination: new mongoose.Types.ObjectId(destinationId),
      status: "approved",
    });

    // Get rating statistics
    const stats = await Review.aggregate([
      {
        $match: {
          destination: new mongoose.Types.ObjectId(destinationId),
          status: "approved",
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    let ratingStats = {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };

    if (stats.length > 0) {
      const stat = stats[0];
      ratingStats.averageRating = Math.round(stat.averageRating * 10) / 10;
      ratingStats.totalReviews = stat.totalReviews;

      // Calculate distribution
      stat.ratingDistribution.forEach((rating) => {
        ratingStats.distribution[rating]++;
      });
    }

    sendSuccess(res, 200, "Reviews retrieved successfully", {
      reviews,
      ratingStats,
      pagination: {
        current: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
        total,
      },
    });
  } catch (err) {
    error("Error fetching reviews", {
      error: err.message,
      destinationId: req.params.destinationId,
    });
    next(err);
  }
};

// Get user's reviews
const getUserReviews = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    // Calculate pagination
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Get user's reviews
    const reviews = await Review.find({ user: userId })
      .populate("destination", "title location imageUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Get total count
    const total = await Review.countDocuments({ user: userId });

    sendSuccess(res, 200, "User reviews retrieved successfully", {
      reviews,
      pagination: {
        current: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
        total,
      },
    });
  } catch (err) {
    error("Error fetching user reviews", {
      error: err.message,
      userId: req.user?.id,
    });
    next(err);
  }
};

// Update a review
const updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { title, content, rating, ratings } = req.body;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);

    if (!review) {
      throw new NotFoundError("Review not found");
    }

    // Check if user owns this review
    if (review.user.toString() !== userId) {
      throw new ValidationError("Access denied");
    }

    // Update review
    const updatedReview = await Review.findByIdAndUpdate(
      reviewId,
      { title, content, rating, ratings },
      { new: true, runValidators: true }
    ).populate("user", "name email");

    info("Review updated", {
      reviewId,
      userId,
    });

    // Broadcast review update to all connected clients
    websocketService.broadcastReviewUpdated(updatedReview.toObject());

    // Update and broadcast destination rating
    try {
      const ratingStats = await Review.aggregate([
        {
          $match: {
            destination: review.destination,
            status: "approved",
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      if (ratingStats.length > 0) {
        const stats = ratingStats[0];
        websocketService.broadcastDestinationRatingUpdated(
          review.destination.toString(),
          {
            averageRating: Math.round(stats.averageRating * 10) / 10,
            totalReviews: stats.totalReviews,
          }
        );
      }
    } catch (ratingError) {
      error("Failed to broadcast destination rating", {
        error: ratingError.message,
        destinationId: review.destination,
      });
    }

    sendSuccess(res, 200, "Review updated successfully", {
      review: updatedReview,
    });
  } catch (err) {
    error("Error updating review", {
      error: err.message,
      reviewId: req.params.reviewId,
    });
    next(err);
  }
};

// Delete a review
const deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);

    if (!review) {
      throw new NotFoundError("Review not found");
    }

    // Check if user owns this review or is admin
    if (review.user.toString() !== userId && req.user.role !== "admin") {
      throw new ValidationError("Access denied");
    }

    const destinationId = review.destination.toString();
    await Review.findByIdAndDelete(reviewId);

    info("Review deleted", {
      reviewId,
      userId,
      deletedBy: req.user.role,
    });

    // Broadcast review deletion to all connected clients
    websocketService.broadcastReviewDeleted(reviewId, destinationId);

    // Update and broadcast destination rating
    try {
      const ratingStats = await Review.aggregate([
        {
          $match: {
            destination: new mongoose.Types.ObjectId(destinationId),
            status: "approved",
          },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      const stats =
        ratingStats.length > 0
          ? {
              averageRating: Math.round(ratingStats[0].averageRating * 10) / 10,
              totalReviews: ratingStats[0].totalReviews,
            }
          : { averageRating: 0, totalReviews: 0 };

      websocketService.broadcastDestinationRatingUpdated(destinationId, stats);
    } catch (ratingError) {
      error("Failed to broadcast destination rating", {
        error: ratingError.message,
        destinationId,
      });
    }

    sendSuccess(res, 200, "Review deleted successfully");
  } catch (err) {
    error("Error deleting review", {
      error: err.message,
      reviewId: req.params.reviewId,
    });
    next(err);
  }
};

// Mark review as helpful
const markReviewHelpful = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findById(reviewId);

    if (!review) {
      throw new NotFoundError("Review not found");
    }

    // Check if user already marked this review as helpful
    const isAlreadyHelpful = review.helpfulUsers.includes(userId);

    if (isAlreadyHelpful) {
      // Remove helpful vote
      review.helpfulUsers = review.helpfulUsers.filter(
        (id) => id.toString() !== userId
      );
      review.helpfulVotes = Math.max(0, review.helpfulVotes - 1);
    } else {
      // Add helpful vote
      review.helpfulUsers.push(userId);
      review.helpfulVotes += 1;
    }

    await review.save();

    // Broadcast helpful vote update via WebSocket
    try {
      websocketService.broadcastReviewHelpfulUpdated(reviewId, {
        helpfulVotes: review.helpfulVotes,
      });
    } catch (wsError) {
      // Log error but don't fail the operation
      error("Failed to broadcast helpful vote update", {
        error: wsError.message,
        reviewId,
      });
    }

    sendSuccess(
      res,
      200,
      `Review ${isAlreadyHelpful ? "unmarked" : "marked"} as helpful`,
      {
        helpful: !isAlreadyHelpful,
        helpfulVotes: review.helpfulVotes,
      }
    );
  } catch (err) {
    error("Error marking review helpful", {
      error: err.message,
      reviewId: req.params.reviewId,
    });
    next(err);
  }
};

// Get all reviews (admin only)
const getAllReviews = async (req, res, next) => {
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

    // Get reviews with pagination
    const reviews = await Review.find(query)
      .populate("destination", "title location")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Get total count
    const total = await Review.countDocuments(query);

    sendSuccess(res, 200, "All reviews retrieved successfully", {
      reviews,
      pagination: {
        current: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
        total,
      },
    });
  } catch (err) {
    error("Error fetching all reviews", { error: err.message });
    next(err);
  }
};

// Update review status (admin only)
const updateReviewStatus = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { status, adminResponse } = req.body;

    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      throw new ValidationError("Invalid review status");
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      throw new NotFoundError("Review not found");
    }

    // Update review status
    review.status = status;

    // Add admin response if provided
    if (adminResponse) {
      review.adminResponse = {
        content: adminResponse,
        respondedBy: req.user.id,
        respondedAt: new Date(),
      };
    }

    await review.save();

    // Populate the review
    await review.populate([
      { path: "user", select: "name email" },
      { path: "destination", select: "title location" },
    ]);

    info("Review status updated", {
      reviewId,
      newStatus: status,
      adminId: req.user.id,
    });

    sendSuccess(res, 200, "Review status updated successfully", { review });
  } catch (err) {
    error("Error updating review status", {
      error: err.message,
      reviewId: req.params.reviewId,
    });
    next(err);
  }
};

module.exports = {
  createReview,
  getDestinationReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  markReviewHelpful,
  getAllReviews,
  updateReviewStatus,
};
