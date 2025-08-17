import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import type { CustomerData, EmployeeData, AdminData, UserRole } from '../../types/auth';

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
        
        // Validate token
        await authService.validateToken();
        
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

  const login = async (credentials: any) => {
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
    } catch (error) {
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
    } catch (error) {
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
