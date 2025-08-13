import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const DashboardRouter = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Get user role from profile
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