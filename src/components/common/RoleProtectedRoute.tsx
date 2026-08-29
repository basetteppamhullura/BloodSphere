import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface RoleProtectedRouteProps {
  requiredRole: UserRole;
  children: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ requiredRole, children }) => {
  const { authorizeRole } = useAuth();
  const { showToast } = useApp();
  const location = useLocation();

  const authCheck = authorizeRole(requiredRole);

  useEffect(() => {
    if (!authCheck.isAuthorized && authCheck.userRole) {
      showToast(`Unauthorized access. Redirecting to your ${authCheck.userRole.toUpperCase()} home page.`);
    } else if (!authCheck.isAuthorized && !authCheck.userRole) {
      showToast(`Authentication required. Redirecting to ${requiredRole.toUpperCase()} login.`);
    }
  }, [authCheck.isAuthorized, authCheck.userRole, requiredRole, location.pathname]);

  if (!authCheck.isAuthorized) {
    return <Navigate to={authCheck.redirectPath} replace />;
  }

  return <>{children}</>;
};
