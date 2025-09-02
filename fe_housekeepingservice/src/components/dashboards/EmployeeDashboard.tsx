import React from 'react';
import { useAuth } from '../../shared/hooks/useAuth';
import { useRolePermissions } from '../../shared/hooks/useRolePermissions';
import { useStaticData, getNestedValue } from '../../shared/hooks/useStaticData';
import { useLanguage } from '../../shared/hooks/useLanguage';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { data: staticData, loading: staticLoading } = useStaticData('employee-dashboard', language);
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
                {getNestedValue(staticData, 'title', 'Bảng điều khiển Nhân viên')}
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
        {/* Today's Schedule */}
        {hasPermission('schedule.view') && (
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {getNestedValue(staticData, 'todaySchedule.title', 'Lịch làm việc hôm nay')}
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500">
                {getNestedValue(staticData, 'todaySchedule.empty', 'Không có lịch làm việc hôm nay')}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {hasPermission('schedule.view') && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {getNestedValue(staticData, 'stats.completedToday', 'Hoàn thành hôm nay')}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">0</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasPermission('schedule.view') && (
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
                        {getNestedValue(staticData, 'stats.pending', 'Đang chờ')}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">0</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}

          {hasPermission('customer.view') && (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {getNestedValue(staticData, 'stats.customersServed', 'Khách hàng đã phục vụ')}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">0</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

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
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-2">
                    <span className="text-white text-sm">📋</span>
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

export default EmployeeDashboard;
