import { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { permissionService, type PermissionRole } from '../../services/permissionService';
import type { Permission } from '../../types/permission';

interface PermissionState {
  roleData: PermissionRole | null;
  permissions: Permission[];
  enabledModules: string[];
  loading: boolean;
  error: string | null;
}

export const useUserPermissions = () => {
  const [state, setState] = useState<PermissionState>({
    roleData: null,
    permissions: [],
    enabledModules: [],
    loading: false,
    error: null
  });

  console.log('useUserPermissions - current state:', state);
  console.log('useUserPermissions - authService.isAuthenticated():', authService.isAuthenticated());

  // Lấy role data từ storage
  const getStoredRoleData = (): PermissionRole | null => {
    try {
      const storage = localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;
      const storedRoleData = storage.getItem('userRoleData');
      
      if (storedRoleData) {
        return JSON.parse(storedRoleData);
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing stored role data:', error);
      return null;
    }
  };

  // Lấy permissions từ API
  const fetchUserPermissions = async (): Promise<void> => {
    console.log('useUserPermissions - fetchUserPermissions called');
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const storage = localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;
      const currentUser = JSON.parse(storage.getItem('currentUser') || '{}');
      
      console.log('useUserPermissions - currentUser:', currentUser);
      
      let response;
      if (currentUser && 'adminId' in currentUser) {
        // Admin - gọi API admin với roleId = 3
        response = await permissionService.getRoleDetail(3);
      } else if (currentUser && 'customerId' in currentUser) {
        // Customer - gọi API customer với customerId
        const customerResponse = await permissionService.getCustomerFeatures(currentUser.customerId);
        // Chuyển đổi format để tương thích
        response = {
          success: customerResponse.data.success,
          message: customerResponse.data.message,
          data: customerResponse.data.data
        };
      } else if (currentUser && 'employeeId' in currentUser) {
        // Employee - gọi API employee với employeeId
        const employeeResponse = await permissionService.getEmployeeFeatures(currentUser.employeeId);
        // Chuyển đổi format để tương thích
        response = {
          success: employeeResponse.data.success,
          message: employeeResponse.data.message,
          data: employeeResponse.data.data
        };
      } else {
        throw new Error('Không tìm thấy thông tin user');
      }
      
      if (response.success && response.data.length > 0) {
        const roleData = response.data[0];
        const enabledModules = permissionService.getEnabledModules(roleData);
        
        console.log('useUserPermissions - API Response:', response);
        console.log('useUserPermissions - roleData:', roleData);
        console.log('useUserPermissions - enabledModules:', enabledModules);
        
        // Lưu vào storage
        storage.setItem('userRoleData', JSON.stringify(roleData));
        
        // Convert sang format Permission cũ nếu cần để tương thích
        const permissions: Permission[] = roleData.modules.flatMap((module: any) =>
          module.features
            .filter((feature: any) => feature.isEnabled)
            .map((feature: any) => ({
              permissionId: feature.featureId.toString(),
              permissionName: feature.description,
              description: feature.description,
              module: module.moduleName.toUpperCase(),
              action: feature.featureName.split('.').pop()?.toUpperCase() || 'VIEW',
              resource: feature.featureName,
              status: 'ACTIVE',
              createdAt: '',
              updatedAt: ''
            }))
        );
        
        setState({
          roleData,
          permissions,
          enabledModules,
          loading: false,
          error: null
        });
      } else {
        console.log('useUserPermissions - No data or failed response:', response);
        throw new Error('Không thể lấy thông tin quyền');
      }
    } catch (error) {
      console.error('useUserPermissions - Error fetching permissions:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Lỗi không xác định'
      }));
    }
  };

  // Kiểm tra user có permission với module cụ thể không
  const hasModulePermission = (moduleName: string): boolean => {
    return state.enabledModules.includes(moduleName);
  };

  // Kiểm tra user có permission với feature cụ thể không
  const hasFeaturePermission = (featureName: string): boolean => {
    if (!state.roleData) return false;
    return permissionService.hasFeaturePermission(state.roleData, featureName);
  };

  // Kiểm tra user có permission cụ thể không (tương thích với format cũ)
  const hasPermission = (module: string, _action: string, resource?: string): boolean => {
    if (resource) {
      return hasFeaturePermission(resource);
    }
    return hasModulePermission(module);
  };

  // Kiểm tra user có bất kỳ permission nào trong danh sách không
  const hasAnyPermission = (permissionChecks: Array<{ module: string; action: string; resource?: string }>): boolean => {
    return permissionChecks.some(check => hasPermission(check.module, check.action, check.resource));
  };

  // Load permissions
  useEffect(() => {
    if (authService.isAuthenticated()) {
      // Thử load từ storage trước
      const storedRoleData = getStoredRoleData();
      const storage = localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;
      const currentUser = JSON.parse(storage.getItem('currentUser') || '{}');
      
      // Kiểm tra xem user có phải admin không
      const isAdmin = currentUser && 'adminId' in currentUser;
      
      if (storedRoleData && !isAdmin) {
        // Chỉ sử dụng stored data cho non-admin users
        const enabledModules = permissionService.getEnabledModules(storedRoleData);
        const permissions: Permission[] = storedRoleData.modules.flatMap(module =>
          module.features
            .filter(feature => feature.isEnabled)
            .map(feature => ({
              permissionId: feature.featureId.toString(),
              permissionName: feature.description,
              description: feature.description,
              module: module.moduleName.toUpperCase(),
              action: feature.featureName.split('.').pop()?.toUpperCase() || 'VIEW',
              resource: feature.featureName,
              status: 'ACTIVE',
              createdAt: '',
              updatedAt: ''
            }))
        );
        
        setState({
          roleData: storedRoleData,
          permissions,
          enabledModules,
          loading: false,
          error: null
        });
      } else if (Object.keys(currentUser).length > 0 || isAdmin) {
        // Nếu không có roleData hoặc user là admin, fetch từ API
        fetchUserPermissions();
      } else {
        setState({
          roleData: null,
          permissions: [],
          enabledModules: [],
          loading: false,
          error: null
        });
      }
    } else {
      setState({
        roleData: null,
        permissions: [],
        enabledModules: [],
        loading: false,
        error: null
      });
    }
  }, []);

  // Watch for roleId changes
  useEffect(() => {
    const checkAndFetchPermissions = () => {
      if (authService.isAuthenticated()) {
        const storage = localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;
        const currentUser = JSON.parse(storage.getItem('currentUser') || '{}');
        const isAdmin = currentUser && 'adminId' in currentUser;
        
        // Nếu có user data hoặc là admin nhưng chưa có data trong state, fetch từ API
        if ((Object.keys(currentUser).length > 0 || isAdmin) && (!state.roleData || state.enabledModules.length === 0)) {
          fetchUserPermissions();
        }
      }
    };

    // Check immediately
    checkAndFetchPermissions();
    
    // Also set up an interval to periodically check (fallback)
    const interval = setInterval(checkAndFetchPermissions, 1000);
    
    // Cleanup after 5 seconds to avoid infinite polling
    setTimeout(() => clearInterval(interval), 5000);
    
    return () => clearInterval(interval);
  }, [state.roleData, state.enabledModules.length]);

  // Listen for storage changes (khi user login/logout từ tab khác)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userRoleData' || e.key === 'accessToken' || e.key === 'currentUser') {
        if (authService.isAuthenticated()) {
          const storedRoleData = getStoredRoleData();
          if (storedRoleData) {
            const enabledModules = permissionService.getEnabledModules(storedRoleData);
            const permissions: Permission[] = storedRoleData.modules.flatMap(module =>
              module.features
                .filter(feature => feature.isEnabled)
                .map(feature => ({
                  permissionId: feature.featureId.toString(),
                  permissionName: feature.description,
                  description: feature.description,
                  module: module.moduleName.toUpperCase(),
                  action: feature.featureName.split('.').pop()?.toUpperCase() || 'VIEW',
                  resource: feature.featureName,
                  status: 'ACTIVE',
                  createdAt: '',
                  updatedAt: ''
                }))
            );
            
            setState({
              roleData: storedRoleData,
              permissions,
              enabledModules,
              loading: false,
              error: null
            });
          }
        } else {
          setState({
            roleData: null,
            permissions: [],
            enabledModules: [],
            loading: false,
            error: null
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Set permissions manually
  const setPermissions = (newPermissions: Permission[]) => {
    setState(prev => ({
      ...prev,
      permissions: newPermissions
    }));
  };

  return {
    ...state,
    hasPermission,
    hasModulePermission,
    hasFeaturePermission,
    hasAnyPermission,
    setPermissions,
    refreshPermissions: fetchUserPermissions
  };
};
