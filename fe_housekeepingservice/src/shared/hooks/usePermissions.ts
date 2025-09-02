import { useState, useEffect, useCallback } from 'react';
import { permissionService } from '../../services';
import type { 
  PermissionResponse, 
  RoleResponse,
  UserPermissionResponse,
  PermissionSearchParams
} from '../../types/permission';

export const usePermissions = (params?: PermissionSearchParams) => {
  const [data, setData] = useState<PermissionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async (searchParams?: PermissionSearchParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await permissionService.getAllPermissions(searchParams || params);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải quyền hạn');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const refetch = (newParams?: PermissionSearchParams) => {
    fetchPermissions(newParams);
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};

export const useRoles = () => {
  const [data, setData] = useState<RoleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await permissionService.getAllRoles();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải vai trò');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const refetch = () => {
    fetchRoles();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};

export const useUserPermissions = () => {
  const [data, setData] = useState<UserPermissionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPermissions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await permissionService.getCurrentUserPermissions();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải quyền người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  const checkPermission = async (permission: string): Promise<boolean> => {
    try {
      const response = await permissionService.checkPermission(permission);
      return response.hasPermission;
    } catch (err) {
      console.error('Error checking permission:', err);
      return false;
    }
  };

  const refetch = () => {
    fetchUserPermissions();
  };

  return {
    data,
    loading,
    error,
    refetch,
    checkPermission
  };
};
