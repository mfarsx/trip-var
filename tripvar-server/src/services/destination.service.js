const BaseService = require('./base.service');

class DestinationService extends BaseService {
  constructor(repository) {
    super(repository);
  }

  // Search destinations
  async searchDestinations(query, filters = {}) {
    try {
      return await this.repository.searchDestinations(query, filters);
    } catch (error) {
      throw error;
    }
  }

  // Get featured destinations
  async getFeaturedDestinations() {
    try {
      return await this.repository.findFeatured();
    } catch (error) {
      throw error;
    }
  }

  // Get popular destinations
  async getPopularDestinations(limit = 10) {
    try {
      return await this.repository.getPopular(limit);
    } catch (error) {
      throw error;
    }
  }

  // Find destinations by location
  async findDestinationsByLocation(location) {
    try {
      return await this.repository.findByLocation(location);
    } catch (error) {
      throw error;
    }
  }

  // Find destinations by category
  async findDestinationsByCategory(category) {
    try {
      return await this.repository.findByCategory(category);
    } catch (error) {
      throw error;
    }
  }

  // Find destinations by price range
  async findDestinationsByPriceRange(minPrice, maxPrice) {
    try {
      return await this.repository.findByPriceRange(minPrice, maxPrice);
    } catch (error) {
      throw error;
    }
  }

  // Update destination rating
  async updateDestinationRating(destinationId, newRating) {
    try {
      return await this.repository.updateRating(destinationId, newRating);
    } catch (error) {
      throw error;
    }
  }

  // Get destination statistics
  async getDestinationStatistics() {
    try {
      const totalDestinations = await this.repository.count();
      const featuredDestinations = await this.repository.findFeatured();
      
      return {
        totalDestinations,
        featuredCount: featuredDestinations.length,
        averageRating: await this.getAverageRating()
      };
    } catch (error) {
      throw error;
    }
  }

  // Get average rating across all destinations
  async getAverageRating() {
    try {
      const destinations = await this.repository.find();
      if (destinations.length === 0) return 0;
      
      const totalRating = destinations.reduce((sum, dest) => sum + (dest.averageRating || 0), 0);
      return totalRating / destinations.length;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DestinationService;