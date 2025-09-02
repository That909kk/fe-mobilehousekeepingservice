import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMenuPermissions } from '../hooks/useMenuPermissions';

interface HeaderProps {
  pageTitle?: string;
  isHomePage?: boolean;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  pageTitle,
  isHomePage = false,
  searchTerm = '',
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  showSearch = true
}) => {
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth();
  const { groupedMenus } = useMenuPermissions();
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

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

  const isAdmin = () => {
    return user && 'adminId' in user;
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Menu toggle and Home/Navigation */}
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
              
              {/* Home button hoặc Navigation */}
              {isHomePage ? (
                <button 
                  onClick={handleHomeClick}
                  className="flex items-center space-x-2 text-gray-900 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors font-semibold text-lg"
                >
                  Trang chủ
                  {isAdmin() && (
                    <span className="text-red-600 ml-2 text-sm">(ADMIN)</span>
                  )}
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleHomeClick}
                    className="flex items-center text-gray-700 hover:text-blue-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                    title="Quay về Dashboard"
                  >
                    <svg className="h-8 w-8 text-gray-700 hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {isAdmin() && (
                      <span className="text-red-600 ml-2 text-sm">(ADMIN)</span>
                    )}
                  </button>

                  {/* Current page indicator */}
                  {pageTitle && (
                    <nav className="hidden md:flex">
                      <span className="text-gray-900 font-medium">/ {pageTitle}</span>
                    </nav>
                  )}
                </div>
              )}
            </div>

            {/* Center - Search */}
            {showSearch && (
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
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={searchPlaceholder}
                  />
                </div>
              </div>
            )}

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
    </>
  );
};

export default Header;
