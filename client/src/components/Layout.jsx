import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Navbar } from "./Navbar";
import { ErrorBoundaryWithFallback } from "../utils/error/errorHandler";
import { logError } from "../utils/logger";

export function Layout({ children }) {
  const { isAuthenticated, checkAuth, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const validateAuth = async () => {
      try {
        if (mounted) {
          const isValid = await checkAuth();
          if (!isValid) {
            logError("User not authenticated", "layout.auth");
            navigate("/login", { replace: true });
          }
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          logError("Auth validation failed", "layout.auth", {
            error: error?.message,
          });
          navigate("/login", { replace: true });
          setLoading(false);
        }
      }
    };

    if (!isAuthenticated && !authLoading) {
      validateAuth();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, checkAuth, navigate, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-2 border-b-2 border-indigo-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-30 blur-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <ErrorBoundaryWithFallback>
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </ErrorBoundaryWithFallback>
    </div>
  );
}
