import { createSlice } from "@reduxjs/toolkit";
import { destinationApi } from "../../services/api";

const initialState = {
  destinations: [],
  loading: false,
  error: null,
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

export const { setLoading, setDestinations, setError, clearDestinations } =
  destinationSlice.actions;

// Async actions
export const fetchDestinations = (params) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await destinationApi.getDestinations(params);
    dispatch(setDestinations(response.data.destinations));
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
    dispatch(setDestinations([response.data.destination]));
  } catch (error) {
    dispatch(
      setError(
        error.response?.data?.message || "Failed to fetch destination"
      )
    );
  }
};

export default destinationSlice.reducer;
