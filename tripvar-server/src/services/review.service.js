const BaseService = require('./base.service');

class ReviewService extends BaseService {
  constructor(repository) {
    super(repository);
  }

  // Create a new review
  async createReview(reviewData) {
    try {
      // Check if user has already reviewed this destination
      const existingReview = await this.repository.hasUserReviewed(
        reviewData.user,
        reviewData.destination
      );

      if (existingReview) {
        throw new Error('User has already reviewed this destination');
      }

      const review = await this.repository.create(reviewData);
      
      // Update destination rating
      await this.updateDestinationRating(reviewData.destination);
      
      return review;
    } catch (error) {
      throw error;
    }
  }

  // Get reviews by destination
  async getReviewsByDestination(destinationId) {
    try {
      return await this.repository.findByDestination(destinationId);
    } catch (error) {
      throw error;
    }
  }

  // Get reviews by user
  async getReviewsByUser(userId) {
    try {
      return await this.repository.findByUser(userId);
    } catch (error) {
      throw error;
    }
  }

  // Get reviews by rating
  async getReviewsByRating(rating) {
    try {
      return await this.repository.findByRating(rating);
    } catch (error) {
      throw error;
    }
  }

  // Get recent reviews
  async getRecentReviews(limit = 10) {
    try {
      return await this.repository.findRecent(limit);
    } catch (error) {
      throw error;
    }
  }

  // Get reviews with photos
  async getReviewsWithPhotos() {
    try {
      return await this.repository.findWithPhotos();
    } catch (error) {
      throw error;
    }
  }

  // Get average rating for destination
  async getAverageRatingForDestination(destinationId) {
    try {
      return await this.repository.getAverageRating(destinationId);
    } catch (error) {
      throw error;
    }
  }

  // Get rating distribution for destination
  async getRatingDistributionForDestination(destinationId) {
    try {
      return await this.repository.getRatingDistribution(destinationId);
    } catch (error) {
      throw error;
    }
  }

  // Update review helpfulness
  async updateReviewHelpfulness(reviewId, helpfulCount) {
    try {
      return await this.repository.updateHelpfulness(reviewId, helpfulCount);
    } catch (error) {
      throw error;
    }
  }

  // Update destination rating after review changes
  async updateDestinationRating(destinationId) {
    try {
      const ratingData = await this.repository.getAverageRating(destinationId);
      
      // Update destination model with new rating
      const Destination = require('../public/models/destination.model');
      await Destination.findByIdAndUpdate(destinationId, {
        averageRating: ratingData.averageRating,
        reviewCount: ratingData.totalReviews
      });

      return ratingData;
    } catch (error) {
      throw error;
    }
  }

  // Get review statistics
  async getReviewStatistics() {
    try {
      return await this.repository.getStatistics();
    } catch (error) {
      throw error;
    }
  }

  // Check if user can review destination
  async canUserReviewDestination(userId, destinationId) {
    try {
      // Check if user has already reviewed
      const hasReviewed = await this.repository.hasUserReviewed(userId, destinationId);
      
      if (hasReviewed) {
        return { canReview: false, reason: 'User has already reviewed this destination' };
      }

      // Check if user has any bookings for this destination
      const Booking = require('../public/models/booking.model');
      const hasBooking = await Booking.findOne({
        user: userId,
        destination: destinationId,
        status: 'confirmed'
      });

      if (!hasBooking) {
        return { canReview: false, reason: 'User must have a confirmed booking to review' };
      }

      return { canReview: true };
    } catch (error) {
      throw error;
    }
  }

  // Get reviews with pagination
  async getReviewsWithPagination(destinationId, page = 1, limit = 10) {
    try {
      const reviews = await this.repository.findByDestination(destinationId);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const paginatedReviews = reviews.slice(startIndex, endIndex);
      
      return {
        reviews: paginatedReviews,
        pagination: {
          page,
          limit,
          total: reviews.length,
          pages: Math.ceil(reviews.length / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ReviewService;