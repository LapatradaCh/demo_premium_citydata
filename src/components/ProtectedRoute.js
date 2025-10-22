// src/components/ProtectedRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';

/* check token if not redirect to login */
const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
