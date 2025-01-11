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
    if (!authService.isAuthenticated()) {
      updateState({ user: null, loading: false });
      return false;
    }

    try {
      const response = await authService.checkAuth();
      if (response?.user) {
        updateState({ user: response.user, error: null });
        return true;
      }
      return false;
    } catch (error) {
      updateState({ user: null });
      if (error.response?.status === 401) {
        authService._clearAuthData();
      }
      return false;
    } finally {
      updateState({ loading: false });
    }
  }, [updateState]);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        updateState({ loading: false });
        return;
      }

      try {
        await checkAuthStatus();
      } finally {
        if (isMounted) {
          updateState({ loading: false });
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [checkAuthStatus, updateState]);

  useEffect(() => {
    const handleAuthStateChange = (event) => {
      const { authenticated } = event.detail;
      if (!authenticated) {
        updateState({ user: null });
      }
    };

    window.addEventListener("authStateChange", handleAuthStateChange);
    return () => {
      window.removeEventListener("authStateChange", handleAuthStateChange);
    };
  }, [updateState]);

  const login = useCallback(
    async (credentials) => {
      updateState({ loading: true });
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
    isAuthenticated: !!state.user,
    login,
    logout,
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
