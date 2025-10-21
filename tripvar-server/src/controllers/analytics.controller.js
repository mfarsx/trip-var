const SearchAnalytics = require("../public/models/searchAnalytics.model");
const Destination = require("../public/models/destination.model");
const Booking = require("../public/models/booking.model");
const { info } = require("../utils/logger");

const analyticsController = {
  // Get search analytics dashboard data
  getDashboard: async function (req, res, next) {
    try {
      const { startDate, endDate, limit = 10 } = req.query;

      // Default to last 30 days
      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const matchStage = {
        timestamp: { $gte: start, $lte: end },
      };

      // Get most searched terms
      const topSearchTerms = await SearchAnalytics.aggregate([
        { $match: { ...matchStage, searchTerm: { $exists: true, $ne: null } } },
        {
          $group: {
            _id: "$searchTerm",
            count: { $sum: 1 },
            avgResults: { $avg: "$resultsCount" },
            avgResponseTime: { $avg: "$responseTime" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: parseInt(limit, 10) },
        {
          $project: {
            term: "$_id",
            count: 1,
            avgResults: { $round: ["$avgResults", 0] },
            avgResponseTime: { $round: ["$avgResponseTime", 0] },
            _id: 0,
          },
        },
      ]);

      // Get most popular categories
      const topCategories = await SearchAnalytics.aggregate([
        {
          $match: {
            ...matchStage,
            "filters.category": { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: "$filters.category",
            count: { $sum: 1 },
            avgResults: { $avg: "$resultsCount" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: parseInt(limit, 10) },
        {
          $project: {
            category: "$_id",
            count: 1,
            avgResults: { $round: ["$avgResults", 0] },
            _id: 0,
          },
        },
      ]);

      // Get most popular destinations
      const topDestinations = await SearchAnalytics.aggregate([
        {
          $match: {
            ...matchStage,
            "filters.to": { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: "$filters.to",
            count: { $sum: 1 },
            avgResults: { $avg: "$resultsCount" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: parseInt(limit, 10) },
        {
          $project: {
            destination: "$_id",
            count: 1,
            avgResults: { $round: ["$avgResults", 0] },
            _id: 0,
          },
        },
      ]);

      // Get search trends over time (daily)
      const searchTrends = await SearchAnalytics.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
            },
            totalSearches: { $sum: 1 },
            avgResults: { $avg: "$resultsCount" },
            avgResponseTime: { $avg: "$responseTime" },
            uniqueUsers: { $addToSet: "$userId" },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            date: "$_id",
            totalSearches: 1,
            avgResults: { $round: ["$avgResults", 0] },
            avgResponseTime: { $round: ["$avgResponseTime", 0] },
            uniqueUsers: { $size: "$uniqueUsers" },
            _id: 0,
          },
        },
      ]);

      // Get price range preferences
      const priceRanges = await SearchAnalytics.aggregate([
        {
          $match: {
            ...matchStage,
            $or: [
              { "filters.minPrice": { $exists: true } },
              { "filters.maxPrice": { $exists: true } },
            ],
          },
        },
        {
          $group: {
            _id: {
              minPrice: "$filters.minPrice",
              maxPrice: "$filters.maxPrice",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: parseInt(limit, 10) },
      ]);

      // Get guest count preferences
      const guestPreferences = await SearchAnalytics.aggregate([
        {
          $match: {
            ...matchStage,
            "filters.guests": { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: "$filters.guests",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            guests: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ]);

      // Get conversion metrics
      const conversionData = await SearchAnalytics.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalSearches: { $sum: 1 },
            withBookings: {
              $sum: { $cond: [{ $eq: ["$bookingMade", true] }, 1, 0] },
            },
            withClicks: {
              $sum: {
                $cond: [{ $gt: [{ $size: "$clickedDestinations" }, 0] }, 1, 0],
              },
            },
            avgClicksPerSearch: { $avg: { $size: "$clickedDestinations" } },
          },
        },
        {
          $project: {
            totalSearches: 1,
            withBookings: 1,
            withClicks: 1,
            avgClicksPerSearch: { $round: ["$avgClicksPerSearch", 2] },
            conversionRate: {
              $multiply: [
                { $divide: ["$withBookings", "$totalSearches"] },
                100,
              ],
            },
            clickThroughRate: {
              $multiply: [{ $divide: ["$withClicks", "$totalSearches"] }, 100],
            },
            _id: 0,
          },
        },
      ]);

      // Get total statistics
      const totalStats = await SearchAnalytics.countDocuments(matchStage);

      info("Analytics dashboard data retrieved", {
        dateRange: { start, end },
        totalSearches: totalStats,
      });

      res.status(200).json({
        status: "success",
        data: {
          dateRange: { start, end },
          summary: {
            totalSearches: totalStats,
            conversion: conversionData[0] || {},
          },
          topSearchTerms,
          topCategories,
          topDestinations,
          searchTrends,
          priceRanges,
          guestPreferences,
        },
        message: "Analytics data retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // Get real-time search analytics
  getRealTimeStats: async function (req, res, next) {
    try {
      // Get searches from last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const [recentSearches, activeUsers, topSearches] = await Promise.all([
        // Recent search count
        SearchAnalytics.countDocuments({ timestamp: { $gte: oneHourAgo } }),

        // Active users (unique)
        SearchAnalytics.distinct("userId", { timestamp: { $gte: oneHourAgo } }),

        // Top searches in last hour
        SearchAnalytics.aggregate([
          {
            $match: {
              timestamp: { $gte: oneHourAgo },
              searchTerm: { $exists: true, $ne: null },
            },
          },
          {
            $group: {
              _id: "$searchTerm",
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 5 },
          {
            $project: {
              term: "$_id",
              count: 1,
              _id: 0,
            },
          },
        ]),
      ]);

      res.status(200).json({
        status: "success",
        data: {
          lastHour: {
            searches: recentSearches,
            activeUsers: activeUsers.length,
            topSearches,
          },
          timestamp: new Date(),
        },
        message: "Real-time analytics retrieved successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // Track destination click
  trackClick: async function (req, res, next) {
    try {
      const { searchId, destinationId } = req.body;

      if (!searchId || !destinationId) {
        return res.status(400).json({
          status: "error",
          message: "Search ID and Destination ID are required",
        });
      }

      // Update search analytics with clicked destination
      await SearchAnalytics.findByIdAndUpdate(searchId, {
        $push: {
          clickedDestinations: {
            destinationId,
            clickedAt: new Date(),
          },
        },
      });

      res.status(200).json({
        status: "success",
        message: "Click tracked successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  // Track booking conversion
  trackBooking: async function (req, res, next) {
    try {
      const { searchId, bookingId } = req.body;

      if (!searchId || !bookingId) {
        return res.status(400).json({
          status: "error",
          message: "Search ID and Booking ID are required",
        });
      }

      // Update search analytics with booking
      await SearchAnalytics.findByIdAndUpdate(searchId, {
        bookingMade: true,
        bookingId,
      });

      res.status(200).json({
        status: "success",
        message: "Booking conversion tracked successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = analyticsController;
