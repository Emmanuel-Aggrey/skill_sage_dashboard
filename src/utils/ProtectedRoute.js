import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useSelector((state) => state.user);

  console.log(user)

  if (!user.isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default ProtectedRoute;
