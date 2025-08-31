const Destination = require("../models/destination.model");
const { ValidationError } = require("../utils/errors");

const destinationController = {
  // Get all destinations
  getAllDestinations: async function (req, res, next) {
    try {
      const { category, featured, search, from, to, date, guests } = req.query;
      const query = {};

      // Basic filters
      if (category) {
        query.category = category;
      }

      if (featured === "true") {
        query.featured = true;
      }

      // Advanced search functionality
      const searchConditions = [];
      
      // If search parameter is provided (general search)
      if (search) {
        searchConditions.push(
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } }
        );
      }
      
      // If destination (to) is provided
      if (to) {
        searchConditions.push(
          { location: { $regex: to, $options: "i" } },
          { title: { $regex: to, $options: "i" } }
        );
      }
      
      // If departure location (from) is provided
      // Note: This is a simplified approach since our model doesn't have a "from" field
      // In a real app, you might have a different model structure
      if (from) {
        // We could use this to filter based on proximity or routes
        // For now, we'll just log it
        console.log(`Search request with departure location: ${from}`);
      }
      
      // If date is provided
      if (date) {
        // In a real app, you would filter based on availability on this date
        // For now, we'll just log it
        console.log(`Search request for date: ${date}`);
      }
      
      // If guests count is provided
      if (guests) {
        // In a real app, you would filter based on capacity
        // For now, we'll just log it
        console.log(`Search request for ${guests}`);
      }
      
      // Add search conditions to query if any exist
      if (searchConditions.length > 0) {
        query.$or = searchConditions;
      }

      const destinations = await Destination.find(query);
      
      // Log the search for analytics purposes
      console.log(`Search performed with params:`, {
        category, featured, search, from, to, date, guests,
        resultsCount: destinations.length
      });
      
      res.status(200).json({
        success: true,
        data: {
          destinations,
        },
        message: "Destinations retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // Get destination by ID
  getDestinationById: async function (req, res, next) {
    try {
      const destination = await Destination.findById(req.params.id);
      if (!destination) {
        throw new ValidationError("Destination not found");
      }
      res.status(200).json({
        success: true,
        data: {
          destination,
        },
        message: "Destination retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new destination (admin only)
  createDestination: async function (req, res, next) {
    try {
      const destination = await Destination.create(req.body);
      res.status(201).json({
        success: true,
        data: {
          destination,
        },
        message: "Destination created successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // Update destination (admin only)
  updateDestination: async function (req, res, next) {
    try {
      const destination = await Destination.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!destination) {
        throw new ValidationError("Destination not found");
      }
      res.status(200).json({
        success: true,
        data: {
          destination,
        },
        message: "Destination updated successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete destination (admin only)
  deleteDestination: async function (req, res, next) {
    try {
      const destination = await Destination.findByIdAndDelete(req.params.id);
      if (!destination) {
        throw new ValidationError("Destination not found");
      }
      res.status(200).json({
        success: true,
        message: "Destination deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = destinationController;
