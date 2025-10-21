import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedDestinations: [],
  isComparing: false,
  maxSelections: 3,
};

const comparisonSlice = createSlice({
  name: "comparison",
  initialState,
  reducers: {
    toggleDestinationSelection: (state, action) => {
      const destinationId = action.payload;
      const index = state.selectedDestinations.indexOf(destinationId);

      if (index > -1) {
        // Remove if already selected
        state.selectedDestinations.splice(index, 1);
      } else {
        // Add if not at max capacity
        if (state.selectedDestinations.length < state.maxSelections) {
          state.selectedDestinations.push(destinationId);
        }
      }
    },

    clearSelection: (state) => {
      state.selectedDestinations = [];
      state.isComparing = false;
    },

    setComparing: (state, action) => {
      state.isComparing = action.payload;
    },

    setMaxSelections: (state, action) => {
      state.maxSelections = action.payload;
      // Remove excess selections if new max is lower
      if (state.selectedDestinations.length > action.payload) {
        state.selectedDestinations = state.selectedDestinations.slice(
          0,
          action.payload
        );
      }
    },

    removeDestination: (state, action) => {
      const destinationId = action.payload;
      state.selectedDestinations = state.selectedDestinations.filter(
        (id) => id !== destinationId
      );
    },
  },
});

export const {
  toggleDestinationSelection,
  clearSelection,
  setComparing,
  setMaxSelections,
  removeDestination,
} = comparisonSlice.actions;

// Selectors
export const selectSelectedDestinations = (state) =>
  state.comparison.selectedDestinations;
export const selectIsComparing = (state) => state.comparison.isComparing;
export const selectMaxSelections = (state) => state.comparison.maxSelections;
export const selectCanAddMore = (state) =>
  state.comparison.selectedDestinations.length < state.comparison.maxSelections;
export const selectIsSelected = (state, destinationId) =>
  state.comparison.selectedDestinations.includes(destinationId);

export default comparisonSlice.reducer;
