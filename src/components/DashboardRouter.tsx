import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const DashboardRouter = () => {
  const { user, userProfile, loading } = useAuth();

  // Early return for loading state with faster, minimal UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Get user role from profile with fallback
  const userRole = userProfile?.role || 'client';

  // Redirect to appropriate dashboard based on role
  switch (userRole) {
    case 'super_admin':
      return <Navigate to="/admin-dashboard" replace />;
    case 'company':
      return <Navigate to="/firm-dashboard" replace />;
    case 'advocate':
      return <Navigate to="/lawyer-dashboard" replace />;
    case 'client':
      return <Navigate to="/client-dashboard" replace />;
    default:
      return <Navigate to="/client-dashboard" replace />;
  }
};

export default DashboardRouter;