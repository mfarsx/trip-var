const userRepository = require('../repositories/user.repository');
const { ValidationError, UnauthorizedError, NotFoundError, ConflictError } = require('../utils/errors');
const { redisUtils } = require('../middleware/redisCache');
const COUNTRIES = require('../utils/countries');
const BaseService = require('./base.service');

class UserService extends BaseService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User and token
   */
  async register(userData) {
    const { email, password, name, dateOfBirth, nationality } = userData;

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // Format dateOfBirth to handle timezone issues
    const formattedDateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined;

    // Create new user
    const user = await userRepository.create({
      email,
      password,
      name,
      dateOfBirth: formattedDateOfBirth,
      nationality
    });

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from output
    user.password = undefined;

    return { user, token };
  }

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} User and token
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Check if email and password exist
    if (!email || !password) {
      throw new ValidationError('Please provide email and password');
    }

    // Check if user exists && password is correct
    const user = await userRepository.findByEmailWithPassword(email);

    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate token
    const token = user.generateAuthToken();

    // Remove password from output
    user.password = undefined;

    return { user, token };
  }

  /**
   * Get user profile by ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile with computed fields
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId, {
      select: '-password',
      lean: true
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Calculate age if dateOfBirth exists
    if (user.dateOfBirth) {
      user.age = this.calculateAge(user.dateOfBirth);
    }

    // Get country code if nationality exists
    if (user.nationality) {
      const country = COUNTRIES.find(c => c.name === user.nationality);
      if (country) {
        user.countryCode = country.code;
      }
    }

    return user;
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user profile
   */
  async updateProfile(userId, updateData) {
    // Don't allow password updates here
    if (updateData.password) {
      throw new ValidationError(
        'This route is not for password updates. Please use /auth/update-password'
      );
    }

    // Filter out unwanted fields that are not allowed to be updated
    const filteredData = this.filterAllowedFields(updateData, 'name', 'email', 'dateOfBirth', 'nationality');

    const updatedUser = await userRepository.updateById(userId, filteredData, {
      select: '-password'
    });

    // Calculate age if dateOfBirth exists
    if (updatedUser.dateOfBirth) {
      updatedUser.age = this.calculateAge(updatedUser.dateOfBirth);
    }

    // Get country code if nationality exists
    if (updatedUser.nationality) {
      const country = COUNTRIES.find(c => c.name === updatedUser.nationality);
      if (country) {
        updatedUser.countryCode = country.code;
      }
    }

    return updatedUser;
  }

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {Object} passwordData - Current and new password
   * @returns {Promise<Object>} New token
   */
  async updatePassword(userId, passwordData) {
    const { currentPassword, newPassword } = passwordData;

    if (!currentPassword || !newPassword) {
      throw new ValidationError('Please provide current and new password');
    }

    const user = await userRepository.findById(userId, { select: '+password' });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!(await user.comparePassword(currentPassword))) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    await userRepository.updatePassword(userId, newPassword);

    // Get updated user to generate new token
    const updatedUser = await userRepository.findById(userId);
    const token = updatedUser.generateAuthToken();

    return { token };
  }

  /**
   * Delete user account (soft delete)
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteAccount(userId) {
    await userRepository.softDelete(userId);

    // Clear user-related cache
    await this.clearUserCache(userId);
  }

  /**
   * Get all users (admin only)
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of users
   */
  async getAllUsers(options = {}) {
    const { page = 1, limit = 10, active = true } = options;

    const result = await userRepository.findActiveWithPagination({}, {
      page,
      limit,
      select: '-password'
    });

    return result;
  }

  /**
   * Toggle favorite destination
   * @param {string} userId - User ID
   * @param {string} destinationId - Destination ID
   * @returns {Promise<Object>} Updated favorites
   */
  async toggleFavorite(userId, destinationId) {
    if (!destinationId) {
      throw new ValidationError('Destination ID is required');
    }

    const result = await userRepository.toggleFavorite(userId, destinationId);

    // Clear user cache
    await this.clearUserCache(userId);

    return {
      isFavorite: result.isFavorite,
      favorites: result.user.favorites
    };
  }

  /**
   * Get user's favorite destinations
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Favorite destinations
   */
  async getFavorites(userId) {
    return await userRepository.getFavorites(userId);
  }

  /**
   * Calculate age from date of birth
   * @param {Date} dateOfBirth - Date of birth
   * @returns {number} Age
   */
  calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Filter object to only include allowed fields
   * @param {Object} obj - Object to filter
   * @param {...string} allowedFields - Allowed field names
   * @returns {Object} Filtered object
   */
  filterAllowedFields(obj, ...allowedFields) {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) {
        newObj[el] = obj[el];
      }
    });
    return newObj;
  }

  /**
   * Clear user-related cache
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async clearUserCache(userId) {
    try {
      const cacheKeys = [
        `user:${userId}`,
        `user:profile:${userId}`,
        `user:favorites:${userId}`
      ];

      await Promise.all(
        cacheKeys.map(key => this.deleteCachedData(key))
      );
    } catch (error) {
      // Log error but don't throw - cache clearing is not critical
      console.warn('Failed to clear user cache:', error.message);
    }
  }

  /**
   * Get user by ID with caching
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserById(userId) {
    const cacheKey = `user:${userId}`;

    try {
      // Try to get from cache first
      let user = await this.getCachedData(cacheKey);

      if (!user) {
        user = await userRepository.findById(userId, {
          select: '-password',
          lean: true
        });

        if (user) {
          // Cache for 15 minutes
          await this.cacheData(cacheKey, user, 900);
        }
      }

      return user;
    } catch (error) {
      // If cache fails, fall back to database
      return await userRepository.findById(userId, {
        select: '-password',
        lean: true
      });
    }
  }
}

module.exports = new UserService();