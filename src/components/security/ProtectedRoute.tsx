import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionsContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireModerator?: boolean;
}

/**
 * A component that protects routes based on authentication and permissions
 * 
 * @param children The components to render if access is granted
 * @param requiredPermission Optional specific permission required to access the route
 * @param requireAuth Whether authentication is required (default: true)
 * @param requireAdmin Whether admin role is required
 * @param requireModerator Whether moderator role is required
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requireAuth = true,
  requireAdmin = false,
  requireModerator = false
}) => {
  const { isAuthenticated, isAdminAuthenticated } = useAuth();
  const { hasPermission, isAdmin, isModerator, isLoading } = usePermissions();
  const location = useLocation();
  
  // Show loading state while permissions are being loaded
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Checking permissions...</p>
        </div>
      </div>
    );
  }
  
  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    // Redirect to login page and remember the page user was trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if admin authentication is required
  if (requireAdmin && !isAdmin) {
    // If user is authenticated but not an admin, redirect to unauthorized page
    if (isAuthenticated) {
      return <Navigate to="/unauthorized" replace />;
    }
    // If user is not authenticated, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if moderator role is required
  if (requireModerator && !isModerator && !isAdmin) {
    // If user is authenticated but not a moderator or admin, redirect to unauthorized page
    if (isAuthenticated) {
      return <Navigate to="/unauthorized" replace />;
    }
    // If user is not authenticated, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if specific permission is required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    // If user is authenticated but doesn't have the required permission, redirect to unauthorized page
    if (isAuthenticated) {
      return <Navigate to="/unauthorized" replace />;
    }
    // If user is not authenticated, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
