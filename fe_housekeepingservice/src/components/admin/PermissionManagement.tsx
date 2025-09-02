import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { useMenuPermissions } from '../../shared/hooks/useMenuPermissions';
import { permissionService } from '../../services/permissionService';
import type { Role, PermissionRole, PermissionFeature, PermissionModule } from '../../services/permissionService';

// Types for pending changes
interface PendingChange {
  featureId: number;
  featureName: string;
  description: string;
  moduleName: string;
  oldValue: boolean;
  newValue: boolean;
}

const PermissionManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const { groupedMenus, hasPermission } = useMenuPermissions();
  
  // State for roles and permissions
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [roleData, setRoleData] = useState<PermissionRole | null>(null);
  const [originalRoleData, setOriginalRoleData] = useState<PermissionRole | null>(null);
  
  // State for UI
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [expandedModules, setExpandedModules] = useState<{ [key: string]: boolean }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  // State for pending changes
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Kiểm tra quyền truy cập - giả định admin có quyền
  const canManagePermissions = user && 'adminId' in user;

  // Header functions
  const handleLogout = async () => {
    try {
      await authLogout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const getUserRole = () => {
    if (!user) return '';
    if ('customerId' in user) return 'Customer';
    if ('employeeId' in user) return 'Employee';
    if ('adminId' in user) return 'Administrator';
    return '';
  };

  const handleHomeClick = () => {
    navigate('/dashboard');
  };

  const handleProfileClick = () => {
    setIsUserDropdownOpen(false);
  };

  const handleSettingsClick = () => {
    setIsUserDropdownOpen(false);
  };

  const toggleSideMenu = () => {
    setIsSideMenuOpen(!isSideMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    setIsSideMenuOpen(false);
  };

  useEffect(() => {
    if (canManagePermissions) {
      loadRoles();
    }
  }, [canManagePermissions]);

  useEffect(() => {
    if (selectedRoleId) {
      loadRolePermissions(selectedRoleId);
    }
  }, [selectedRoleId]);

  // Thêm event listener cho phím ESC và phím tắt khác
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showConfirmDialog) {
          setShowConfirmDialog(false);
        } else {
          navigate('/dashboard');
        }
      }
      
      // Ctrl+S để lưu thay đổi
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        if (pendingChanges.length > 0) {
          setShowConfirmDialog(true);
        }
      }
      
      // Ctrl+R để reset thay đổi
      if (event.ctrlKey && event.key === 'r') {
        event.preventDefault();
        if (pendingChanges.length > 0) {
          handleResetChanges();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [navigate, showConfirmDialog, pendingChanges.length]);

  // Load roles from API
  const loadRoles = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await permissionService.getManageableRoles();
      
      if (response.success && response.data) {
        setRoles(response.data);
      } else {
        setError(response.message || 'Không thể tải danh sách vai trò');
      }
    } catch (err: any) {
      console.error('Failed to load roles:', err);
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const loadRolePermissions = async (roleId: number) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await permissionService.getRoleDetail(roleId);
      
      if (response.success && response.data && response.data.length > 0) {
        const rolePermissions = response.data[0];
        setRoleData(rolePermissions);
        setOriginalRoleData(JSON.parse(JSON.stringify(rolePermissions))); // Deep copy
        
        // Reset UI state
        setSelectedModule('');
        setExpandedModules({});
        setPendingChanges([]);
      } else {
        setError(response.message || 'Không thể tải thông tin quyền');
        setRoleData(null);
        setOriginalRoleData(null);
      }
    } catch (err: any) {
      console.error('Failed to load role permissions:', err);
      setError('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Handle feature permission change (local state only)
  const handleFeatureToggle = (featureId: number, newValue: boolean) => {
    if (!roleData || !originalRoleData) return;

    // Update local state
    const updatedRoleData = { ...roleData };
    updatedRoleData.modules = updatedRoleData.modules.map(module => ({
      ...module,
      features: module.features.map(feature =>
        feature.featureId === featureId
          ? { ...feature, isEnabled: newValue }
          : feature
      )
    }));
    setRoleData(updatedRoleData);

    // Update pending changes
    const originalFeature = findFeatureInRoleData(originalRoleData, featureId);
    const currentFeature = findFeatureInRoleData(updatedRoleData, featureId);
    
    if (originalFeature && currentFeature) {
      const moduleForFeature = findModuleForFeature(updatedRoleData, featureId);
      
      // Remove existing pending change for this feature
      const filteredChanges = pendingChanges.filter(change => change.featureId !== featureId);
      
      // Add new pending change if value differs from original
      if (originalFeature.isEnabled !== newValue) {
        const newChange: PendingChange = {
          featureId,
          featureName: currentFeature.featureName,
          description: currentFeature.description,
          moduleName: moduleForFeature?.moduleName || '',
          oldValue: originalFeature.isEnabled,
          newValue
        };
        setPendingChanges([...filteredChanges, newChange]);
      } else {
        setPendingChanges(filteredChanges);
      }
    }
  };

  // Helper functions
  const findFeatureInRoleData = (roleData: PermissionRole, featureId: number): PermissionFeature | null => {
    for (const module of roleData.modules) {
      const feature = module.features.find(f => f.featureId === featureId);
      if (feature) return feature;
    }
    return null;
  };

  const findModuleForFeature = (roleData: PermissionRole, featureId: number): PermissionModule | null => {
    for (const module of roleData.modules) {
      if (module.features.some(f => f.featureId === featureId)) {
        return module;
      }
    }
    return null;
  };

  // Save all pending changes
  const handleSaveChanges = async () => {
    if (pendingChanges.length === 0 || !selectedRoleId) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Process each pending change
      for (const change of pendingChanges) {
        await permissionService.updateFeaturePermission(
          selectedRoleId, 
          change.featureId, 
          { isEnabled: change.newValue }
        );
      }

      // Update original data to current state
      if (roleData) {
        setOriginalRoleData(JSON.parse(JSON.stringify(roleData)));
      }
      
      // Clear pending changes
      setPendingChanges([]);
      setShowConfirmDialog(false);
      
      setSuccess(`Đã cập nhật ${pendingChanges.length} thay đổi thành công`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Failed to save changes:', err);
      setError('Lỗi kết nối server khi lưu thay đổi');
    } finally {
      setSaving(false);
    }
  };

  // Reset all changes
  const handleResetChanges = () => {
    if (originalRoleData) {
      setRoleData(JSON.parse(JSON.stringify(originalRoleData)));
      setPendingChanges([]);
    }
  };

  const toggleModule = (moduleName: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleName]: !prev[moduleName]
    }));
    
    // Auto-select the module when expanding
    if (!expandedModules[moduleName]) {
      setSelectedModule(moduleName);
    }
  };

  // Filter features based on search term
  const getFilteredFeatures = (features: PermissionFeature[]) => {
    if (!searchTerm) return features;
    return features.filter(feature =>
      feature.featureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (!canManagePermissions) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không có quyền truy cập</h2>
          <p className="text-gray-600 mb-4">Bạn không có quyền quản lý phân quyền.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Quay lại Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header đồng bộ với Dashboard */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Menu toggle and Home */}
            <div className="flex items-center space-x-5">
              {/* Menu toggle button */}
              <button
                onClick={toggleSideMenu}
                className="flex flex-col gap-1 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                title="Open menu"
              >
                <span className="w-5 h-0.5 bg-gray-600 rounded-sm"></span>
                <span className="w-5 h-0.5 bg-gray-600 rounded-sm"></span>
                <span className="w-5 h-0.5 bg-gray-600 rounded-sm"></span>
              </button>
              
              {/* Home button */}
              <button 
                onClick={handleHomeClick}
                className="flex items-center space-x-2 text-gray-900 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors font-semibold text-lg"
                title="Quay về Dashboard"
              >
                <svg className="h-8 w-8 text-gray-700 hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {user && 'adminId' in user && (
                  <span className="text-red-600 ml-2 text-sm">(ADMIN)</span>
                )}
              </button>

              {/* Current page indicator */}
              <nav className="hidden md:flex">
                <span className="text-gray-900 font-medium">/ Quản lý Phân quyền</span>
              </nav>
            </div>

            {/* Center - Search với màu sắc của PermissionManagement */}
            <div className="flex-1 max-w-lg mx-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tìm kiếm tính năng..."
                />
              </div>
            </div>

            {/* Right side - User info and dropdown */}
            <div className="flex items-center space-x-4">
              {/* User greeting and info */}
              {user && (
                <div className="hidden md:flex items-center space-x-3">
                  {/* Avatar with dropdown - bao gồm cả text và avatar */}
                  <div className="relative">
                    <button
                      onClick={toggleUserDropdown}
                      className="flex items-center space-x-3 text-sm focus:outline-none rounded-lg p-2 hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          Xin chào {user.fullName || user.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          {getUserRole()}
                        </div>
                      </div>
                      
                      <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-base">
                          {(user.fullName || user.username)?.charAt(0).toUpperCase() || 'A'}
                        </span>
                      </div>
                      
                      <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    {isUserDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                        <button
                          onClick={handleProfileClick}
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100"
                        >
                          Hồ sơ cá nhân
                        </button>
                        <button
                          onClick={handleSettingsClick}
                          className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100"
                        >
                          Cài đặt
                        </button>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Logout button (always visible) */}
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Side Menu Overlay */}
      {isSideMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSideMenuOpen(false)}
        />
      )}

      {/* Side Menu */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: isSideMenuOpen ? 0 : '-300px',
        height: '100vh',
        width: '300px',
        background: 'white',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
        transition: 'left 0.3s ease',
        zIndex: 1200,
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e1e1e1'
        }}>
          <h3 style={{ margin: 0, color: '#333' }}>Chức năng</h3>
          <button
            onClick={() => setIsSideMenuOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666'
            }}
          >×</button>
        </div>
        
        {/* Menu Groups */}
        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
          {groupedMenus.length > 0 ? (
            groupedMenus.map((group) => (
              <div key={group.key} style={{ marginBottom: '25px' }}>
                <h4 style={{ 
                  margin: '0 0 15px 0', 
                  color: '#333', 
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {group.title}
                </h4>
                <div style={{ paddingLeft: '10px' }}>
                  {group.menus.map((menu) => (
                    <button
                      key={menu.path}
                      onClick={() => handleMenuItemClick(menu.path)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        margin: '4px 0',
                        background: 'none',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '14px',
                        color: '#555',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                        e.currentTarget.style.color = '#007bff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#555';
                      }}
                    >
                      <span style={{ marginRight: '12px', fontSize: '16px' }}>
                        {menu.icon}
                      </span>
                      <div>
                        <div style={{ fontWeight: '500' }}>{menu.label}</div>
                        {menu.description && (
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#999', 
                            marginTop: '2px' 
                          }}>
                            {menu.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              color: '#999', 
              padding: '20px' 
            }}>
              <p>Không có quyền truy cập chức năng nào.</p>
              <p style={{ fontSize: '12px', marginTop: '10px' }}>
                Vui lòng liên hệ quản trị viên để được cấp quyền.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Alert messages */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
            <button
              onClick={() => setError('')}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <svg className="fill-current h-6 w-6 text-red-500" role="button" viewBox="0 0 20 20">
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{success}</span>
            <button
              onClick={() => setSuccess('')}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
            >
              <svg className="fill-current h-6 w-6 text-green-500" role="button" viewBox="0 0 20 20">
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Left sidebar - Role selection */}
          <div className="xl:w-1/4">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Chọn Vai trò</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {roles.length === 0 && !loading ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Không có vai trò nào để quản lý
                  </div>
                ) : (
                  roles.map((role) => (
                    <button
                      key={role.roleId}
                      onClick={() => setSelectedRoleId(role.roleId)}
                      className={`w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors ${
                        selectedRoleId === role.roleId ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{role.roleName}</h4>
                        {selectedRoleId === role.roleId && (
                          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Middle panel - Module tree */}
          <div className="xl:w-1/3">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Modules</h3>
                {roleData && (
                  <p className="text-sm text-gray-500 mt-1">
                    Vai trò: <span className="font-medium text-blue-600">{roleData.roleName}</span>
                  </p>
                )}
              </div>
              
              <div className="divide-y divide-gray-200">
                {!roleData && !loading && selectedRoleId && (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Không có dữ liệu phân quyền
                  </div>
                )}
                {!selectedRoleId && !loading && (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Chọn vai trò để xem modules
                  </div>
                )}
                {roleData?.modules.map((module) => {
                  const enabledFeatures = module.features.filter(f => f.isEnabled).length;
                  const totalFeatures = module.features.length;
                  
                  return (
                    <div key={module.moduleName}>
                      <button
                        onClick={() => toggleModule(module.moduleName)}
                        className={`w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors ${
                          selectedModule === module.moduleName ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div>
                          <h4 className="font-medium text-gray-900 flex items-center">
                            <svg
                              className={`h-4 w-4 mr-2 text-gray-400 transform transition-transform ${
                                expandedModules[module.moduleName] ? 'rotate-90' : ''
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            {module.moduleName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {enabledFeatures}/{totalFeatures} tính năng được bật
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            enabledFeatures === totalFeatures ? 'bg-green-500' :
                            enabledFeatures > 0 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                        </div>
                      </button>
                      
                      {/* Expanded features */}
                      {expandedModules[module.moduleName] && (
                        <div className="bg-gray-50 border-t border-gray-200">
                          {module.features.map((feature) => (
                            <div
                              key={feature.featureId}
                              onClick={() => setSelectedModule(module.moduleName)}
                              className={`px-10 py-3 text-sm border-l-2 cursor-pointer hover:bg-gray-100 transition-colors ${
                                selectedModule === module.moduleName ? 'border-blue-500 bg-blue-50' : 'border-transparent'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">{feature.featureName}</span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  feature.isEnabled 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {feature.isEnabled ? 'Bật' : 'Tắt'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">{feature.description}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right panel - Feature management */}
          <div className="xl:w-5/12">
            <div className="space-y-6">
              {/* Feature management panel */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedModule ? `Quản lý tính năng - ${selectedModule}` : 'Chọn module để xem tính năng'}
                  </h3>
                </div>

                <div className="p-6">
                  {selectedModule && roleData ? (
                    (() => {
                      const module = roleData.modules.find(m => m.moduleName === selectedModule);
                      if (!module) return <p className="text-gray-500">Module không tìm thấy</p>;

                      const filteredFeatures = getFilteredFeatures(module.features);
                      
                      if (filteredFeatures.length === 0) {
                        return (
                          <p className="text-gray-500 text-center py-8">
                            {searchTerm ? 'Không tìm thấy tính năng phù hợp' : 'Module này chưa có tính năng nào'}
                          </p>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {filteredFeatures.map((feature) => (
                            <div
                              key={feature.featureId}
                              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                            >
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{feature.featureName}</h4>
                                <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                              </div>
                              
                              <div className="ml-4">
                                <label className="flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={feature.isEnabled}
                                    onChange={(e) => handleFeatureToggle(feature.featureId, e.target.checked)}
                                    disabled={saving}
                                    className="sr-only"
                                  />
                                  <div className={`relative w-12 h-6 rounded-full transition-colors ${
                                    feature.isEnabled ? 'bg-blue-600' : 'bg-gray-300'
                                  }`}>
                                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                                      feature.isEnabled ? 'transform translate-x-6' : ''
                                    }`}></div>
                                  </div>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Chọn module</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {!selectedRoleId ? 'Chọn vai trò trước, sau đó chọn module để xem và quản lý tính năng.' : 'Chọn một module từ danh sách bên trái để xem và quản lý tính năng.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pending changes panel */}
              {pendingChanges.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        Thay đổi chưa lưu ({pendingChanges.length})
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleResetChanges}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Hủy bỏ
                        </button>
                        <button
                          onClick={() => setShowConfirmDialog(true)}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Lưu thay đổi
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-3">
                      {pendingChanges.map((change) => (
                        <div key={change.featureId} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {change.moduleName} - {change.featureName}
                            </div>
                            <div className="text-xs text-gray-600">{change.description}</div>
                          </div>
                          <div className="ml-4 text-sm">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              change.oldValue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {change.oldValue ? 'Bật' : 'Tắt'}
                            </span>
                            <span className="mx-2 text-gray-400">→</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              change.newValue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {change.newValue ? 'Bật' : 'Tắt'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-yellow-200">
                      <div className="text-xs text-gray-600 flex items-center justify-between">
                        <span> Ctrl+S (Lưu), Ctrl+R (Reset), ESC (Hủy)</span>
                        <span className="text-yellow-600 font-medium">
                          {pendingChanges.length} thay đổi chưa lưu
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Xác nhận lưu thay đổi</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Bạn có chắc chắn muốn lưu {pendingChanges.length} thay đổi? 
                  Hành động này sẽ cập nhật quyền cho vai trò {roleData?.roleName}.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowConfirmDialog(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                  >
                    {saving ? 'Đang lưu...' : 'Xác nhận'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManagement;
