import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ErrorBoundaryWithFallback } from "./utils/error/errorHandler";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes";

export const App = () => {
  return (
    <ErrorBoundaryWithFallback>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ErrorBoundaryWithFallback>
  );
};
