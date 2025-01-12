"use client";

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Navbar } from "./Navbar";
import { ErrorBoundaryWithFallback } from "../utils/error/errorHandler";

export function Layout({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're not loading and not authenticated
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, navigate, authLoading]);

  if (authLoading) {
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

  // Only render the layout if we're authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <ErrorBoundaryWithFallback>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </ErrorBoundaryWithFallback>
  );
}
