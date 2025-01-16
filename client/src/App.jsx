import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';
import { ErrorBoundaryWithFallback } from './utils/error/errorHandler';

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
