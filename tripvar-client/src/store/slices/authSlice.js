import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      if (response.data.status === "success") {
        localStorage.setItem("token", response.data.data.token);
        return response.data.data;
      }
      return rejectWithValue(response.data.message || "Login failed");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const register = createAsyncThunk(
  "auth/register",
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", {
        email,
        password,
        name,
      });
      if (response.data.status === "success") {
        localStorage.setItem("token", response.data.data.token);
        return response.data.data;
      }
      return rejectWithValue(response.data.message || "Registration failed");
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.get("/auth/profile");
      if (response.data.status === "success") {
        return response.data.data;
      }
      return rejectWithValue(
        response.data.message || "Failed to fetch profile"
      );
    } catch (error) {
      // Handle token expiration explicitly
      if (error.response?.status === 401) {
        // The API interceptor will handle removing the token and redirecting,
        // but we'll also dispatch logout here to ensure Redux state is updated
        dispatch(logout());
        return rejectWithValue("Token expired or invalid. Please login again.");
      }
      
      // For other errors, just return the error message
      const errorMessage = error.response?.data?.message || "Failed to fetch profile";
      
      // If the error message contains anything about token or authorization,
      // we'll also dispatch logout to be safe
      if (errorMessage.toLowerCase().includes('token') || 
          errorMessage.toLowerCase().includes('auth') ||
          errorMessage.toLowerCase().includes('expired')) {
        dispatch(logout());
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.patch("/auth/profile", profileData);
      if (response.data.status === "success") {
        return response.data.data;
      }
      return rejectWithValue(
        response.data.message || "Failed to update profile"
      );
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
