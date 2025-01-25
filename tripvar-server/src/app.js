const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const healthRoutes = require("./routes/health.routes");
const errorHandler = require("./middleware/errorHandler");
const requestLogger = require("./middleware/requestLogger");
const { NotFoundError } = require("./utils/errors");
const { error } = require("./utils/logger");
const connectDB = require("./config/database");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check routes (outside of versioned API)
app.use("/health", healthRoutes);

// API routes
app.use("/api/v1", routes);

// 404 handler for undefined routes
app.all("*", (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

// Global error handler
app.use((err, req, res, next) => {
  error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  errorHandler(err, req, res, next);
});

module.exports = app;
