const Destination = require("../models/destination.model");
const { ValidationError } = require("../utils/errors");

const destinationController = {
  // Get all destinations
  getAllDestinations: async function (req, res, next) {
    try {
      const { category, featured, search } = req.query;
      const query = {};

      if (category) {
        query.category = category;
      }

      if (featured === "true") {
        query.featured = true;
      }

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ];
      }

      const destinations = await Destination.find(query);
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
