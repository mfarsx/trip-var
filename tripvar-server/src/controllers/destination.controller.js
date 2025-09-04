const Destination = require('../public/models/destination.model');
const { ValidationError } = require('../utils/errors');
const { info } = require('../utils/logger');

const destinationController = {
  // Get all destinations
  getAllDestinations: async function(req, res, next) {
    try {
      const { category, featured, search, from, to, date, guests, page = 1, limit = 20 } = req.query;
      const query = {};

      // Basic filters
      if (category) {
        query.category = category;
      }

      if (featured === 'true') {
        query.featured = true;
      }

      // Advanced search functionality
      const searchConditions = [];

      // If search parameter is provided (general search)
      if (search) {
        searchConditions.push(
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        );
      }

      // If destination (to) is provided
      if (to) {
        searchConditions.push(
          { location: { $regex: to, $options: 'i' } },
          { title: { $regex: to, $options: 'i' } }
        );
      }

      // If departure location (from) is provided
      // Note: This is a simplified approach since our model doesn't have a "from" field
      // In a real app, you might have a different model structure
      if (from) {
        // We could use this to filter based on proximity or routes
        // For now, we'll just log it
        info(`Search request with departure location: ${from}`);
      }

      // If date is provided
      if (date) {
        // In a real app, you would filter based on availability on this date
        // For now, we'll just log it
        info(`Search request for date: ${date}`);
      }

      // If guests count is provided
      if (guests) {
        // In a real app, you would filter based on capacity
        // For now, we'll just log it
        info(`Search request for ${guests} guests`);
      }

      // Add search conditions to query if any exist
      if (searchConditions.length > 0) {
        query.$or = searchConditions;
      }

      // Calculate pagination
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Get destinations with pagination
      const destinations = await Destination.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      // Get total count for pagination info
      const total = await Destination.countDocuments(query);

      // Log the search for analytics purposes
      info('Search performed', {
        category, featured, search, from, to, date, guests, page: pageNum, limit: limitNum,
        resultsCount: destinations.length,
        totalCount: total
      });

      res.status(200).json({
        status: 'success',
        data: {
          destinations,
          pagination: {
            current: pageNum,
            pages: Math.ceil(total / limitNum),
            total
          }
        },
        message: 'Destinations retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get destination by ID
  getDestinationById: async function(req, res, next) {
    try {
      // Check if ID is valid MongoDB ObjectId format
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ValidationError('Invalid ID format');
      }
      
      const destination = await Destination.findById(req.params.id);
      if (!destination) {
        const error = new ValidationError('Destination not found');
        error.code = 'NOT_FOUND';
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        status: 'success',
        data: {
          destination
        },
        message: 'Destination retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new destination (admin only)
  createDestination: async function(req, res, next) {
    try {
      const destination = await Destination.create(req.body);
      res.status(201).json({
        status: 'success',
        data: {
          destination
        },
        message: 'Destination created successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Update destination (admin only)
  updateDestination: async function(req, res, next) {
    try {
      // Check if ID is valid MongoDB ObjectId format
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ValidationError('Invalid ID format');
      }
      
      const destination = await Destination.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!destination) {
        const error = new ValidationError('Destination not found');
        error.code = 'NOT_FOUND';
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        status: 'success',
        data: {
          destination
        },
        message: 'Destination updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete destination (admin only)
  deleteDestination: async function(req, res, next) {
    try {
      // Check if ID is valid MongoDB ObjectId format
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ValidationError('Invalid ID format');
      }
      
      const destination = await Destination.findByIdAndDelete(req.params.id);
      if (!destination) {
        const error = new ValidationError('Destination not found');
        error.code = 'NOT_FOUND';
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({
        status: 'success',
        message: 'Destination deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = destinationController;
