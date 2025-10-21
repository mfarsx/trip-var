const Destination = require("../public/models/destination.model");
const SearchAnalytics = require("../public/models/searchAnalytics.model");
const { ValidationError } = require("../utils/errors");
const { info } = require("../utils/logger");
const AvailabilityChecker = require("../utils/availabilityChecker");
const cacheService = require("../services/cache.service");

const destinationController = {
  // Get all destinations
  getAllDestinations: async function (req, res, next) {
    const startTime = Date.now();

    try {
      const {
        category,
        featured,
        search,
        from,
        to,
        date,
        guests,
        page = 1,
        limit = 20,
        minPrice,
        maxPrice,
        minRating,
      } = req.query;

      // Generate cache key
      const cacheKey = cacheService.generateKey(
        "destinations",
        category,
        featured,
        search,
        from,
        to,
        date,
        guests,
        page,
        limit,
        minPrice,
        maxPrice,
        minRating
      );

      // Try to get from cache
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        info("Returning cached destinations");
        return res.status(200).json(cached);
      }

      const query = {};

      // Basic filters
      if (category) {
        query.category = category;
      }

      if (featured === "true") {
        query.featured = true;
      }

      // Price range filter
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) {
          query.price.$gte = parseFloat(minPrice);
        }
        if (maxPrice) {
          query.price.$lte = parseFloat(maxPrice);
        }
      }

      // Rating filter
      if (minRating) {
        query.rating = { $gte: parseFloat(minRating) };
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

      // Add search conditions to query if any exist
      if (searchConditions.length > 0) {
        query.$or = searchConditions;
      }

      // Calculate pagination
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Get destinations with pagination
      let destinations = await Destination.find(query)
        .sort({ rating: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      // Guest capacity filtering (post-query)
      if (guests) {
        const guestCount = parseInt(guests, 10);
        destinations = destinations.filter((dest) => {
          const capacityCheck = AvailabilityChecker.checkGuestCapacity(
            dest,
            guestCount
          );
          return capacityCheck.valid;
        });
        info(`Filtered destinations by guest capacity: ${guestCount}`);
      }

      // Date availability filtering (post-query)
      if (date) {
        const checkDate = new Date(date);
        const endDate = new Date(checkDate);
        endDate.setDate(endDate.getDate() + 1); // Default 1-day stay

        const availabilityPromises = destinations.map(async (dest) => {
          const availability = await AvailabilityChecker.checkAvailability(
            dest._id,
            checkDate,
            endDate,
            guests ? parseInt(guests, 10) : 2
          );
          return { dest, available: availability.available };
        });

        const results = await Promise.all(availabilityPromises);
        destinations = results.filter((r) => r.available).map((r) => r.dest);
        info(`Filtered destinations by date availability: ${date}`);
      }

      // Get total count for pagination info
      const total = await Destination.countDocuments(query);

      const responseData = {
        status: "success",
        data: {
          destinations,
          pagination: {
            current: pageNum,
            pages: Math.ceil(total / limitNum),
            total,
            filtered: destinations.length,
          },
          filters: {
            category,
            featured,
            search,
            from,
            to,
            date,
            guests,
            minPrice,
            maxPrice,
            minRating,
          },
          cached: false,
        },
        message: "Destinations retrieved successfully",
      };

      // Cache the response for 5 minutes
      await cacheService.set(cacheKey, responseData, 5 * 60 * 1000);

      // Track search analytics (async, don't wait)
      const responseTime = Date.now() - startTime;
      SearchAnalytics.create({
        searchTerm: search || to,
        filters: {
          category,
          featured: featured === "true",
          from,
          to,
          date: date ? new Date(date) : undefined,
          guests: guests ? parseInt(guests, 10) : undefined,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          minRating: minRating ? parseFloat(minRating) : undefined,
        },
        resultsCount: destinations.length,
        userId: req.user?._id,
        sessionId: req.sessionID,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        responseTime,
      }).catch((err) => {
        info("Error saving search analytics:", err);
      });

      info("Search performed", {
        category,
        featured,
        search,
        from,
        to,
        date,
        guests,
        minPrice,
        maxPrice,
        minRating,
        page: pageNum,
        limit: limitNum,
        resultsCount: destinations.length,
        totalCount: total,
        responseTime: `${responseTime}ms`,
      });

      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  },

  // Get destination by ID
  getDestinationById: async function (req, res, next) {
    try {
      // Check if ID is valid MongoDB ObjectId format
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ValidationError("Invalid ID format");
      }

      // Check cache first
      const cacheKey = cacheService.generateKey("destination", req.params.id);
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        info(`Returning cached destination: ${req.params.id}`);
        return res.status(200).json(cached);
      }

      const destination = await Destination.findById(req.params.id);
      if (!destination) {
        const error = new ValidationError("Destination not found");
        error.code = "NOT_FOUND";
        error.statusCode = 404;
        throw error;
      }

      const responseData = {
        status: "success",
        data: {
          destination,
        },
        message: "Destination retrieved successfully",
      };

      // Cache for 10 minutes
      await cacheService.set(cacheKey, responseData, 10 * 60 * 1000);

      res.status(200).json(responseData);
    } catch (error) {
      next(error);
    }
  },

  // Check destination availability
  checkAvailability: async function (req, res, next) {
    try {
      const { id } = req.params;
      const { startDate, endDate, guests = 2 } = req.query;

      // Validate ID
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ValidationError("Invalid destination ID format");
      }

      // Validate dates
      if (!startDate || !endDate) {
        throw new ValidationError("Start date and end date are required");
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const guestCount = parseInt(guests, 10);

      // Validate dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new ValidationError("Invalid date format");
      }

      if (start >= end) {
        throw new ValidationError("End date must be after start date");
      }

      if (start < new Date()) {
        throw new ValidationError("Start date cannot be in the past");
      }

      // Check availability
      const availability = await AvailabilityChecker.checkAvailability(
        id,
        start,
        end,
        guestCount
      );

      res.status(200).json({
        status: "success",
        data: {
          availability,
          destination: id,
          requestedDates: {
            startDate: start,
            endDate: end,
          },
          guests: guestCount,
        },
        message: availability.available
          ? "Destination is available"
          : "Destination is not available",
      });
    } catch (error) {
      next(error);
    }
  },

  // Create new destination (admin only)
  createDestination: async function (req, res, next) {
    try {
      const destination = await Destination.create(req.body);

      // Clear destinations cache
      await cacheService.deletePattern("destinations:*");
      info("Cleared destinations cache after creation");

      res.status(201).json({
        status: "success",
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
      // Check if ID is valid MongoDB ObjectId format
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ValidationError("Invalid ID format");
      }

      const destination = await Destination.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!destination) {
        const error = new ValidationError("Destination not found");
        error.code = "NOT_FOUND";
        error.statusCode = 404;
        throw error;
      }

      // Clear cache for this destination and list
      await cacheService.delete(
        cacheService.generateKey("destination", req.params.id)
      );
      await cacheService.deletePattern("destinations:*");
      info(`Cleared cache for destination: ${req.params.id}`);

      res.status(200).json({
        status: "success",
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
      // Check if ID is valid MongoDB ObjectId format
      if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ValidationError("Invalid ID format");
      }

      const destination = await Destination.findByIdAndDelete(req.params.id);
      if (!destination) {
        const error = new ValidationError("Destination not found");
        error.code = "NOT_FOUND";
        error.statusCode = 404;
        throw error;
      }

      // Clear cache for this destination and list
      await cacheService.delete(
        cacheService.generateKey("destination", req.params.id)
      );
      await cacheService.deletePattern("destinations:*");
      info(`Cleared cache for deleted destination: ${req.params.id}`);

      res.status(200).json({
        status: "success",
        message: "Destination deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = destinationController;
