const BaseRepository = require('./base.repository');
const User = require('../models/user.model');
const { NotFoundError, ValidationError } = require('../utils/errors');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} Found user
   */
  async findByEmail(email, options = {}) {
    return this.findOne({ email: email.toLowerCase() }, options);
  }

  /**
   * Find user by email with password
   * @param {string} email - User email
   * @returns {Promise<Object|null>} Found user with password
   */
  async findByEmailWithPassword(email) {
    return this.findOne(
      { email: email.toLowerCase() }, 
      { select: '+password' }
    );
  }

  /**
   * Find active users
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Active users
   */
  async findActive(criteria = {}, options = {}) {
    return this.find({ ...criteria, active: true }, options);
  }

  /**
   * Find active users with pagination
   * @param {Object} criteria - Search criteria
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated active users
   */
  async findActiveWithPagination(criteria = {}, options = {}) {
    return this.findWithPagination({ ...criteria, active: true }, options);
  }

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Updated user
   */
  async updatePassword(userId, newPassword) {
    return this.updateById(userId, { 
      password: newPassword,
      passwordChangedAt: new Date()
    });
  }

  /**
   * Add favorite destination
   * @param {string} userId - User ID
   * @param {string} destinationId - Destination ID
   * @returns {Promise<Object>} Updated user
   */
  async addFavorite(userId, destinationId) {
    return this.updateById(userId, {
      $addToSet: { favorites: destinationId }
    });
  }

  /**
   * Remove favorite destination
   * @param {string} userId - User ID
   * @param {string} destinationId - Destination ID
   * @returns {Promise<Object>} Updated user
   */
  async removeFavorite(userId, destinationId) {
    return this.updateById(userId, {
      $pull: { favorites: destinationId }
    });
  }

  /**
   * Toggle favorite destination
   * @param {string} userId - User ID
   * @param {string} destinationId - Destination ID
   * @returns {Promise<Object>} Updated user and favorite status
   */
  async toggleFavorite(userId, destinationId) {
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isFavorite = user.favorites.includes(destinationId);
    
    if (isFavorite) {
      await this.removeFavorite(userId, destinationId);
    } else {
      await this.addFavorite(userId, destinationId);
    }

    // Get updated user
    const updatedUser = await this.findById(userId);
    
    return {
      user: updatedUser,
      isFavorite: !isFavorite
    };
  }

  /**
   * Get user favorites with populated destination data
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User favorites
   */
  async getFavorites(userId) {
    const user = await this.findById(userId, {
      populate: 'favorites',
      select: 'favorites'
    });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user.favorites;
  }

  /**
   * Soft delete user (set active to false)
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated user
   */
  async softDelete(userId) {
    return this.updateById(userId, { active: false });
  }

  /**
   * Restore soft deleted user
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated user
   */
  async restore(userId) {
    return this.updateById(userId, { active: true });
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async getStatistics() {
    const pipeline = [
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$active', true] }, 1, 0] }
          },
          inactiveUsers: {
            $sum: { $cond: [{ $eq: ['$active', false] }, 1, 0] }
          },
          usersWithFavorites: {
            $sum: { $cond: [{ $gt: [{ $size: '$favorites' }, 0] }, 1, 0] }
          }
        }
      }
    ];

    const result = await this.aggregate(pipeline);
    return result[0] || {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      usersWithFavorites: 0
    };
  }

  /**
   * Get users by role
   * @param {string} role - User role
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Users with specified role
   */
  async findByRole(role, options = {}) {
    return this.find({ role }, options);
  }

  /**
   * Update user role
   * @param {string} userId - User ID
   * @param {string} role - New role
   * @returns {Promise<Object>} Updated user
   */
  async updateRole(userId, role) {
    const allowedRoles = ['user', 'admin'];
    
    if (!allowedRoles.includes(role)) {
      throw new ValidationError(`Invalid role. Allowed roles: ${allowedRoles.join(', ')}`);
    }

    return this.updateById(userId, { role });
  }

  /**
   * Search users by name or email
   * @param {string} searchTerm - Search term
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Matching users
   */
  async search(searchTerm, options = {}) {
    const searchCriteria = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    return this.find(searchCriteria, options);
  }

  /**
   * Get users created in date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Users created in range
   */
  async findByDateRange(startDate, endDate, options = {}) {
    const criteria = {
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };

    return this.find(criteria, options);
  }

  /**
   * Get users with most favorites
   * @param {number} limit - Number of users to return
   * @returns {Promise<Array>} Users with most favorites
   */
  async getTopUsersByFavorites(limit = 10) {
    const pipeline = [
      {
        $addFields: {
          favoritesCount: { $size: '$favorites' }
        }
      },
      {
        $sort: { favoritesCount: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          name: 1,
          email: 1,
          favoritesCount: 1,
          createdAt: 1
        }
      }
    ];

    return this.aggregate(pipeline);
  }
}

module.exports = new UserRepository();