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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Initial auth check
  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const response = await authService.checkAuth();
        if (isMounted) {
          setUser(response.user);
          setIsAuthenticated(true);
          setError(null);
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          setError(error.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Sadece login sayfasında değilsek auth check yapalım
    if (!window.location.pathname.includes("/login")) {
      checkAuth();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const signup = useCallback(async (userData) => {
    try {
      const response = await authService.signup(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      setError(null);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      setError(null);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (error) {
      setError(error.message);
      throw error;
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
