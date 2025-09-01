const express = require("express");
const { ValidationError } = require("../utils/errors");
const authRoutes = require("./auth.routes");
const destinationRoutes = require("./destination.routes");
const bookingRoutes = require("./booking.routes");
const { redisCache, redisUtils } = require("../middleware/redisCache");
const router = express.Router();

// Mount auth routes
router.use("/auth", authRoutes);
router.use("/destinations", destinationRoutes);
router.use("/bookings", bookingRoutes);

// Example error endpoint
router.get("/error-example", (req, res, next) => {
  try {
    // Simulating a validation error
    throw new ValidationError("This is an example validation error");
  } catch (error) {
    next(error);
  }
});

// Example async error
router.get("/async-error", async (req, res, next) => {
  try {
    // Simulating an async operation that fails
    await Promise.reject(new Error("Async operation failed"));
  } catch (error) {
    next(error);
  }
});

// Redis cache example routes
router.get("/cache-example", redisCache({ ttl: 300 }), (req, res) => {
  // Simulate expensive operation
  const data = {
    message: "This is cached data!",
    timestamp: new Date().toISOString(),
    random: Math.random(),
    expensiveCalculation: Array.from({ length: 1000 }, (_, i) => i * Math.random()).reduce((a, b) => a + b, 0)
  };
  
  res.json(data);
});

// Manual cache operations example
router.get("/cache-manual", async (req, res) => {
  try {
    const cacheKey = "manual-cache-example";
    
    // Try to get from cache first
    let data = await redisUtils.getCache(cacheKey);
    
    if (!data) {
      // Simulate expensive operation
      data = {
        message: "This data was computed and cached manually",
        timestamp: new Date().toISOString(),
        computation: "expensive",
        result: Math.random() * 1000
      };
      
      // Cache for 5 minutes
      await redisUtils.setCache(cacheKey, data, 300);
    } else {
      data.fromCache = true;
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Cache operation failed", message: error.message });
  }
});

// Session example
router.get("/session-example", (req, res) => {
  const sessionData = req.session || {};
  const visitCount = (sessionData.visitCount || 0) + 1;
  
  // Update session
  req.session = { ...sessionData, visitCount, lastVisit: new Date().toISOString() };
  
  res.json({
    message: "Session data example",
    visitCount,
    sessionId: req.cookies?.sessionId,
    sessionData: req.session
  });
});

// Clear cache endpoint (for testing)
router.post("/clear-cache", async (req, res) => {
  try {
    const { pattern = "cache:*" } = req.body;
    const { getRedisClient } = require("../config/redis");
    const client = getRedisClient();
    const keys = await client.keys(pattern);
    
    if (keys.length > 0) {
      await client.del(...keys);
      res.json({ message: `Cleared ${keys.length} cache entries`, pattern, keys });
    } else {
      res.json({ message: "No cache entries found", pattern });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to clear cache", message: error.message });
  }
});

module.exports = router;
