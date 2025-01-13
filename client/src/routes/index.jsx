import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import TextGeneratorPage from "../pages/TextGeneratorPage";
import TravelPlannerPage from "../pages/TravelPlannerPage";
import SignupPage from "../pages/SignupPage";
import { Layout } from "../components/Layout";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="8" />
      </div>
    );
  }

  return isAuthenticated ? (
    <Layout>{children}</Layout>
  ) : (
    <Navigate to="/login" />
  );
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="8" />
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/" />;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <HomePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/text-generator"
        element={
          <PrivateRoute>
            <TextGeneratorPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/travel"
        element={
          <PrivateRoute>
            <TravelPlannerPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
