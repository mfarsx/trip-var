const BaseRepository = require("./base.repository");

class DestinationRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  // Find destinations by location
  async findByLocation(location) {
    return await this.model.find({
      location: { $regex: location, $options: "i" },
    });
  }

  // Find destinations by category
  async findByCategory(category) {
    return await this.model.find({ category });
  }

  // Find destinations by price range
  async findByPriceRange(minPrice, maxPrice) {
    return await this.model.find({
      price: {
        $gte: minPrice,
        $lte: maxPrice,
      },
    });
  }

  // Find featured destinations
  async findFeatured() {
    return await this.model.find({ featured: true });
  }

  // Search destinations
  async searchDestinations(query, filters = {}) {
    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
      ],
    };

    // Apply additional filters
    if (filters.category) {
      searchQuery.category = filters.category;
    }
    if (filters.minPrice || filters.maxPrice) {
      searchQuery.price = {};
      if (filters.minPrice) {
        searchQuery.price.$gte = filters.minPrice;
      }
      if (filters.maxPrice) {
        searchQuery.price.$lte = filters.maxPrice;
      }
    }
    if (filters.rating) {
      searchQuery.rating = { $gte: filters.rating };
    }

    return await this.model.find(searchQuery);
  }

  // Update destination rating
  async updateRating(destinationId, rating, ratingCount) {
    return await this.model.findByIdAndUpdate(
      destinationId,
      { $set: { rating: rating, ratingCount: ratingCount } },
      { new: true }
    );
  }

  // Get popular destinations
  async getPopular(limit = 10) {
    return await this.model
      .find()
      .sort({ rating: -1, ratingCount: -1 })
      .limit(limit);
  }
}

module.exports = DestinationRepository;
