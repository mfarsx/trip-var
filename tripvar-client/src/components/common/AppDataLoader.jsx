import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDestinations } from "../../store/slices/destinationSlice";
import { fetchFavorites } from "../../store/slices/favoritesSlice";
import { fetchUserBookings } from "../../store/slices/bookingSlice";
import {
  fetchUserNotifications,
  fetchNotificationStats,
} from "../../store/slices/notificationSlice";
import { getPaymentHistory } from "../../store/slices/paymentSlice";
import apiCallManager from "../../utils/apiCallManager";
import logger from "../../utils/logger";

/**
 * AppDataLoader - Component responsible for loading initial data when the app starts
 *
 * This component automatically fetches essential data when the user is authenticated:
 * - Destinations (for the main content)
 * - Favorites (for user's saved destinations)
 * - Bookings (for user's booking history)
 * - Notifications (for real-time updates)
 * - Payment history (for user's payment records)
 *
 * Features:
 * - Only loads data when user is authenticated
 * - Uses API call manager to prevent duplicate requests
 * - Handles errors gracefully
 * - Logs data loading progress
 */
const AppDataLoader = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const hasLoadedData = useRef(new Set());

  // Safely access state slices with fallbacks
  const destinations = useSelector(
    (state) => state.destinations?.destinations || []
  );
  const favorites = useSelector((state) => state.favorites?.favorites || []);
  const bookings = useSelector((state) => state.bookings?.bookings || []);
  const notifications = useSelector(
    (state) => state.notifications?.notifications || []
  );
  const paymentHistory = useSelector(
    (state) => state.payments?.paymentHistory || []
  );

  useEffect(() => {
    try {
      // Only load data if user is authenticated
      if (!isAuthenticated || !user) {
        logger.debug("User not authenticated, skipping data loading");
        return;
      }

      const userId = user.id;
      const userDataKey = `user_${userId}`;

      // Check if we've already loaded data for this user
      if (hasLoadedData.current.has(userDataKey)) {
        logger.debug("Data already loaded for user, skipping");
        return;
      }

      // Mark that we're starting to load data for this user
      hasLoadedData.current.add(userDataKey);

      logger.info("Starting initial data loading for authenticated user", {
        userId: user.id,
        hasDestinations: destinations.length > 0,
        hasFavorites: favorites.length > 0,
        hasBookings: bookings.length > 0,
        hasNotifications: notifications.length > 0,
        hasPaymentHistory: paymentHistory.length > 0,
      });

      // Load destinations if not already loaded
      if (destinations.length === 0) {
        apiCallManager
          .executeCall("fetchDestinations", () => {
            logger.debug("Loading destinations...");
            return dispatch(fetchDestinations());
          })
          .catch((error) => {
            logger.error("Failed to load destinations", error);
          });
      }

      // Load favorites if not already loaded
      if (favorites.length === 0) {
        apiCallManager
          .executeCall("fetchFavorites", () => {
            logger.debug("Loading favorites...");
            return dispatch(fetchFavorites());
          })
          .catch((error) => {
            logger.error("Failed to load favorites", error);
          });
      }

      // Load bookings if not already loaded
      if (bookings.length === 0) {
        apiCallManager
          .executeCall("fetchUserBookings", () => {
            logger.debug("Loading user bookings...");
            return dispatch(fetchUserBookings());
          })
          .catch((error) => {
            logger.error("Failed to load bookings", error);
          });
      }

      // Load notifications if not already loaded
      if (notifications.length === 0) {
        apiCallManager
          .executeCall("fetchUserNotifications", () => {
            logger.debug("Loading notifications...");
            return dispatch(fetchUserNotifications());
          })
          .catch((error) => {
            logger.error("Failed to load notifications", error);
          });

        // Also load notification stats
        apiCallManager
          .executeCall("fetchNotificationStats", () => {
            logger.debug("Loading notification stats...");
            return dispatch(fetchNotificationStats());
          })
          .catch((error) => {
            logger.error("Failed to load notification stats", error);
          });
      }

      // Load payment history if not already loaded
      if (paymentHistory.length === 0) {
        apiCallManager
          .executeCall("getPaymentHistory", () => {
            logger.debug("Loading payment history...");
            return dispatch(getPaymentHistory());
          })
          .catch((error) => {
            logger.error("Failed to load payment history", error);
          });
      }
    } catch (error) {
      logger.error("Error in AppDataLoader useEffect", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated,
    user?.id, // Track user ID changes
    dispatch,
    // Intentionally excluding array dependencies (destinations, favorites, etc.)
    // to prevent infinite loops. The hasLoadedData ref and apiCallManager
    // provide sufficient protection against duplicate calls.
  ]);

  // Cleanup effect to handle user changes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Clear loaded data when user logs out
      hasLoadedData.current.clear();
    }
  }, [isAuthenticated, user]);

  // This component doesn't render anything
  return null;
};

AppDataLoader.displayName = "AppDataLoader";

export default AppDataLoader;
