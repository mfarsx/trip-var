const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const { info, warn, error } = require("../utils/logger");
const config = require("../config/config");

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Map of userId to WebSocket connections
    this.connectionCount = 0;
    this.rateLimitMap = new Map(); // Rate limiting per user
    this.maxMessagesPerMinute = 60; // Rate limit
    this.cleanupInterval = null;
  }

  initialize(server) {
    try {
      console.log("🔌 Creating WebSocket server...");
      this.wss = new WebSocket.Server({
        server,
        path: "/ws",
        verifyClient: this.verifyClient.bind(this),
        maxPayload: 1024 * 1024, // 1MB max payload
        perMessageDeflate: {
          threshold: 1024,
          concurrencyLimit: 10,
          memLevel: 7,
        },
      });

      console.log("🔌 Setting up WebSocket event handlers...");
      this.wss.on("connection", this.handleConnection.bind(this));

      // Handle WebSocket server errors
      this.wss.on("error", (error) => {
        console.error("🚨 WebSocket server error:", error.message);
      });

      // Start cleanup interval for rate limiting
      this.cleanupInterval = setInterval(() => {
        this.cleanupRateLimit();
      }, 60000); // Clean up every minute

      info("WebSocket server initialized", {
        path: "/ws",
        port: config.server.port,
      });
      console.log("✅ WebSocket server setup complete");
    } catch (error) {
      console.error("🚨 WebSocket initialization error:", error.message);
      console.error("Stack trace:", error.stack);
      throw error;
    }
  }

  verifyClient(info) {
    try {
      console.log("🔌 WebSocket connection attempt from:", info.origin);
      const url = new URL(info.req.url, `http://${info.req.headers.host}`);
      const token = url.searchParams.get("token");

      console.log("🔌 WebSocket token present:", !!token);

      if (!token) {
        warn("WebSocket connection attempt without token");
        return false;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, config.jwt.secret);
      info.req.user = decoded;
      console.log(
        "✅ WebSocket authentication successful for user:",
        decoded.id
      );
      return true;
    } catch (err) {
      warn("WebSocket connection with invalid token", { error: err.message });
      console.log("❌ WebSocket authentication failed:", err.message);
      return false;
    }
  }

  handleConnection(ws, req) {
    const user = req.user;
    const userId = user.id;

    this.connectionCount++;
    console.log("🔌 WebSocket client connected:", userId);
    info("WebSocket client connected", {
      userId,
      connectionCount: this.connectionCount,
      userAgent: req.headers["user-agent"],
    });

    // Store the connection
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId).add(ws);

    // Send welcome message
    this.sendToClient(ws, {
      type: "connection_established",
      payload: {
        message: "WebSocket connection established",
        userId,
        timestamp: new Date().toISOString(),
      },
    });

    // Handle incoming messages
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(ws, user, message);
      } catch (err) {
        error("Invalid WebSocket message format", { error: err.message });
        this.sendToClient(ws, {
          type: "error",
          payload: { message: "Invalid message format" },
        });
      }
    });

    // Handle disconnection
    ws.on("close", (code, reason) => {
      this.connectionCount--;
      info("WebSocket client disconnected", {
        userId,
        code,
        reason: reason.toString(),
        connectionCount: this.connectionCount,
      });

      // Remove from clients map
      if (this.clients.has(userId)) {
        this.clients.get(userId).delete(ws);
        if (this.clients.get(userId).size === 0) {
          this.clients.delete(userId);
        }
      }
    });

    // Handle errors
    ws.on("error", (err) => {
      error("WebSocket error", { userId, error: err.message });
    });

    // Send ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000); // Ping every 30 seconds

    ws.on("close", () => {
      clearInterval(pingInterval);
    });
  }

  handleMessage(ws, user, message) {
    // Rate limiting check
    if (!this.checkRateLimit(user.userId)) {
      warn("Rate limit exceeded for user", { userId: user.userId });
      this.sendToClient(ws, {
        type: "error",
        payload: { message: "Rate limit exceeded" },
      });
      return;
    }

    info("WebSocket message received", {
      userId: user.userId,
      type: message.type,
    });

    switch (message.type) {
      case "ping":
        this.sendToClient(ws, {
          type: "pong",
          payload: { timestamp: new Date().toISOString() },
        });
        break;
      case "subscribe":
        // Handle subscription to specific events
        this.handleSubscription(ws, user, message.payload);
        break;
      default:
        warn("Unknown WebSocket message type", {
          type: message.type,
          userId: user.userId,
        });
    }
  }

  handleSubscription(ws, user, payload) {
    // Store subscription preferences for the user
    // This could be extended to support different event types
    info("User subscribed to events", {
      userId: user.userId,
      events: payload.events,
    });
  }

  // Send message to a specific client
  sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  // Send message to a specific user (all their connections)
  sendToUser(userId, message) {
    if (this.clients.has(userId)) {
      const userConnections = this.clients.get(userId);
      userConnections.forEach((ws) => {
        this.sendToClient(ws, message);
      });
    }
  }

  // Send message to all connected clients
  broadcast(message) {
    this.wss.clients.forEach((ws) => {
      this.sendToClient(ws, message);
    });
  }

  // Send notification to a user
  sendNotification(userId, notification) {
    this.sendToUser(userId, {
      type: "notification",
      payload: notification,
    });
  }

  // Send booking update to a user
  sendBookingUpdate(userId, booking) {
    this.sendToUser(userId, {
      type: "booking_update",
      payload: booking,
    });
    info("Booking update sent to user", { userId, bookingId: booking._id });
  }

  // Broadcast booking created (for admins and property owners if applicable)
  broadcastBookingCreated(booking) {
    // Send to the user who created the booking
    this.sendToUser(booking.user.toString(), {
      type: "booking_created",
      payload: booking,
    });
    info("Booking creation sent to user", {
      userId: booking.user,
      bookingId: booking._id,
    });
  }

  // Broadcast booking status change
  broadcastBookingStatusChanged(booking, oldStatus) {
    this.sendToUser(booking.user.toString(), {
      type: "booking_status_changed",
      payload: {
        booking,
        oldStatus,
        newStatus: booking.status,
      },
    });
    info("Booking status change sent to user", {
      userId: booking.user,
      bookingId: booking._id,
      oldStatus,
      newStatus: booking.status,
    });
  }

  // Send payment update to a user
  sendPaymentUpdate(userId, payment) {
    this.sendToUser(userId, {
      type: "payment_update",
      payload: payment,
    });
  }

  // Broadcast review creation to all connected clients
  broadcastReviewCreated(review) {
    this.broadcast({
      type: "review_created",
      payload: review,
    });
    info("Review creation broadcast", { reviewId: review._id });
  }

  // Broadcast review update to all connected clients
  broadcastReviewUpdated(review) {
    this.broadcast({
      type: "review_updated",
      payload: review,
    });
    info("Review update broadcast", { reviewId: review._id });
  }

  // Broadcast review deletion to all connected clients
  broadcastReviewDeleted(reviewId, destinationId) {
    this.broadcast({
      type: "review_deleted",
      payload: { reviewId, destinationId },
    });
    info("Review deletion broadcast", { reviewId });
  }

  // Broadcast review helpful vote update to all connected clients
  broadcastReviewHelpfulUpdated(reviewId, data) {
    this.broadcast({
      type: "review_helpful_updated",
      payload: {
        reviewId,
        helpfulVotes: data.helpfulVotes,
      },
    });
    info("Review helpful vote update broadcast", {
      reviewId,
      helpfulVotes: data.helpfulVotes,
    });
  }

  // Broadcast destination rating update to all connected clients
  broadcastDestinationRatingUpdated(destinationId, ratingData) {
    this.broadcast({
      type: "destination_rating_updated",
      payload: {
        destinationId,
        averageRating: ratingData.averageRating,
        reviewCount: ratingData.totalReviews,
      },
    });
    info("Destination rating update broadcast", {
      destinationId,
      averageRating: ratingData.averageRating,
    });
  }

  // Broadcast availability update when booking is created/cancelled
  broadcastAvailabilityUpdate(destinationId, dates, available) {
    this.broadcast({
      type: "availability_updated",
      payload: {
        destinationId,
        startDate: dates.startDate,
        endDate: dates.endDate,
        available,
      },
    });
    info("Availability update broadcast", {
      destinationId,
      dates,
      available,
    });
  }

  // Send system message to all users
  sendSystemMessage(message) {
    this.broadcast({
      type: "system_message",
      payload: {
        message,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Get connection statistics
  getStats() {
    return {
      totalConnections: this.connectionCount,
      uniqueUsers: this.clients.size,
      connectedUsers: Array.from(this.clients.keys()),
    };
  }

  // Rate limiting methods
  checkRateLimit(userId) {
    const now = Date.now();
    const userRateLimit = this.rateLimitMap.get(userId) || {
      count: 0,
      resetTime: now + 60000,
    };

    if (now > userRateLimit.resetTime) {
      // Reset counter
      userRateLimit.count = 1;
      userRateLimit.resetTime = now + 60000;
    } else {
      userRateLimit.count++;
    }

    this.rateLimitMap.set(userId, userRateLimit);
    return userRateLimit.count <= this.maxMessagesPerMinute;
  }

  cleanupRateLimit() {
    const now = Date.now();
    for (const [userId, rateLimit] of this.rateLimitMap.entries()) {
      if (now > rateLimit.resetTime) {
        this.rateLimitMap.delete(userId);
      }
    }
  }

  // Close all connections
  close() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    if (this.wss) {
      this.wss.close();
      info("WebSocket server closed");
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

module.exports = websocketService;
