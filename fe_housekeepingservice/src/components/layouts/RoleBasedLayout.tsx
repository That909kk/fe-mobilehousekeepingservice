import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks/useAuth';
import { useRolePermissions } from '../../shared/hooks/useRolePermissions';
import { useLanguage } from '../../shared/hooks/useLanguage';
import type { ReactNode } from 'react';

interface RoleBasedLayoutProps {
  children: ReactNode;
}

const RoleBasedLayout: React.FC<RoleBasedLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout } = useAuth();
  const { getMenuItems } = useRolePermissions();
  const { language, setLanguage } = useLanguage();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const menuItems = getMenuItems();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'ADMIN': return 'bg-red-600';
      case 'EMPLOYEE': return 'bg-green-600';
      case 'CUSTOMER': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getRoleName = () => {
    switch (role) {
      case 'ADMIN': return 'Quản trị viên';
      case 'EMPLOYEE': return 'Nhân viên';
      case 'CUSTOMER': return 'Khách hàng';
      default: return role;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-center h-16 px-4 bg-white border-b">
          <h1 className="text-xl font-bold text-gray-900">
            Housekeeping Service
          </h1>
        </div>
        
        <nav className="mt-4 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${location.pathname === item.path
                    ? `${getRoleColor()} text-white`
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className="mr-3">📊</span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="ml-4 lg:ml-0">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getRoleColor()}`}>
                  {getRoleName()}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'vi' | 'en')}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        {user?.fullName?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="ml-3 text-gray-700 text-sm font-medium">
                      {user?.fullName}
                    </span>
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Thông tin cá nhân
                      </a>
                      <a
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Cài đặt
                      </a>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Sidebar backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default RoleBasedLayout;
