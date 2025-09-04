const BaseRepository = require('./base.repository');

class ReviewRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  // Find reviews by destination
  async findByDestination(destinationId) {
    try {
      return await this.model
        .find({ destination: destinationId })
        .populate('user', 'name email avatar')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Find reviews by user
  async findByUser(userId) {
    try {
      return await this.model
        .find({ user: userId })
        .populate('destination', 'name city country')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Find reviews by rating
  async findByRating(rating) {
    try {
      return await this.model
        .find({ rating })
        .populate('user destination')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Find reviews by date range
  async findByDateRange(startDate, endDate) {
    try {
      return await this.model
        .find({
          createdAt: { $gte: startDate, $lte: endDate }
        })
        .populate('user destination')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Get average rating for a destination
  async getAverageRating(destinationId) {
    try {
      const result = await this.model.aggregate([
        { $match: { destination: destinationId } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);
      return result[0] || { averageRating: 0, totalReviews: 0 };
    } catch (error) {
      throw error;
    }
  }

  // Get rating distribution for a destination
  async getRatingDistribution(destinationId) {
    try {
      const result = await this.model.aggregate([
        { $match: { destination: destinationId } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } }
      ]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Find recent reviews
  async findRecent(limit = 10) {
    try {
      return await this.model
        .find()
        .populate('user', 'name avatar')
        .populate('destination', 'name city country')
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      throw error;
    }
  }

  // Find reviews with photos
  async findWithPhotos() {
    try {
      return await this.model
        .find({ photos: { $exists: true, $not: { $size: 0 } } })
        .populate('user destination')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Check if user has reviewed destination
  async hasUserReviewed(userId, destinationId) {
    try {
      const review = await this.model.findOne({
        user: userId,
        destination: destinationId
      });
      return !!review;
    } catch (error) {
      throw error;
    }
  }

  // Get review statistics
  async getStatistics() {
    try {
      const stats = await this.model.aggregate([
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: '$rating' },
            totalWithPhotos: {
              $sum: {
                $cond: [
                  { $gt: [{ $size: { $ifNull: ['$photos', []] } }, 0] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);
      return stats[0] || { totalReviews: 0, averageRating: 0, totalWithPhotos: 0 };
    } catch (error) {
      throw error;
    }
  }

  // Update review helpfulness
  async updateHelpfulness(reviewId, helpfulCount) {
    try {
      return await this.model.findByIdAndUpdate(
        reviewId,
        { $set: { helpfulCount } },
        { new: true }
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ReviewRepository;