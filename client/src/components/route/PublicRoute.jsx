import PropTypes from 'prop-types';
import React from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth.js';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="8" />
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/" />;
}

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PublicRoute;
