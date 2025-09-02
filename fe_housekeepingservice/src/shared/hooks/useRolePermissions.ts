import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { permissionService } from '../../services';
import type { UserPermission } from '../../types/permission';

export const useRolePermissions = () => {
  const { role, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermission | null>(null);

  const loadPermissions = useCallback(async () => {
    if (!isAuthenticated || !role) return;

    setLoading(true);
    setError(null);
    
    try {
      const response = await permissionService.getCurrentUserPermissions();
      if (response.success) {
        setUserPermissions(response.data);
        setPermissions(response.data.permissions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải quyền hạn');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  const hasAnyPermission = (permissionList: string[]): boolean => {
    return permissionList.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissionList: string[]): boolean => {
    return permissionList.every(permission => hasPermission(permission));
  };

  // Các quyền cơ bản theo role
  const getBasicPermissionsByRole = (userRole: string): string[] => {
    switch (userRole) {
      case 'ADMIN':
        return [
          'admin.dashboard.view',
          'user.manage',
          'service.manage',
          'category.manage',
          'permission.manage',
          'schedule.manage',
          'report.view'
        ];
      case 'EMPLOYEE':
        return [
          'employee.dashboard.view',
          'schedule.view',
          'schedule.update',
          'service.view',
          'customer.view'
        ];
      case 'CUSTOMER':
        return [
          'customer.dashboard.view',
          'service.view',
          'service.book',
          'booking.view',
          'booking.manage',
          'profile.view',
          'profile.update'
        ];
      default:
        return [];
    }
  };

  const getMenuItems = () => {
    if (!role) return [];

    const menuItems = [];

    // Dashboard luôn có
    menuItems.push({
      key: 'dashboard',
      label: 'Trang chủ',
      path: '/dashboard',
      icon: 'home',
      permission: `${role.toLowerCase()}.dashboard.view`
    });

    // Menu theo role
    if (role === 'ADMIN') {
      if (hasPermission('user.manage')) {
        menuItems.push({
          key: 'users',
          label: 'Quản lý người dùng',
          path: '/admin/users',
          icon: 'users',
          permission: 'user.manage'
        });
      }

      if (hasPermission('service.manage')) {
        menuItems.push({
          key: 'services',
          label: 'Quản lý dịch vụ',
          path: '/admin/services',
          icon: 'service',
          permission: 'service.manage'
        });
      }

      if (hasPermission('category.manage')) {
        menuItems.push({
          key: 'categories',
          label: 'Quản lý danh mục',
          path: '/admin/categories',
          icon: 'category',
          permission: 'category.manage'
        });
      }

      if (hasPermission('schedule.manage')) {
        menuItems.push({
          key: 'schedules',
          label: 'Quản lý lịch làm việc',
          path: '/admin/schedules',
          icon: 'schedule',
          permission: 'schedule.manage'
        });
      }

      if (hasPermission('permission.manage')) {
        menuItems.push({
          key: 'permissions',
          label: 'Quản lý quyền hạn',
          path: '/admin/permissions',
          icon: 'permission',
          permission: 'permission.manage'
        });
      }

      if (hasPermission('report.view')) {
        menuItems.push({
          key: 'reports',
          label: 'Báo cáo',
          path: '/admin/reports',
          icon: 'report',
          permission: 'report.view'
        });
      }
    }

    if (role === 'EMPLOYEE') {
      if (hasPermission('schedule.view')) {
        menuItems.push({
          key: 'my-schedule',
          label: 'Lịch làm việc',
          path: '/employee/schedule',
          icon: 'schedule',
          permission: 'schedule.view'
        });
      }

      if (hasPermission('service.view')) {
        menuItems.push({
          key: 'services',
          label: 'Dịch vụ',
          path: '/employee/services',
          icon: 'service',
          permission: 'service.view'
        });
      }

      if (hasPermission('customer.view')) {
        menuItems.push({
          key: 'customers',
          label: 'Khách hàng',
          path: '/employee/customers',
          icon: 'customers',
          permission: 'customer.view'
        });
      }
    }

    if (role === 'CUSTOMER') {
      if (hasPermission('service.view')) {
        menuItems.push({
          key: 'services',
          label: 'Dịch vụ',
          path: '/customer/services',
          icon: 'service',
          permission: 'service.view'
        });
      }

      if (hasPermission('booking.view')) {
        menuItems.push({
          key: 'bookings',
          label: 'Đặt lịch của tôi',
          path: '/customer/bookings',
          icon: 'booking',
          permission: 'booking.view'
        });
      }

      if (hasPermission('profile.view')) {
        menuItems.push({
          key: 'profile',
          label: 'Thông tin cá nhân',
          path: '/customer/profile',
          icon: 'profile',
          permission: 'profile.view'
        });
      }
    }

    return menuItems.filter(item => hasPermission(item.permission));
  };

  return {
    permissions,
    userPermissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getBasicPermissionsByRole,
    getMenuItems,
    refetch: loadPermissions
  };
};
