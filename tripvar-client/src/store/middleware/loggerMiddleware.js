import logger from "../../utils/logger";

const loggerMiddleware = (store) => (next) => (action) => {
  // Only log in development and filter out noisy actions
  const noisyActions = [
    "destinations/setLoading",
    "destinations/setDestinations",
    "destinations/setCurrentDestination",
    "destinations/setError",
    "auth/setLoading",
    "auth/setError",
    "booking/setLoading",
    "booking/setError",
    "review/setLoading",
    "review/setError",
    "favorites/setLoading",
    "favorites/setError",
  ];

  if (
    import.meta.env.MODE === "development" &&
    !noisyActions.includes(action.type)
  ) {
    logger.debug("Dispatching action", {
      type: action.type,
      payload: action.payload,
    });
  }

  const result = next(action);

  // Only log state for important actions
  const importantActions = [
    "auth/login/fulfilled",
    "auth/logout",
    "destinations/fetchDestinations/fulfilled",
    "destinations/fetchDestinations/rejected",
  ];

  if (
    import.meta.env.MODE === "development" &&
    importantActions.includes(action.type)
  ) {
    logger.debug("State updated", {
      action: action.type,
      state: store.getState(),
    });
  }

  return result;
};

export default loggerMiddleware;
