import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import Loading from './Loading.jsx';

export const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen message="Checking permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role matching (supports both OWNER and Owner formats)
  const userRoleUpper = user.role ? user.role.toUpperCase() : '';
  const allowedUpper = allowedRoles.map((r) => r.toUpperCase());

  if (allowedRoles.length > 0 && !allowedUpper.includes(userRoleUpper)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

export default RoleRoute;
