/* eslint-disable no-param-reassign, class-methods-use-this, space-before-function-paren, no-unused-vars */
const userService = require('../services/user.service');
const BaseController = require('./base.controller');
const { asyncHandler } = require('../utils/asyncHandler');

class AuthController extends BaseController {
  // Register new user
  register = asyncHandler(async (req, res, next) => {
    const result = await userService.register(req.body);
    this.sendSuccess(res, result, 'User registered successfully', 201);
  });

  // Login user
  login = asyncHandler(async (req, res, next) => {
    const result = await userService.login(req.body);
    this.sendSuccess(res, result, 'Login successful');
  });

  // Get current user profile
  getProfile = asyncHandler(async (req, res, next) => {
    const user = await userService.getProfile(req.user.id);
    this.sendSuccess(res, { user }, 'Profile retrieved successfully');
  });

  // Update user profile
  updateProfile = asyncHandler(async (req, res, next) => {
    const updatedUser = await userService.updateProfile(req.user.id, req.body);
    this.sendSuccess(res, { user: updatedUser }, 'Profile updated successfully');
  });

  // Update password
  updatePassword = asyncHandler(async (req, res, next) => {
    const result = await userService.updatePassword(req.user.id, req.body);
    this.sendSuccess(res, result, 'Password updated successfully');
  });

  // Delete user account
  deleteAccount = asyncHandler(async (req, res, next) => {
    await userService.deleteAccount(req.user.id);
    this.sendSuccess(res, null, 'Account deleted successfully', 204);
  });

  // Get all users
  getAllUsers = asyncHandler(async (req, res, next) => {
    const { page, limit } = this.getPaginationParams(req.query);
    const result = await userService.getAllUsers({ page, limit });
    this.sendPaginated(res, result.users, page, limit, result.pagination.total);
  });

  // Logout user
  logout = asyncHandler(async (req, res, next) => {
    // Clear the token from the client side
    this.sendSuccess(res, null, 'Logged out successfully');
  });

  // Toggle favorite destination
  toggleFavorite = asyncHandler(async (req, res, next) => {
    this.validateRequestParams(req.params, ['destinationId']);
    const result = await userService.toggleFavorite(req.user.id, req.params.destinationId);
    this.sendSuccess(res, result, `Destination ${result.isFavorite ? 'added to' : 'removed from'} favorites`);
  });

  // Get user's favorite destinations
  getFavorites = asyncHandler(async (req, res, next) => {
    const favorites = await userService.getFavorites(req.user.id);
    this.sendSuccess(res, { favorites }, 'Favorites retrieved successfully');
  });
}

module.exports = new AuthController();
