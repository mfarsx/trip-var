import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import PropTypes from "prop-types";

export function ProtectedRoute({ children }) {
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateAuth = async () => {
      try {
        const user = await authService.checkAuth();
        setIsValid(!!user);
      } catch (error) {
        setIsValid(false);
      } finally {
        setIsLoading(false);
      }
    };

    validateAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 dark:border-indigo-400"></div>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
