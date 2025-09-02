import React from 'react';
import { useAuth } from '../../shared/hooks/useAuth';
import { useRolePermissions } from '../../shared/hooks/useRolePermissions';
import { useStaticData, getNestedValue } from '../../shared/hooks/useStaticData';
import { useLanguage } from '../../shared/hooks/useLanguage';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { data: staticData, loading: staticLoading } = useStaticData('customer-dashboard', language);
  const { getMenuItems, hasPermission, loading: permissionsLoading } = useRolePermissions();

  const menuItems = getMenuItems();

  if (staticLoading || permissionsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getNestedValue(staticData, 'title', 'Bảng điều khiển Khách hàng')}
              </h1>
              <p className="text-gray-600">
                {getNestedValue(staticData, 'welcome', 'Chào mừng')}, {user?.fullName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recent Bookings */}
        {hasPermission('booking.view') && (
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {getNestedValue(staticData, 'recentBookings.title', 'Đặt lịch gần đây')}
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500">
                {getNestedValue(staticData, 'recentBookings.empty', 'Chưa có đặt lịch nào')}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {hasPermission('booking.view') && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {getNestedValue(staticData, 'stats.totalBookings', 'Tổng đặt lịch')}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">0</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasPermission('booking.view') && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {getNestedValue(staticData, 'stats.pendingBookings', 'Đang chờ xác nhận')}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">0</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasPermission('service.view') && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {getNestedValue(staticData, 'stats.favoriteServices', 'Dịch vụ yêu thích')}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">0</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Services Categories */}
        {hasPermission('service.view') && (
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {getNestedValue(staticData, 'services.title', 'Dịch vụ phổ biến')}
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-900 mb-2">Dọn dẹp nhà cửa</h4>
                  <p className="text-sm text-gray-600 mb-3">Dọn dẹp, lau chùi nhà cửa chuyên nghiệp</p>
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Đặt ngay
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-900 mb-2">Giặt ủi</h4>
                  <p className="text-sm text-gray-600 mb-3">Giặt ủi quần áo, chăn màn chuyên nghiệp</p>
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Đặt ngay
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-900 mb-2">Nấu ăn</h4>
                  <p className="text-sm text-gray-600 mb-3">Nấu ăn gia đình, tiệc tùng</p>
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Đặt ngay
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {getNestedValue(staticData, 'quickActions.title', 'Thao tác nhanh')}
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {menuItems.map((item) => (
                <a
                  key={item.key}
                  href={item.path}
                  className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mb-2">
                    <span className="text-white text-sm">🏠</span>
                  </div>
                  <span className="text-sm text-gray-900 text-center">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
