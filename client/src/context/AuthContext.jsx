import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import PropTypes from "prop-types";
import { authService } from "../services/authService";
import { AUTH_ERRORS, AUTH_EVENTS, AUTH_STORAGE_KEYS } from "../constants/auth";
import { logInfo, logError } from "../utils/logger";

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

// Initial state
const initialState = {
  user: null,
  loading: true,
  error: null,
  lastCheck: 0,
};

// Create context with type definition
/** @type {React.Context<AuthContextValue>} */
export const AuthContext = createContext(null);

// Validation schemas
const stateSchema = {
  user: (value) =>
    value === null || (typeof value === "object" && "id" in value),
  loading: (value) => typeof value === "boolean",
  error: (value) =>
    value === null ||
    (typeof value === "object" && "type" in value && "message" in value),
};

/**
 * Validate state updates against schema
 * @param {Partial<AuthState>} updates - State updates to validate
 * @throws {Error} If updates are invalid
 */
const validateStateUpdates = (updates) => {
  Object.entries(updates).forEach(([key, value]) => {
    if (key in stateSchema && !stateSchema[key](value)) {
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
  const checkAuthTimeoutRef = useRef(null);
  const isCheckingRef = useRef(false);
  const initialCheckDoneRef = useRef(false);

  const updateState = useCallback((updates) => {
    try {
      validateStateUpdates(updates);
      setState((prev) => ({ ...prev, ...updates }));
    } catch (error) {
      console.error("Invalid state update:", error);
      if (process.env.NODE_ENV === "development") {
        throw error;
      }
    }
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  const handleAuthError = useCallback(
    (error, defaultType = AUTH_ERRORS.UNKNOWN_ERROR) => {
      const { type, message } = getErrorDetails(error);

      // Only clear auth data if it's a token-related error and not during signup
      if (
        [AUTH_ERRORS.EXPIRED_TOKEN, AUTH_ERRORS.INVALID_TOKEN].includes(type) &&
        window.location.pathname !== '/signup'
      ) {
        authService._clearAuthData();
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

  const checkAuthStatus = useCallback(
    async (force = false) => {
      // Skip if already checking
      if (isCheckingRef.current) {
        return false;
      }

      // Skip if checked recently and not forced
      const now = Date.now();
      if (!force && now - state.lastCheck < 2000) {
        return false;
      }

      try {
        isCheckingRef.current = true;
        updateState({ loading: true, lastCheck: now });

        // First check if we have a valid token
        if (!authService.isAuthenticated()) {
          updateState({ user: null, loading: false, error: null });
          return false;
        }

        // Try to get user data
        const response = await authService.checkAuth();

        // If we have a valid response with user data
        if (response?.user) {
          updateState({
            user: response.user,
            error: null,
            loading: false,
          });
          logInfo("Auth check completed successfully", "auth", {
            userId: response.user.id,
            timestamp: new Date().toISOString(),
          });
          return true;
        }

        // If we have a response but no user data, clear auth
        authService._clearAuthData();
        updateState({
          user: null,
          loading: false,
          error: {
            type: AUTH_ERRORS.INVALID_TOKEN,
            message: "Invalid authentication state",
          },
        });
        return false;
      } catch (error) {
        // Handle network errors differently
        if (!error.response) {
          updateState({
            loading: false,
            error: {
              type: AUTH_ERRORS.NETWORK_ERROR,
              message:
                "Unable to connect to server. Please check your connection.",
            },
          });
          return false;
        }

        // Handle other errors
        const errorType = handleAuthError(error);

        // Clear auth data for authentication errors
        if (
          [AUTH_ERRORS.EXPIRED_TOKEN, AUTH_ERRORS.INVALID_TOKEN].includes(
            errorType
          )
        ) {
          authService._clearAuthData();
        }

        return false;
      } finally {
        isCheckingRef.current = false;
      }
    },
    [updateState, handleAuthError, state.lastCheck]
  );

  // Event handlers
  const handleStorageChange = useCallback(
    (event) => {
      if (event.key === AUTH_STORAGE_KEYS.TOKEN) {
        if (checkAuthTimeoutRef.current) {
          clearTimeout(checkAuthTimeoutRef.current);
        }
        checkAuthTimeoutRef.current = setTimeout(() => {
          checkAuthStatus(true);
        }, 250);
      }
    },
    [checkAuthStatus]
  );

  const handleAuthStateChange = useCallback(
    (event) => {
      if (!event.detail.authenticated) {
        updateState({ user: null, loading: false });
      }
    },
    [updateState]
  );

  // Initial auth check
  useEffect(() => {
    if (!initialCheckDoneRef.current) {
      initialCheckDoneRef.current = true;
      checkAuthStatus(true);
    }

    return () => {
      if (checkAuthTimeoutRef.current) {
        clearTimeout(checkAuthTimeoutRef.current);
      }
    };
  }, [checkAuthStatus]);

  // Event listeners
  useEffect(() => {
    window.addEventListener(AUTH_EVENTS.STORAGE, handleStorageChange);
    window.addEventListener(
      AUTH_EVENTS.AUTH_STATE_CHANGE,
      handleAuthStateChange
    );

    return () => {
      window.removeEventListener(AUTH_EVENTS.STORAGE, handleStorageChange);
      window.removeEventListener(
        AUTH_EVENTS.AUTH_STATE_CHANGE,
        handleAuthStateChange
      );
    };
  }, [handleStorageChange, handleAuthStateChange]);

  const signup = useCallback(
    async (userData) => {
      updateState({ loading: true, error: null });
      try {
        const response = await authService.signup(userData);
        if (response?.user) {
          updateState({
            user: response.user,
            error: null,
            loading: false,
          });
          // Trigger auth state check to ensure everything is properly set
          await checkAuthStatus(true);
          return response;
        }
        throw new Error("Invalid response format");
      } catch (error) {
        handleAuthError(error, AUTH_ERRORS.SIGNUP_FAILED);
        throw error;
      } finally {
        updateState({ loading: false });
      }
    },
    [updateState, handleAuthError, checkAuthStatus]
  );

  const login = useCallback(
    async (credentials) => {
      updateState({ loading: true, error: null });
      try {
        logInfo("Starting login", "auth", {
          email: credentials.email ? "***" : undefined,
          timestamp: new Date().toISOString(),
          hasPassword: !!credentials.password,
        });

        const response = await authService.login(credentials);

        if (response?.user) {
          updateState({ user: response.user, error: null });
          logInfo("Login completed successfully", "auth", {
            userId: response.user.id,
            email: "***" + response.user.email.split("@")[1],
            timestamp: new Date().toISOString(),
          });
        }
        return response;
      } catch (error) {
        handleAuthError(error, AUTH_ERRORS.LOGIN_FAILED);
        logError(error, "auth");
        throw error;
      } finally {
        updateState({ loading: false });
      }
    },
    [updateState, handleAuthError]
  );

  const logout = useCallback(async () => {
    if (!state.user) return; // Prevent logout if no user is logged in

    updateState({ loading: true });
    try {
      logInfo("Starting logout", "auth", {
        userId: state.user?.id,
        timestamp: new Date().toISOString(),
      });

      await authService.logout();

      logInfo("Logout completed successfully", "auth", {
        userId: state.user?.id, // Include userId in completion log
        timestamp: new Date().toISOString(),
      });

      resetState(); // Move resetState after logging
    } catch (error) {
      handleAuthError(error, AUTH_ERRORS.LOGOUT_FAILED);
      logError(error, "auth");
      throw error;
    } finally {
      updateState({ loading: false });
    }
  }, [updateState, handleAuthError, resetState, state.user]);

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: !!state.user,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
