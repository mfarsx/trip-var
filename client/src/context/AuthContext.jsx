import { createContext, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { ErrorBoundary } from "../components/ErrorBoundary";
import { validateToken, getTokenExpiration } from "../utils/authUtils";
import config from "../config";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUserData = localStorage.getItem("userData");

        if (token && storedUserData) {
          // Validate token with backend
          await validateToken(token);
          setUser(JSON.parse(storedUserData));
        }
      } catch (error) {
        console.error("Auth validation error:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("userData");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(
    async (token, userData) => {
      try {
        localStorage.setItem("token", token);
        localStorage.setItem("userData", JSON.stringify(userData));
        setUser(userData);

        const tokenExp = getTokenExpiration(token);
        if (tokenExp) {
          const timeUntilExpiry = tokenExp - Date.now() - 60000; // 1 minute before expiration
          if (timeUntilExpiry > 0) {
            setTimeout(logout, timeUntilExpiry);
          } else {
            logout();
          }
        }
      } catch (error) {
        console.error("Error setting auth state:", error);
        throw error;
      }
    },
    [logout]
  );

  useEffect(() => {
    let timeoutId;

    const setupTokenExpiration = () => {
      const token = localStorage.getItem("token");
      if (token) {
        const exp = getTokenExpiration(token);
        if (exp) {
          const timeUntilExpiry = exp - Date.now() - 60000;
          if (timeUntilExpiry > 0) {
            timeoutId = setTimeout(logout, timeUntilExpiry);
          } else {
            logout();
          }
        }
      }
    };

    setupTokenExpiration();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [logout]);

  const signup = async (userData) => {
    try {
      console.log("Attempting signup with:", userData);

      const response = await fetch(
        `${config.apiUrl}${config.apiPath}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userData.email,
            password: userData.password,
            full_name: userData.fullName,
          }),
        }
      );

      console.log("Signup response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Signup error response:", errorData);
        throw new Error(errorData.detail || "Registration failed");
      }

      const data = await response.json();
      console.log("Signup success:", data);
      return data;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    signup,
    loading,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    </ErrorBoundary>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
