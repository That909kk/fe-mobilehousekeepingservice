import { apiClient } from './httpClient';

// Types for Permission Management API
interface PermissionFeature {
  featureId: number;
  featureName: string;
  description: string;
  isEnabled: boolean;
}

interface PermissionModule {
  moduleName: string;
  features: PermissionFeature[];
}

interface PermissionRole {
  roleId: number;
  roleName: string;
  modules: PermissionModule[];
}

// Simple role type for role list
interface Role {
  roleId: number;
  roleName: string;
}

interface RolesListResponse {
  success: boolean;
  message: string;
  data: Role[];
}

interface RolesResponse {
  success: boolean;
  message: string;
  data: PermissionRole[];
}

interface RoleDetailResponse {
  success: boolean;
  message: string;
  data: PermissionRole[];
}

interface UpdateFeatureRequest {
  isEnabled: boolean;
}

interface UpdateFeatureResponse {
  success: boolean;
  message: string;
}

export const permissionService = {
  // GET /api/v1/admin/permissions/roles - Lấy danh sách vai trò (chỉ lấy roleId và roleName)
  getManageableRoles: async (): Promise<RolesListResponse> => {
    const response = await apiClient.get<RolesListResponse>('/admin/permissions/roles');
    return response.data;
  },

  // GET /api/v1/admin/permissions/roles - Lấy danh sách vai trò (deprecated - sử dụng getManageableRoles thay thế)
  getRoles: async (): Promise<RolesResponse> => {
    const response = await apiClient.get<RolesResponse>('/admin/permissions/roles');
    return response.data;
  },

  // GET /api/v1/admin/permissions/roles/{roleId} - Lấy chi tiết quyền của vai trò
  getRoleDetail: async (roleId: number): Promise<RoleDetailResponse> => {
    const response = await apiClient.get<RoleDetailResponse>(`/admin/permissions/roles/${roleId}`);
    return response.data;
  },

  // PUT /api/v1/admin/permissions/roles/{roleId}/features/{featureId} - Cập nhật quyền tính năng
  updateFeaturePermission: async (
    roleId: number, 
    featureId: number, 
    data: UpdateFeatureRequest
  ): Promise<UpdateFeatureResponse> => {
    const response = await apiClient.put<UpdateFeatureResponse>(
      `/admin/permissions/roles/${roleId}/features/${featureId}`, 
      data
    );
    return response.data;
  },

  // GET /api/v1/permissions/current-user - Lấy quyền của user hiện tại
  getCurrentUserPermissions: async (): Promise<RoleDetailResponse> => {
    const response = await apiClient.get<RoleDetailResponse>('/permissions/current-user');
    return response.data;
  },

  // GET /api/v1/permissions - Lấy tất cả permissions (có thể có search params)
  getAllPermissions: async (params?: any): Promise<any> => {
    const response = await apiClient.get('/permissions', { params });
    return response.data;
  },

  // GET /api/v1/admin/roles - Lấy tất cả roles
  getAllRoles: async (): Promise<any> => {
    const response = await apiClient.get('/admin/roles');
    return response.data;
  },

  // POST /api/v1/permissions/check - Kiểm tra permission cụ thể
  checkPermission: async (permission: string): Promise<any> => {
    const response = await apiClient.post('/permissions/check', { permission });
    return response.data;
  },

  // Lấy modules có quyền từ role detail
  getEnabledModules: (roleData: PermissionRole): string[] => {
    return roleData.modules
      .filter(module => module.features.some(feature => feature.isEnabled))
      .map(module => module.moduleName);
  },

  // Kiểm tra user có quyền với feature cụ thể không
  hasFeaturePermission: (roleData: PermissionRole, featureName: string): boolean => {
    for (const module of roleData.modules) {
      const feature = module.features.find(f => f.featureName === featureName);
      if (feature && feature.isEnabled) {
        return true;
      }
    }
    return false;
  },

  // Kiểm tra module có ít nhất 1 feature enabled không
  hasModulePermission: (roleData: PermissionRole, moduleName: string): boolean => {
    const module = roleData.modules.find(m => m.moduleName === moduleName);
    return module ? module.features.some(feature => feature.isEnabled) : false;
  }
};

export type { 
  PermissionFeature, 
  PermissionModule, 
  PermissionRole,
  Role,
  RolesListResponse,
  RolesResponse, 
  RoleDetailResponse,
  UpdateFeatureRequest,
  UpdateFeatureResponse 
};
