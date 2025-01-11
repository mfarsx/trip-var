import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useAuth } from "../hooks/useAuth";
import {
  WrappedLoginPage,
  WrappedSignupPage,
  WrappedTextGeneratorPage,
  WrappedProfilePage,
  WrappedTestUserPage,
  WrappedHomePage,
} from "../pages";
import LoadingSpinner from "../components/ui/LoadingSpinner";

// PublicRoute component for login/signup pages
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="12" />
      </div>
    );
  }

  // If user is authenticated, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ProtectedLayout component that combines Layout and ProtectedRoute
const ProtectedLayout = ({ children }) => {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
};

export default function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes - redirect to home if already logged in */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <WrappedLoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <WrappedSignupPage />
          </PublicRoute>
        }
      />

      {/* Protected routes - require authentication */}
      <Route
        path="/"
        element={
          <ProtectedLayout>
            <WrappedHomePage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/text-generator"
        element={
          <ProtectedLayout>
            <WrappedTextGeneratorPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedLayout>
            <WrappedProfilePage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/test"
        element={
          <ProtectedLayout>
            <WrappedTestUserPage />
          </ProtectedLayout>
        }
      />

      {/* Catch all route */}
      <Route
        path="*"
        element={<Navigate to={user ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}
