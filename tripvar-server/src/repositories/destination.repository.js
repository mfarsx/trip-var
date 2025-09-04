const BaseRepository = require('./base.repository');

class DestinationRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  // Find destinations by location
  async findByLocation(location) {
    return await this.model.find({
      $or: [
        { city: { $regex: location, $options: 'i' } },
        { country: { $regex: location, $options: 'i' } },
        { region: { $regex: location, $options: 'i' } }
      ]
    });
  }

  // Find destinations by category
  async findByCategory(category) {
    return await this.model.find({ category });
  }

  // Find destinations by price range
  async findByPriceRange(minPrice, maxPrice) {
    return await this.model.find({
      pricePerNight: {
        $gte: minPrice,
        $lte: maxPrice
      }
    });
  }

  // Find featured destinations
  async findFeatured() {
    return await this.model.find({ isFeatured: true });
  }

  // Search destinations
  async searchDestinations(query, filters = {}) {
    const searchQuery = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } },
        { country: { $regex: query, $options: 'i' } }
      ]
    };

    // Apply additional filters
    if (filters.category) {
      searchQuery.category = filters.category;
    }
    if (filters.minPrice || filters.maxPrice) {
      searchQuery.pricePerNight = {};
      if (filters.minPrice) {
        searchQuery.pricePerNight.$gte = filters.minPrice;
      }
      if (filters.maxPrice) {
        searchQuery.pricePerNight.$lte = filters.maxPrice;
      }
    }
    if (filters.rating) {
      searchQuery.averageRating = { $gte: filters.rating };
    }

    return await this.model.find(searchQuery);
  }

  // Update destination rating
  async updateRating(destinationId, newRating) {
    return await this.model.findByIdAndUpdate(
      destinationId,
      { $set: { averageRating: newRating } },
      { new: true }
    );
  }

  // Get popular destinations
  async getPopular(limit = 10) {
    return await this.model
      .find({ isActive: true })
      .sort({ averageRating: -1, reviewCount: -1 })
      .limit(limit);
  }
}

module.exports = DestinationRepository;