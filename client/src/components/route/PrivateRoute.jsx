import PropTypes from 'prop-types';
import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth.js';
import { Layout } from '../Layout';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

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
    <Navigate to="/login" replace state={{ from: window.location.pathname }} />
  );
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrivateRoute;
