import React, { createContext, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { logError } from "../utils/logger";
import { AuthenticationError, NetworkError, handleError } from "../utils/error";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getUser());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check auth status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.getToken()) {
          const userData = await authService.checkAuth();
          setUser(userData);
        }
      } catch (error) {
        handleError(error, "auth.initialize");
        authService.clearAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signup = useCallback(
    async (userData) => {
      setLoading(true);
      try {
        const response = await authService.signup(userData);
        setUser(response.user);
        navigate("/", { replace: true });
        return response;
      } catch (error) {
        handleError(error, "auth.signup");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      return response;
    } catch (error) {
      handleError(error, "auth.login");
      throw error; // Re-throw to let components handle specific cases
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      navigate("/login", { replace: true });
    } catch (error) {
      handleError(error, "auth.logout");
      // Still clear local state even if server logout fails
      setUser(null);
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const checkAuth = useCallback(async () => {
    try {
      const userData = await authService.checkAuth();
      if (userData) {
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      handleError(error, "auth.checkAuth");
      return false;
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    signup,
    checkAuth,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
