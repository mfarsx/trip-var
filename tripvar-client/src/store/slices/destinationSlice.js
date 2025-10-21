import { createSlice } from "@reduxjs/toolkit";
import { destinationApi } from "../../services/api";

const initialState = {
  destinations: [],
  currentDestination: null,
  loading: false,
  error: null,
  lastFetched: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes cache
};

export const destinationSlice = createSlice({
  name: "destinations",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
      state.error = null;
    },
    setDestinations: (state, action) => {
      state.destinations = action.payload;
      state.loading = false;
      state.error = null;
      state.lastFetched = Date.now();
    },
    setCurrentDestination: (state, action) => {
      state.currentDestination = action.payload;
      state.loading = false;
      state.error = null;
    },
    updateDestinationRating: (state, action) => {
      const { destinationId, rating, ratingCount } = action.payload;
      // Update in destinations array
      const destinationIndex = state.destinations.findIndex(
        (dest) => dest._id === destinationId
      );
      if (destinationIndex !== -1) {
        state.destinations[destinationIndex].rating = rating;
        state.destinations[destinationIndex].ratingCount = ratingCount;
      }
      // Update current destination if it matches
      if (
        state.currentDestination &&
        state.currentDestination._id === destinationId
      ) {
        state.currentDestination.rating = rating;
        state.currentDestination.ratingCount = ratingCount;
      }
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearDestinations: (state) => {
      state.destinations = [];
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setDestinations,
  setCurrentDestination,
  updateDestinationRating,
  setError,
  clearDestinations,
} = destinationSlice.actions;

// Helper function to check if cache is valid
const isCacheValid = (lastFetched, cacheExpiry) => {
  if (!lastFetched) return false;
  return Date.now() - lastFetched < cacheExpiry;
};

// Async actions
export const fetchDestinations =
  (forceRefresh = false, params = null) =>
  async (dispatch, getState) => {
    const state = getState();
    const { lastFetched, cacheExpiry, destinations } = state.destinations;

    // Check if we have valid cached data and don't need to refresh
    if (
      !forceRefresh &&
      destinations.length > 0 &&
      isCacheValid(lastFetched, cacheExpiry)
    ) {
      console.log("Using cached destinations data");
      return;
    }

    try {
      dispatch(setLoading(true));
      const response = await destinationApi.getDestinations(params);
      dispatch(setDestinations(response.data.data.destinations));
    } catch (error) {
      dispatch(
        setError(
          error.response?.data?.message || "Failed to fetch destinations"
        )
      );
    }
  };

export const fetchDestinationById = (id) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await destinationApi.getDestinationById(id);
    dispatch(setCurrentDestination(response.data.data.destination));
  } catch (error) {
    dispatch(
      setError(error.response?.data?.message || "Failed to fetch destination")
    );
  }
};

export default destinationSlice.reducer;
