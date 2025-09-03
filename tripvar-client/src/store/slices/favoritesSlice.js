import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

// Async thunks
export const fetchFavorites = createAsyncThunk(
  'favorites/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getFavorites();
      return response.data.data.favorites;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch favorites';
      return rejectWithValue(message);
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  'favorites/toggleFavorite',
  async (destinationId, { rejectWithValue, getState }) => {
    try {
      const response = await userService.toggleFavorite(destinationId);
      const currentFavorites = getState().favorites.favorites;
      const isCurrentlyFavorite = currentFavorites.some(fav => fav._id === destinationId);
      
      if (isCurrentlyFavorite) {
        toast.success('Removed from favorites');
        return { action: 'removed', destinationId, favorites: response.data.data.favorites };
      } else {
        toast.success('Added to favorites');
        return { action: 'added', destinationId, favorites: response.data.data.favorites };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update favorites';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const addToFavorites = createAsyncThunk(
  'favorites/addToFavorites',
  async (destinationId, { rejectWithValue }) => {
    try {
      const response = await userService.toggleFavorite(destinationId);
      toast.success('Added to favorites');
      return response.data.data.favorites;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to favorites';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const removeFromFavorites = createAsyncThunk(
  'favorites/removeFromFavorites',
  async (destinationId, { rejectWithValue }) => {
    try {
      const response = await userService.toggleFavorite(destinationId);
      toast.success('Removed from favorites');
      return response.data.data.favorites;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove from favorites';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  favorites: [],
  favoriteIds: new Set(),
  loading: false,
  error: null,
  toggling: false
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearFavorites: (state) => {
      state.favorites = [];
      state.favoriteIds = new Set();
    },
    setFavorites: (state, action) => {
      state.favorites = action.payload;
      state.favoriteIds = new Set(action.payload.map(fav => fav._id));
    },
    addFavorite: (state, action) => {
      const destination = action.payload;
      if (!state.favoriteIds.has(destination._id)) {
        state.favorites.push(destination);
        state.favoriteIds.add(destination._id);
      }
    },
    removeFavorite: (state, action) => {
      const destinationId = action.payload;
      state.favorites = state.favorites.filter(fav => fav._id !== destinationId);
      state.favoriteIds.delete(destinationId);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch favorites
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
        state.favoriteIds = new Set(action.payload.map(fav => fav._id));
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Toggle favorite
      .addCase(toggleFavorite.pending, (state) => {
        state.toggling = true;
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.toggling = false;
        state.favorites = action.payload.favorites;
        state.favoriteIds = new Set(action.payload.favorites.map(fav => fav._id));
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.toggling = false;
        state.error = action.payload;
      })

      // Add to favorites
      .addCase(addToFavorites.pending, (state) => {
        state.toggling = true;
        state.error = null;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.toggling = false;
        state.favorites = action.payload;
        state.favoriteIds = new Set(action.payload.map(fav => fav._id));
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.toggling = false;
        state.error = action.payload;
      })

      // Remove from favorites
      .addCase(removeFromFavorites.pending, (state) => {
        state.toggling = true;
        state.error = null;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.toggling = false;
        state.favorites = action.payload;
        state.favoriteIds = new Set(action.payload.map(fav => fav._id));
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.toggling = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearFavorites,
  setFavorites,
  addFavorite,
  removeFavorite
} = favoritesSlice.actions;

// Selectors
export const selectFavorites = (state) => state.favorites.favorites;
export const selectFavoriteIds = (state) => state.favorites.favoriteIds;
export const selectIsFavorite = (state, destinationId) => 
  state.favorites.favoriteIds.has(destinationId);
export const selectFavoritesLoading = (state) => state.favorites.loading;
export const selectFavoritesError = (state) => state.favorites.error;

export default favoritesSlice.reducer;