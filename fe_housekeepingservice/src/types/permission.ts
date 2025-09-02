// Permission related types
export interface Permission {
  permissionId: string;
  permissionName: string;
  description: string;
  module: string;
  action: string;
  resource: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  roleId: string;
  roleName: string;
  description: string;
  permissions: Permission[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

// Permission Management API Types
export interface ManageableRole {
  roleId: number;
  roleName: string;
}

export interface Feature {
  featureId: number;
  featureName: string;
  description: string;
  isEnabled: boolean;
}

export interface Module {
  moduleName: string;
  features: Feature[];
}

export interface RolePermissionDetail {
  roleId: number;
  roleName: string;
  modules: Module[];
}

export interface UpdateFeatureRequest {
  isEnabled: boolean;
}

export interface ManageableRolesResponse {
  success: boolean;
  message: string;
  data: ManageableRole[];
}

export interface RolePermissionResponse {
  success: boolean;
  message: string;
  data: RolePermissionDetail[];
}

export interface UserPermission {
  userId: string;
  username: string;
  role: string;
  permissions: string[];
  hasPermission: (permission: string) => boolean;
}

export interface PermissionSearchParams {
  module?: string;
  action?: string;
  resource?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreatePermissionRequest {
  permissionName: string;
  description: string;
  module: string;
  action: string;
  resource: string;
}

export interface UpdatePermissionRequest {
  permissionName?: string;
  description?: string;
  module?: string;
  action?: string;
  resource?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface AssignPermissionRequest {
  roleId: string;
  permissionIds: string[];
}

export interface PermissionResponse {
  success: boolean;
  message: string;
  data: Permission[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RoleResponse {
  success: boolean;
  message: string;
  data: Role[];
}

export interface SinglePermissionResponse {
  success: boolean;
  message: string;
  data: Permission;
}

export interface SingleRoleResponse {
  success: boolean;
  message: string;
  data: Role;
}

export interface UserPermissionResponse {
  success: boolean;
  message: string;
  data: UserPermission;
}
