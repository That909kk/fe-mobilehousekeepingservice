import { useState, useEffect } from 'react';
import { useUserPermissions } from './useUserPermissions';

interface MenuPermission {
  module: string;
  action: string;
  resource: string;
  label: string;
  path: string;
  icon?: string;
  description?: string;
}

interface MenuGroup {
  title: string;
  key: string;
  menus: MenuPermission[];
}

export const useMenuPermissions = () => {
  const { 
    enabledModules, 
    loading, 
    error, 
    hasModulePermission,
    hasFeaturePermission 
  } = useUserPermissions();
  const [availableMenus, setAvailableMenus] = useState<MenuPermission[]>([]);

  // Debug logs
  console.log('useMenuPermissions - enabledModules:', enabledModules);
  console.log('useMenuPermissions - loading:', loading);
  console.log('useMenuPermissions - error:', error);

  // Định nghĩa tất cả các menu có thể có trong hệ thống với mapping tới module names từ API
  const allMenus: MenuPermission[] = [
    // Admin Dashboard
    {
      module: 'Admin',
      action: 'VIEW',
      resource: 'admin.dashboard.view',
      label: 'Dashboard Admin',
      path: '/admin/dashboard',
      icon: '🏠',
      description: 'Trang chủ quản trị hệ thống'
    },
    
    // Admin User Management
    {
      module: 'Admin',
      action: 'MANAGE',
      resource: 'admin.user.manage',
      label: 'Quản lý người dùng',
      path: '/admin/users',
      icon: '👥',
      description: 'Quản lý tài khoản người dùng'
    },
    
    // Admin Permission Management
    {
      module: 'Admin',
      action: 'MANAGE',
      resource: 'admin.permission.manage',
      label: 'Quản lý phân quyền',
      path: '/admin/permissions',
      icon: '🔐',
      description: 'Quản lý quyền truy cập theo vai trò'
    },
    
    // Service Management
    {
      module: 'Service',
      action: 'VIEW',
      resource: 'service.view',
      label: 'Dịch vụ',
      path: '/services',
      icon: '🧹',
      description: 'Xem danh sách dịch vụ'
    },
    
    // Booking Management
    {
      module: 'Booking',
      action: 'CREATE',
      resource: 'booking.create',
      label: 'Đặt lịch',
      path: '/booking/create',
      icon: '📅',
      description: 'Tạo một lịch đặt mới'
    },
    {
      module: 'Booking',
      action: 'VIEW',
      resource: 'booking.view.history',
      label: 'Lịch sử đặt lịch',
      path: '/booking/history',
      icon: '📋',
      description: 'Xem lịch sử đặt lịch của bản thân'
    },
    {
      module: 'Booking',
      action: 'VIEW',
      resource: 'booking.view.available',
      label: 'Lịch đặt có sẵn',
      path: '/booking/available',
      icon: '📋',
      description: 'Xem các lịch đặt mới có sẵn'
    },
    {
      module: 'Booking',
      action: 'VIEW',
      resource: 'booking.view.assigned',
      label: 'Lịch đã nhận',
      path: '/booking/assigned',
      icon: '✅',
      description: 'Xem các lịch đã nhận'
    },
    {
      module: 'Booking',
      action: 'ACCEPT',
      resource: 'booking.accept',
      label: 'Chấp nhận lịch',
      path: '/booking/accept',
      icon: '✔️',
      description: 'Chấp nhận một lịch đặt'
    },
    {
      module: 'Booking',
      action: 'CANCEL',
      resource: 'booking.cancel',
      label: 'Hủy lịch',
      path: '/booking/cancel',
      icon: '❌',
      description: 'Hủy một lịch đặt'
    },
    
    // Account Management
    {
      module: 'Account',
      action: 'EDIT',
      resource: 'profile.customer.edit',
      label: 'Hồ sơ khách hàng',
      path: '/profile/customer',
      icon: '👤',
      description: 'Chỉnh sửa hồ sơ cá nhân'
    },
    {
      module: 'Account',
      action: 'EDIT',
      resource: 'profile.employee.edit',
      label: 'Hồ sơ nhân viên',
      path: '/profile/employee',
      icon: '👷',
      description: 'Chỉnh sửa hồ sơ nhân viên'
    },
    
    // Review Management
    {
      module: 'Review',
      action: 'CREATE',
      resource: 'review.create',
      label: 'Đánh giá',
      path: '/reviews',
      icon: '⭐',
      description: 'Viết đánh giá cho nhân viên'
    }
  ];

  // Kiểm tra user có permission cụ thể không
  const hasPermission = (module: string, action: string, resource?: string): boolean => {
    if (resource) {
      return hasFeaturePermission(resource);
    }
    return hasModulePermission(module);
  };

  // Lấy danh sách menu được phép hiển thị
  const getPermittedMenus = (): MenuPermission[] => {
    return allMenus.filter(menu => {
      // Kiểm tra xem module có được enable không
      const moduleEnabled = hasModulePermission(menu.module);
      if (!moduleEnabled) return false;
      
      // Kiểm tra xem feature cụ thể có được enable không
      return hasPermission(menu.module, menu.action, menu.resource);
    });
  };

  // Nhóm menu theo category
  const getGroupedMenus = (): MenuGroup[] => {
    const permittedMenus = getPermittedMenus();
    
    const groups: MenuGroup[] = [
      {
        title: 'Quản trị hệ thống',
        key: 'admin',
        menus: permittedMenus.filter(menu => 
          menu.module === 'Admin'
        )
      },
      {
        title: 'Dịch vụ',
        key: 'services',
        menus: permittedMenus.filter(menu => 
          menu.module === 'Service'
        )
      },
      {
        title: 'Đặt lịch',
        key: 'booking',
        menus: permittedMenus.filter(menu => 
          menu.module === 'Booking'
        )
      },
      {
        title: 'Tài khoản',
        key: 'account',
        menus: permittedMenus.filter(menu => 
          menu.module === 'Account'
        )
      },
      {
        title: 'Đánh giá',
        key: 'review',
        menus: permittedMenus.filter(menu => 
          menu.module === 'Review'
        )
      }
    ];

    // Chỉ trả về các group có menu
    return groups.filter(group => group.menus.length > 0);
  };

  // Kiểm tra có quyền truy cập route không
  const canAccessRoute = (path: string): boolean => {
    return availableMenus.some(menu => menu.path === path);
  };

  useEffect(() => {
    if (enabledModules && enabledModules.length > 0) {
      const permittedMenus = getPermittedMenus();
      setAvailableMenus(permittedMenus);
    } else {
      setAvailableMenus([]);
    }
  }, [enabledModules]);

  return {
    loading,
    error,
    availableMenus,
    groupedMenus: getGroupedMenus(),
    hasPermission,
    canAccessRoute,
    refetchPermissions: () => {
      // This will be handled by useUserPermissions
    }
  };
};
