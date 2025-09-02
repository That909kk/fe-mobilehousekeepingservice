import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import { permissionService } from '../../services/permissionService';
// import { useUserPermissions } from '../../shared/hooks/useUserPermissions'; // Removed - not needed
import { useStaticData, getNestedValue } from '../../shared/hooks/useStaticData';
import { useLanguage } from '../../shared/hooks/useLanguage';
import { getRoleId } from '../../utils/roleMapping';
import type { UserRole } from '../../types/auth';

interface RoleData {
  [key: string]: string;
}

interface RoleSelectState {
  roles: RoleData;
  roleNumbers: number;
  loading: boolean;
  error: string | null;
  selectedRole: UserRole | null;
}

const RoleSelector: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { data: staticData, loading: staticLoading } = useStaticData('role-selector', language);
  // const { setPermissions } = useUserPermissions(); // Removed - not needed anymore
  
  const [state, setState] = useState<RoleSelectState>({
    roles: {},
    roleNumbers: 0,
    loading: false,
    error: null,
    selectedRole: null
  });

  // Lấy thông tin từ navigation state
  const username = location.state?.username;
  const password = location.state?.password;

  const handleRoleSelect = useCallback(async (role: UserRole) => {
    setState(prev => ({ ...prev, selectedRole: role, loading: true, error: null }));
    
    try {
      const loginResponse = await authService.login({
        username: username!,
        password: password!,
        role,
        deviceType: 'WEB',
        rememberMe: location.state?.rememberMe || false
      });

      if (loginResponse.success && loginResponse.data?.accessToken) {
        // Lấy roleId từ mapping
        const roleId = getRoleId(role);
        
        if (roleId) {
          // Lưu roleId vào storage
          const storage = location.state?.rememberMe ? localStorage : sessionStorage;
          storage.setItem('roleId', roleId.toString());
          
          try {
            // Fetch permissions với roleId
            const permissionsResponse = await permissionService.getRoleDetail(roleId);
            
            // Lưu role data vào localStorage để sử dụng trong app
            if (permissionsResponse.success && permissionsResponse.data && permissionsResponse.data.length > 0) {
              const roleData = permissionsResponse.data[0];
              storage.setItem('userRoleData', JSON.stringify(roleData));
              
              // Navigate to dashboard - useUserPermissions sẽ tự động load permissions
              const redirectPath = role === 'ADMIN' ? '/dashboard' : '/dashboard';
              navigate(redirectPath, { replace: true });
              return; // Early return
            }
          } catch (permissionError) {
            console.error('Failed to fetch permissions:', permissionError);
            // Vẫn navigate, useUserPermissions sẽ retry
            const redirectPath = role === 'ADMIN' ? '/dashboard' : '/dashboard';
            navigate(redirectPath, { replace: true });
            return;
          }
        } else {
          console.warn('No roleId found for role:', role);
        }

        // Fallback navigate nếu chưa navigate
        const redirectPath = role === 'ADMIN' ? '/dashboard' : '/dashboard';
        navigate(redirectPath, { replace: true });
      } else {
        setState(prev => ({
          ...prev,
          error: loginResponse.message,
          loading: false,
          selectedRole: null
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Có lỗi xảy ra khi đăng nhập',
        loading: false,
        selectedRole: null
      }));
    }
  }, [username, password, location.state?.rememberMe, navigate]);

  useEffect(() => {
    if (!username || !password) {
      navigate('/login');
      return;
    }

    const fetchRoles = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        const response = await authService.getRoles(username, password);
        if (response.success) {
          setState(prev => ({
            ...prev,
            roles: response.data,
            roleNumbers: response.roleNumbers,
            loading: false
          }));
          
          // Nếu chỉ có 1 role, tự động chọn và đăng nhập
          if (response.roleNumbers === 1) {
            const singleRole = Object.keys(response.data)[0] as UserRole;
            handleRoleSelect(singleRole);
          }
        } else {
          setState(prev => ({
            ...prev,
            error: response.message,
            loading: false
          }));
        }
      } catch {
        setState(prev => ({
          ...prev,
          error: 'Có lỗi xảy ra khi lấy danh sách vai trò',
          loading: false
        }));
      }
    };

    fetchRoles();
  }, [username, password, navigate, handleRoleSelect]);

  const getRoleDisplayName = (roleKey: string): string => {
    const roleNames: { [key: string]: string } = {
      'ADMIN': getNestedValue(staticData, 'roles.admin', 'Quản trị viên'),
      'EMPLOYEE': getNestedValue(staticData, 'roles.employee', 'Nhân viên'),
      'CUSTOMER': getNestedValue(staticData, 'roles.customer', 'Khách hàng')
    };
    return roleNames[roleKey] || roleKey;
  };

  const getRoleDescription = (roleKey: string): string => {
    const descriptions: { [key: string]: string } = {
      'ADMIN': getNestedValue(staticData, 'descriptions.admin', 'Quản lý hệ thống và người dùng'),
      'EMPLOYEE': getNestedValue(staticData, 'descriptions.employee', 'Thực hiện các dịch vụ giúp việc'),
      'CUSTOMER': getNestedValue(staticData, 'descriptions.customer', 'Đặt và sử dụng dịch vụ')
    };
    return descriptions[roleKey] || '';
  };

  if (staticLoading || state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {getNestedValue(staticData, 'loading', 'Đang tải...')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {getNestedValue(staticData, 'title', 'Chọn vai trò')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {getNestedValue(staticData, 'subtitle', 'Vui lòng chọn vai trò để tiếp tục')}
          </p>
        </div>

        {state.error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{state.error}</div>
          </div>
        )}

        <div className="space-y-4">
          {Object.entries(state.roles).map(([roleKey]) => (
            <button
              key={roleKey}
              onClick={() => handleRoleSelect(roleKey as UserRole)}
              disabled={state.selectedRole === roleKey}
              className={`
                w-full flex items-center justify-between p-6 border-2 rounded-lg transition-all duration-200
                ${state.selectedRole === roleKey 
                  ? 'border-blue-500 bg-blue-50 cursor-not-allowed' 
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                }
              `}
            >
              <div className="flex-1 text-left">
                <h3 className="text-lg font-medium text-gray-900">
                  {getRoleDisplayName(roleKey)}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {getRoleDescription(roleKey)}
                </p>
              </div>
              
              {state.selectedRole === roleKey && (
                <div className="ml-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            {getNestedValue(staticData, 'backToLogin', '← Quay lại đăng nhập')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
