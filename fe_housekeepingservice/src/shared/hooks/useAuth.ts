import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { permissionService } from '../../services/permissionService';
import type { CustomerData, EmployeeData, AdminData, UserRole, LoginRequest } from '../../types/auth';

interface AuthState {
  isAuthenticated: boolean;
  user: CustomerData | EmployeeData | AdminData | null;
  role: UserRole | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    role: null,
    loading: true
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const isAuth = authService.isAuthenticated();
      
      if (isAuth) {
        const user = authService.getCurrentUser();
        const role = authService.getCurrentUserRole() as UserRole;
        
        // Kiểm tra xem permissions đã được lưu chưa
        const storage = localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;
        const savedPermissions = storage.getItem('userRoleData');
        
        if (!savedPermissions && user) {
          // Nếu chưa có permissions trong storage, fetch từ API based on user type
          try {
            let permissionsResponse;
            if ('customerId' in user) {
              permissionsResponse = await permissionService.getCustomerFeatures(user.customerId);
              permissionsResponse = {
                success: permissionsResponse.data.success,
                message: permissionsResponse.data.message,
                data: permissionsResponse.data.data
              };
            } else if ('employeeId' in user) {
              permissionsResponse = await permissionService.getEmployeeFeatures(user.employeeId);
              permissionsResponse = {
                success: permissionsResponse.data.success,
                message: permissionsResponse.data.message,
                data: permissionsResponse.data.data
              };
            } else if ('adminId' in user) {
              permissionsResponse = await permissionService.getRoleDetail(3);
            }
            
            if (permissionsResponse?.success && permissionsResponse.data && permissionsResponse.data.length > 0) {
              const roleData = permissionsResponse.data[0];
              storage.setItem('userRoleData', JSON.stringify(roleData));
            }
          } catch (permissionError) {
            console.error('Failed to fetch permissions during auth check:', permissionError);
          }
        }
        
        // Temporarily disable token validation for testing
        // TODO: Re-enable when backend is properly configured
        // await authService.validateToken();
        
        setAuthState({
          isAuthenticated: true,
          user,
          role,
          loading: false
        });
        
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          role: null,
          loading: false
        });
      }
    } catch (error) {
      console.error('Auth state check error:', error);
      // Token is invalid or expired
      authService.logout();
      setAuthState({
        isAuthenticated: false,
        user: null,
        role: null,
        loading: false
      });
    }
  };

  const login = async (credentials: LoginRequest & { rememberMe?: boolean }) => {
    const response = await authService.login(credentials);
    if (response.success) {
      setAuthState({
        isAuthenticated: true,
        user: response.data.data,
        role: response.data.role,
        loading: false
      });
    }
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setAuthState({
        isAuthenticated: false,
        user: null,
        role: null,
        loading: false
      });
    }
  };

  const refresh = async () => {
    try {
      const refreshToken = authService.getRefreshToken();
      if (refreshToken) {
        const response = await authService.refreshToken(refreshToken);
        if (response.success) {
          // Auth state will be updated through localStorage changes
          await checkAuthState();
        }
      }
    } catch {
      logout();
    }
  };

  const hasRole = (requiredRole: UserRole): boolean => {
    return authState.role === requiredRole;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return authState.role ? roles.includes(authState.role) : false;
  };

  return {
    ...authState,
    login,
    logout,
    refresh,
    hasRole,
    hasAnyRole,
    checkAuthState
  };
};
