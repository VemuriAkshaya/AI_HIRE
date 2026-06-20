import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  // Not logged in: redirect to respective login
  if (!user) {
    if (allowedRole === 'recruiter') {
      return <Navigate to="/recruiter/login" replace />;
    }
    return <Navigate to="/seeker/login" replace />;
  }

  // Logged in, but wrong role: redirect to correct dashboard
  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'recruiter') {
      return <Navigate to="/recruiter/dashboard" replace />;
    }
    return <Navigate to="/seeker/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
