import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { authService } from "../services/authService";
import { AUTH_ERRORS, AUTH_EVENTS, AUTH_CONFIG } from "../constants/auth";
import { logInfo, logError } from "../utils/logger";
import { getStoredToken, getStoredUser } from "../utils/tokenUtils";

// Type definitions
/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {string} full_name - User's full name
 */

/**
 * @typedef {Object} AuthError
 * @property {string} type - Error type from AUTH_ERRORS
 * @property {string} message - Error message
 */

/**
 * @typedef {Object} AuthState
 * @property {User|null} user - Current user
 * @property {boolean} loading - Loading state
 * @property {AuthError|null} error - Error state
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {User|null} user - Current user
 * @property {boolean} loading - Loading state
 * @property {AuthError|null} error - Error state
 * @property {boolean} isAuthenticated - Authentication status
 * @property {function(Object): Promise<Object>} login - Login function
 * @property {function(): Promise<void>} logout - Logout function
 * @property {function(Object): Promise<Object>} signup - Signup function
 * @property {function(): Promise<boolean>} checkAuthStatus - Check auth status
 */

// Initial state with stored user data
const initialState = {
  user: getStoredUser(),
  loading: true,
  error: null,
};

// Create context with type definition
/** @type {React.Context<AuthContextValue>} */
export const AuthContext = createContext(null);

// Validation schemas
const stateSchema = {
  user: (value) =>
    value === null ||
    (typeof value === "object" &&
      value !== null &&
      typeof value.id === "string" &&
      typeof value.email === "string"),
  loading: (value) => typeof value === "boolean",
  error: (value) =>
    value === null ||
    (typeof value === "object" &&
      value !== null &&
      typeof value.type === "string" &&
      typeof value.message === "string"),
};

/**
 * Validate state updates against schema
 * @param {Partial<AuthState>} updates - State updates to validate
 * @throws {Error} If updates are invalid
 */
const validateStateUpdates = (updates) => {
  Object.entries(updates).forEach(([key, value]) => {
    if (key in stateSchema && !stateSchema[key](value)) {
      console.error(`Invalid value for ${key}:`, value);
      throw new Error(`Invalid state update for ${key}`);
    }
  });
};

/**
 * Get error type and message from error response
 * @param {Error} error - Error object
 * @returns {{ type: string, message: string }} Error type and message
 */
const getErrorDetails = (error) => {
  // Handle network errors
  if (!error.response) {
    return {
      type: AUTH_ERRORS.NETWORK_ERROR,
      message: "Unable to connect to server",
    };
  }

  // Handle API errors
  const { status, data } = error.response;
  const detail = data?.detail || "";

  // Token errors
  if (detail.includes("expired")) {
    return {
      type: AUTH_ERRORS.EXPIRED_TOKEN,
      message: "Your session has expired. Please log in again.",
    };
  }

  // Status-based errors
  switch (status) {
    case 401:
      return {
        type: AUTH_ERRORS.INVALID_TOKEN,
        message: "Invalid authentication token",
      };
    case 409:
      return {
        type: AUTH_ERRORS.DUPLICATE_EMAIL,
        message: "This email is already registered",
      };
    case 422:
      return {
        type: AUTH_ERRORS.INVALID_CREDENTIALS,
        message: "Invalid email or password",
      };
    default:
      return {
        type: AUTH_ERRORS.UNKNOWN_ERROR,
        message: detail || "An unexpected error occurred",
      };
  }
};

/**
 * AuthProvider component that manages authentication state and provides auth methods
 */
export const AuthProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  const mountedRef = useRef(true);
  const navigate = useNavigate();

  const updateState = useCallback((updates) => {
    try {
      validateStateUpdates(updates);
      setState((prev) => ({ ...prev, ...updates }));
    } catch (error) {
      console.error("Invalid state update:", error);
      if (AUTH_CONFIG.DEV_MODE) {
        throw error;
      }
    }
  }, []);

  const resetState = useCallback(() => {
    updateState({
      user: null,
      loading: false,
      error: null,
    });
  }, [updateState]);

  const handleAuthError = useCallback(
    (error, defaultType = AUTH_ERRORS.UNKNOWN_ERROR) => {
      const { type, message } = getErrorDetails(error);

      // Only clear auth data if it's a token-related error and not during signup
      if (
        [AUTH_ERRORS.EXPIRED_TOKEN, AUTH_ERRORS.INVALID_TOKEN].includes(type) &&
        window.location.pathname !== "/signup"
      ) {
        authService._clearAuth();
      }

      updateState({
        user: null,
        loading: false,
        error: { type, message },
      });

      return type;
    },
    [updateState]
  );

  const checkAuthStatus = useCallback(async () => {
    if (!mountedRef.current) return false;

    try {
      updateState({ loading: true });

      const token = getStoredToken();
      if (!token) {
        updateState({ user: null, loading: false });
        return false;
      }

      const response = await authService.checkAuth();

      if (!mountedRef.current) return false;

      if (!response?.success || !response?.data) {
        updateState({ user: null, loading: false });
        return false;
      }

      const { user } = response.data;
      
      // Format user data to match our expected structure
      const userData = {
        id: user?._id || user?.id,
        email: user?.email,
        full_name: user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
      };

      if (!userData.id || !userData.email) {
        logError(new Error("Invalid user data structure from checkAuth"), "auth", {
          receivedData: JSON.stringify(response.data),
          formattedUser: JSON.stringify(userData)
        });
        updateState({ user: null, loading: false });
        return false;
      }

      updateState({
        user: userData,
        loading: false,
        error: null,
      });

      logInfo("Auth check completed successfully", "auth", {
        userId: userData.id,
        timestamp: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      if (!mountedRef.current) return false;

      handleAuthError(error);
      return false;
    }
  }, [updateState, handleAuthError]);

  const login = useCallback(
    async (credentials) => {
      if (!mountedRef.current) return;

      updateState({ loading: true, error: null });
      try {
        logInfo("Starting login", "auth", {
          email: credentials.email ? "***" : undefined,
          timestamp: new Date().toISOString(),
        });

        const response = await authService.login(credentials);
        
        logInfo("Login response received", "auth", {
          success: response?.success,
          hasData: !!response?.data,
          message: response?.message,
          timestamp: new Date().toISOString(),
        });

        if (!mountedRef.current) return;

        if (!response?.success || !response?.data) {
          throw new Error(response?.message || "Login failed");
        }

        const { user, access_token } = response.data;
        
        // Format user data to match our expected structure
        const userData = {
          id: user?._id || user?.id,
          email: user?.email,
          full_name: user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
        };
        
        if (!userData.id || !userData.email) {
          logError(new Error("Invalid user data structure"), "auth", {
            receivedData: JSON.stringify(response.data),
            formattedUser: JSON.stringify(userData)
          });
          throw new Error("Invalid user data received");
        }

        updateState({
          user: userData,
          loading: false,
          error: null,
        });

        logInfo("Login completed successfully", "auth", {
          userId: userData.id,
          email: "***" + userData.email.split("@")[1],
          timestamp: new Date().toISOString(),
        });

        return { user: userData, access_token };
      } catch (error) {
        if (!mountedRef.current) return;

        handleAuthError(error, AUTH_ERRORS.LOGIN_FAILED);
        logError(error, "auth");
        throw error;
      }
    },
    [updateState, handleAuthError]
  );

  const logout = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      if (state.user) {
        logInfo("Starting logout", "auth", {
          userId: state.user.id,
          timestamp: new Date().toISOString(),
        });
      }

      // First clear the state
      resetState();
      
      // Then call the logout service
      await authService.logout();

      if (!mountedRef.current) return;

      logInfo("Logout completed successfully", "auth", {
        timestamp: new Date().toISOString(),
      });

      // Finally navigate
      navigate("/login", { replace: true });
    } catch (error) {
      if (!mountedRef.current) return;

      handleAuthError(error, AUTH_ERRORS.LOGOUT_FAILED);
      logError(error, "auth");
      
      // Even on error, we should clear the state and redirect
      resetState();
      navigate("/login", { replace: true });
    }
  }, [updateState, handleAuthError, resetState, state.user, navigate]);

  const signup = useCallback(
    async (userData) => {
      if (!mountedRef.current) return;

      updateState({ loading: true, error: null });
      try {
        const response = await authService.register(userData);

        if (!mountedRef.current) return;

        if (response?.data?.user) {
          updateState({
            user: response.data.user,
            loading: false,
            error: null,
          });
          await checkAuthStatus();
          return response.data;
        }

        throw new Error("Invalid response format");
      } catch (error) {
        if (!mountedRef.current) return;

        handleAuthError(error, AUTH_ERRORS.SIGNUP_FAILED);
        throw error;
      }
    },
    [updateState, handleAuthError, checkAuthStatus]
  );

  // Initial auth check and cleanup
  useEffect(() => {
    mountedRef.current = true;
    
    // Run initial auth check
    const initAuth = async () => {
      try {
        await checkAuthStatus();
      } catch (error) {
        logError(error, "auth");
      }
    };
    
    initAuth();

    return () => {
      mountedRef.current = false;
    };
  }, [checkAuthStatus]);

  // Event listeners for auth state changes
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === AUTH_EVENTS.AUTH_STATE_CHANGE) {
        checkAuthStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(AUTH_EVENTS.AUTH_STATE_CHANGE, checkAuthStatus);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(AUTH_EVENTS.AUTH_STATE_CHANGE, checkAuthStatus);
    };
  }, [checkAuthStatus]);

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: !!getStoredToken() && !!state.user,
      login,
      logout,
      signup,
      checkAuthStatus,
    }),
    [state, login, logout, signup, checkAuthStatus]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Custom hook for accessing authentication context
 * @returns {AuthContextValue} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
