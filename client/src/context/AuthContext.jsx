import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(
    authService.isAuthenticated()
  );
  const [error, setError] = useState(null);

  const checkAuthStatus = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return false;
    }

    try {
      const response = await authService.checkAuth();
      setUser(response.user);
      setIsAuthenticated(true);
      setError(null);
      return true;
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      if (error.response?.status === 401) {
        authService._clearAuthData();
      }
      if (error.response?.status !== 401) {
        setError(error.message);
      }
      return false;
    }
  }, []);

  // Initial auth check
  useEffect(() => {
    let isMounted = true;
    const publicRoutes = ["/login", "/signup", "/forgot-password"];

    const checkAuth = async () => {
      try {
        if (
          authService.isAuthenticated() &&
          !publicRoutes.some((route) =>
            window.location.pathname.includes(route)
          )
        ) {
          await checkAuthStatus();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Set up periodic auth check every 5 minutes
    const authCheckInterval = setInterval(checkAuthStatus, 5 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(authCheckInterval);
    };
  }, [checkAuthStatus]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signup = useCallback(async (userData) => {
    setLoading(true);
    try {
      const response = await authService.signup(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      setError(null);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      setError(null);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    error,
    clearError,
    signup,
    login,
    logout,
    checkAuthStatus,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
