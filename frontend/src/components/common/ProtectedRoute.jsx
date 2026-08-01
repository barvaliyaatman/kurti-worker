import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Loading from './Loading.jsx';
import { ROUTES } from '../../constants/index.js';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading fullScreen message="Verifying session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (user?.password_reset_required) {
    return <Navigate to="/force-password-reset" replace />;
  }

  return children;
};

export default ProtectedRoute;
