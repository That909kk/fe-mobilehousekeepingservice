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
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const storage = localStorage.getItem('rememberMe') === 'true' ? localStorage : sessionStorage;
      const roleIdStr = storage.getItem('roleId');
      
      if (!roleIdStr) {
        throw new Error('Không tìm thấy roleId');
      }
      
      const roleId = parseInt(roleIdStr);
      const response = await permissionService.getRoleDetail(roleId);
      
      if (response.success && response.data.length > 0) {
        const roleData = response.data[0];
        const enabledModules = permissionService.getEnabledModules(roleData);
        
        // Lưu vào storage
        storage.setItem('userRoleData', JSON.stringify(roleData));
        
        // Convert sang format Permission cũ nếu cần để tương thích
        const permissions: Permission[] = roleData.modules.flatMap(module =>
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
          roleData,
          permissions,
          enabledModules,
          loading: false,
          error: null
        });
      } else {
        throw new Error('Không thể lấy thông tin quyền');
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
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
      const roleId = storage.getItem('roleId');
      
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
      } else if (roleId) {
        // Nếu không có roleData nhưng có roleId, fetch từ API
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
        const roleId = storage.getItem('roleId');
        
        // Nếu có roleId nhưng chưa có data trong state, fetch từ API
        if (roleId && (!state.roleData || state.enabledModules.length === 0)) {
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
      if (e.key === 'userRoleData' || e.key === 'accessToken' || e.key === 'roleId') {
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