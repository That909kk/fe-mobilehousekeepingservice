import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMenuPermissions } from '../hooks/useMenuPermissions';
import type { UserRole } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  requiredPermission?: {
    module: string;
    action: string;
    resource?: string;
  };
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredRoles,
  requiredPermission,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, role, loading: authLoading } = useAuth();
  const { hasPermission, loading: permissionsLoading } = useMenuPermissions();
  const location = useLocation();

  // Show loading spinner while checking authentication and permissions
  if (authLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check single required role
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check multiple required roles
  if (requiredRoles && (!role || !requiredRoles.includes(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check required permission
  if (requiredPermission && isAuthenticated) {
    const hasRequiredPermission = hasPermission(
      requiredPermission.module,
      requiredPermission.action,
      requiredPermission.resource
    );

    if (!hasRequiredPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Không có quyền truy cập
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên để được cấp quyền.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors duration-200"
            >
              Quay lại
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
