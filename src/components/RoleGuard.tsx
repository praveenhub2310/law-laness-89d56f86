
import React from 'react';
import { Navigate } from 'react-router-dom';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

const RoleGuard = ({ children, allowedRoles, fallbackPath = '/dashboard' }: RoleGuardProps) => {
  const getUserRole = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.role || 'client';
    } catch {
      return 'client';
    }
  };

  const userRole = getUserRole();
  
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
