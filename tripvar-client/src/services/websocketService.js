import { store } from "../store";
import { addNotification } from "../store/slices/notificationSlice";
import {
  addReviewFromWebSocket,
  updateReviewFromWebSocket,
  removeReviewFromWebSocket,
} from "../store/slices/reviewSlice";
import logger from "../utils/logger";

class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.isConnecting = false;
    this.listeners = new Map();
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
    this.heartbeatIntervalMs = 30000; // 30 seconds
    this.heartbeatTimeoutMs = 10000; // 10 seconds
    this.lastPong = Date.now();
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    const token = localStorage.getItem("token");

    if (!token) {
      logger.warn(
        "No authentication token found, skipping WebSocket connection"
      );
      this.isConnecting = false;
      return;
    }

    // Check if WebSocket is supported
    if (typeof WebSocket === "undefined") {
      logger.warn("WebSocket is not supported in this environment");
      this.isConnecting = false;
      return;
    }

    const wsUrl = `${
      import.meta.env.VITE_WS_URL || "ws://localhost:8000"
    }/ws?token=${token}`;

    try {
      this.socket = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      logger.error("Failed to create WebSocket connection", error);
      this.isConnecting = false;
      // Don't attempt to reconnect if WebSocket is not available
      this.emit("connection_failed", error);
    }
  }

  setupEventListeners() {
    this.socket.onopen = () => {
      logger.info("WebSocket connected");
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.lastPong = Date.now();
      this.startHeartbeat();
      this.emit("connected");
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        logger.error("Failed to parse WebSocket message", error);
      }
    };

    this.socket.onclose = (event) => {
      logger.warn("WebSocket disconnected", {
        code: event.code,
        reason: event.reason,
      });
      this.isConnecting = false;
      this.stopHeartbeat();
      this.emit("disconnected", { code: event.code, reason: event.reason });

      // Only attempt to reconnect if it's not a normal closure and not a server unavailable error
      if (event.code !== 1000 && event.code !== 1006) {
        // Not a normal closure or connection lost
        this.handleReconnect();
      }
    };

    this.socket.onerror = (error) => {
      logger.error("WebSocket error", error);
      this.isConnecting = false;
      this.emit("error", error);
    };
  }

  handleMessage(data) {
    logger.debug("WebSocket message received", data);

    switch (data.type) {
      case "notification":
        this.handleNotification(data.payload);
        break;
      case "booking_update":
        this.handleBookingUpdate(data.payload);
        break;
      case "booking_created":
        this.handleBookingCreated(data.payload);
        break;
      case "booking_status_changed":
        this.handleBookingStatusChanged(data.payload);
        break;
      case "payment_update":
        this.handlePaymentUpdate(data.payload);
        break;
      case "review_created":
        this.handleReviewCreated(data.payload);
        break;
      case "review_updated":
        this.handleReviewUpdated(data.payload);
        break;
      case "review_deleted":
        this.handleReviewDeleted(data.payload);
        break;
      case "review_helpful_updated":
        this.handleReviewHelpfulUpdated(data.payload);
        break;
      case "destination_rating_updated":
        this.handleDestinationRatingUpdated(data.payload);
        break;
      case "availability_updated":
        this.handleAvailabilityUpdated(data.payload);
        break;
      case "system_message":
        this.handleSystemMessage(data.payload);
        break;
      case "pong":
        this.handlePong(data.payload);
        break;
      case "connection_established":
        logger.info("WebSocket connection established", data.payload);
        break;
      default:
        logger.warn("Unknown WebSocket message type", data.type);
    }

    this.emit("message", data);
  }

  handleNotification(notification) {
    // Add notification to Redux store
    store.dispatch(addNotification(notification));
    this.emit("notification", notification);
  }

  handleBookingUpdate(booking) {
    // Handle booking updates (could trigger a refetch or update local state)
    this.emit("booking_update", booking);
  }

  handleBookingCreated(booking) {
    // Handle new booking creation
    logger.info("Booking created via WebSocket", { bookingId: booking._id });

    // Import addBookingFromWebSocket from bookingSlice
    import("../store/slices/bookingSlice").then(
      ({ addBookingFromWebSocket }) => {
        store.dispatch(addBookingFromWebSocket(booking));
      }
    );

    // Emit event for any additional listeners
    this.emit("booking_created", booking);
  }

  handleBookingStatusChanged(payload) {
    // Handle booking status change
    logger.info("Booking status changed via WebSocket", {
      bookingId: payload.booking._id,
      oldStatus: payload.oldStatus,
      newStatus: payload.newStatus,
    });

    // Import updateBookingFromWebSocket from bookingSlice
    import("../store/slices/bookingSlice").then(
      ({ updateBookingFromWebSocket }) => {
        store.dispatch(updateBookingFromWebSocket(payload.booking));
      }
    );

    // Emit event for any additional listeners
    this.emit("booking_status_changed", payload);
  }

  handlePaymentUpdate(payment) {
    // Handle payment updates
    logger.info("Payment update received via WebSocket", {
      bookingId: payment.bookingId,
      status: payment.paymentStatus,
    });

    // Show toast notification based on payment status
    import("react-hot-toast").then(({ default: toast }) => {
      if (payment.paymentStatus === "succeeded") {
        toast.success("Payment processed successfully!");
      } else if (payment.paymentStatus === "failed") {
        toast.error(`Payment failed: ${payment.error || "Please try again"}`);
      }
    });

    // Update booking payment status if paymentSlice exists
    import("../store/slices/paymentSlice")
      .then(({ updatePaymentStatusFromWebSocket }) => {
        if (updatePaymentStatusFromWebSocket) {
          store.dispatch(updatePaymentStatusFromWebSocket(payment));
        }
      })
      .catch(() => {
        // PaymentSlice doesn't exist or doesn't have this action, that's okay
      });

    // Emit event for any additional listeners
    this.emit("payment_update", payment);
  }

  handleReviewCreated(review) {
    // Handle new review creation
    logger.info("Review created via WebSocket", { reviewId: review._id });

    // Dispatch to Redux store
    store.dispatch(addReviewFromWebSocket(review));

    // Emit event for any additional listeners
    this.emit("review_created", review);
  }

  handleReviewUpdated(review) {
    // Handle review update
    logger.info("Review updated via WebSocket", { reviewId: review._id });

    // Dispatch to Redux store
    store.dispatch(updateReviewFromWebSocket(review));

    // Emit event for any additional listeners
    this.emit("review_updated", review);
  }

  handleReviewDeleted(payload) {
    // Handle review deletion
    logger.info("Review deleted via WebSocket", { reviewId: payload.reviewId });

    // Dispatch to Redux store
    store.dispatch(removeReviewFromWebSocket(payload));

    // Emit event for any additional listeners
    this.emit("review_deleted", payload);
  }

  handleReviewHelpfulUpdated(payload) {
    // Handle review helpful vote update
    logger.info("Review helpful votes updated via WebSocket", {
      reviewId: payload.reviewId,
      helpfulVotes: payload.helpfulVotes,
    });

    // Import updateReviewHelpfulFromWebSocket from reviewSlice
    import("../store/slices/reviewSlice").then(
      ({ updateReviewHelpfulFromWebSocket }) => {
        store.dispatch(
          updateReviewHelpfulFromWebSocket({
            reviewId: payload.reviewId,
            helpfulVotes: payload.helpfulVotes,
          })
        );
      }
    );

    // Emit event for any additional listeners
    this.emit("review_helpful_updated", payload);
  }

  handleDestinationRatingUpdated(payload) {
    // Handle destination rating update
    logger.info("Destination rating updated via WebSocket", {
      destinationId: payload.destinationId,
      averageRating: payload.averageRating,
    });

    // Import updateDestinationRating from destinationSlice
    import("../store/slices/destinationSlice").then(
      ({ updateDestinationRating }) => {
        store.dispatch(
          updateDestinationRating({
            destinationId: payload.destinationId,
            rating: payload.averageRating,
            ratingCount: payload.reviewCount,
          })
        );
      }
    );

    // Emit event for any additional listeners
    this.emit("destination_rating_updated", payload);
  }

  handleAvailabilityUpdated(payload) {
    // Handle availability update
    logger.info("Availability updated via WebSocket", {
      destinationId: payload.destinationId,
      startDate: payload.startDate,
      endDate: payload.endDate,
      available: payload.available,
    });

    // Show toast notification if dates became unavailable
    if (!payload.available) {
      import("react-hot-toast").then(({ default: toast }) => {
        toast("These dates are no longer available for this destination", {
          duration: 4000,
          icon: "ℹ️",
        });
      });
    }

    // Emit event for components to handle (e.g., booking form)
    this.emit("availability_updated", payload);
  }

  handleSystemMessage(message) {
    // Handle system messages
    this.emit("system_message", message);
  }

  handlePong(payload) {
    this.lastPong = Date.now();
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
    logger.debug("WebSocket pong received", payload);
  }

  startHeartbeat() {
    this.stopHeartbeat(); // Clear any existing heartbeat

    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        // Check if we received a pong recently
        const timeSinceLastPong = Date.now() - this.lastPong;
        if (
          timeSinceLastPong >
          this.heartbeatIntervalMs + this.heartbeatTimeoutMs
        ) {
          logger.warn("WebSocket heartbeat timeout - no pong received");
          this.socket.close(1000, "Heartbeat timeout");
          return;
        }

        // Send ping
        this.send({
          type: "ping",
          payload: { timestamp: new Date().toISOString() },
        });

        // Set timeout for pong response
        this.heartbeatTimeout = setTimeout(() => {
          logger.warn("WebSocket pong timeout");
          this.socket.close(1000, "Pong timeout");
        }, this.heartbeatTimeoutMs);
      }
    }, this.heartbeatIntervalMs);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.warn(
        "Max reconnection attempts reached - WebSocket server may not be available"
      );
      this.emit("max_reconnect_attempts_reached");
      return;
    }

    this.reconnectAttempts++;
    logger.info(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  send(data) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    } else {
      logger.warn("WebSocket is not connected, cannot send message");
    }
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
        if (eventListeners.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  emit(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          logger.error(`Error in WebSocket event listener for ${event}`, error);
        }
      });
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.socket) {
      // Only close if the socket is not already closed or closing
      if (
        this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING
      ) {
        this.socket.close(1000, "Client disconnecting");
      }
      this.socket = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  getConnectionState() {
    if (!this.socket) return "DISCONNECTED";

    switch (this.socket.readyState) {
      case WebSocket.CONNECTING:
        return "CONNECTING";
      case WebSocket.OPEN:
        return "CONNECTED";
      case WebSocket.CLOSING:
        return "CLOSING";
      case WebSocket.CLOSED:
        return "CLOSED";
      default:
        return "UNKNOWN";
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
