import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

const initialState = {
  user: null,
  loading: true,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  const updateState = useCallback((updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      if (!authService.isAuthenticated()) {
        updateState({ user: null, loading: false });
        return false;
      }

      const response = await authService.checkAuth();
      if (response?.user) {
        updateState({ user: response.user, error: null, loading: false });
        return true;
      }

      // Keep the token if we just don't have user data
      updateState({ user: null, loading: false });
      return false;
    } catch (error) {
      console.error("Auth check failed:", error);
      // Only clear auth data if token is expired
      if (
        error.response?.status === 401 &&
        error.response?.data?.detail?.includes("expired")
      ) {
        authService._clearAuthData();
        updateState({ user: null, loading: false, error: error.message });
      } else {
        // For other errors, keep the token but update the state
        updateState({ user: null, loading: false, error: error.message });
      }
      return false;
    }
  }, [updateState]);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (isMounted) {
        await checkAuthStatus();
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [checkAuthStatus]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "token") {
        checkAuthStatus();
      }
    };

    const handleAuthStateChange = (event) => {
      if (!event.detail.authenticated) {
        updateState({ user: null, loading: false });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authStateChange", handleAuthStateChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStateChange", handleAuthStateChange);
    };
  }, [checkAuthStatus, updateState]);

  const signup = useCallback(
    async (userData) => {
      updateState({ loading: true, error: null });
      try {
        const response = await authService.signup(userData);
        if (response?.user) {
          updateState({ user: response.user, error: null });
        }
        return response;
      } catch (error) {
        updateState({ error: error.message });
        throw error;
      } finally {
        updateState({ loading: false });
      }
    },
    [updateState]
  );

  const login = useCallback(
    async (credentials) => {
      updateState({ loading: true, error: null });
      try {
        const response = await authService.login(credentials);
        if (response?.user) {
          updateState({ user: response.user, error: null });
        }
        return response;
      } catch (error) {
        updateState({ error: error.message });
        throw error;
      } finally {
        updateState({ loading: false });
      }
    },
    [updateState]
  );

  const logout = useCallback(async () => {
    updateState({ loading: true });
    try {
      await authService.logout();
      updateState({ user: null, error: null });
    } catch (error) {
      updateState({ error: error.message });
      throw error;
    } finally {
      updateState({ loading: false });
    }
  }, [updateState]);

  const value = {
    ...state,
    isAuthenticated: authService.isAuthenticated() || !!state.user,
    login,
    logout,
    signup,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
