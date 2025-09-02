import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';
import { useMenuPermissions } from '../shared/hooks/useMenuPermissions';
import { useStaticData, getNestedValue } from '../shared/hooks/useStaticData';
import { useLanguage } from '../shared/hooks/useLanguage';
import Header from '../shared/components/Header';
import type { CustomerData, EmployeeData, AdminData } from '../types/auth';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout: authLogout, loading: authLoading } = useAuth();
  const { groupedMenus, loading: permissionsLoading, hasPermission } = useMenuPermissions();
  const { language } = useLanguage();
  const { data: staticData, loading: staticLoading } = useStaticData('dashboard', language);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = async () => {
    try {
      await authLogout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  if (authLoading || staticLoading || permissionsLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>{getNestedValue(staticData, 'loading', 'Loading...')}</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <Header 
        isHomePage={true}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={getNestedValue(staticData, 'header.search.placeholder', 'Tìm kiếm...')}
      />

      {/* Main Content */}
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          padding: '20px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '20px' 
          }}>
            <h1 style={{ margin: 0, color: '#333' }}>
              {getNestedValue(staticData, 'welcome.title', 'Dashboard')}
            </h1>
            <div style={{ color: '#666', fontSize: '14px' }}>
              {getNestedValue(staticData, 'welcome.date', new Date().toLocaleDateString('vi-VN'))}
            </div>
          </div>

          {/* Welcome message */}
          <div style={{ 
            background: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '6px', 
            marginBottom: '30px',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
              {getNestedValue(staticData, 'welcome.greeting', 'Chào mừng')} {user?.fullName}!
            </h3>
            <p style={{ margin: 0, color: '#666' }}>
              {getNestedValue(staticData, 'welcome.description', 'Chọn chức năng từ menu để bắt đầu sử dụng hệ thống.')}
            </p>
          </div>

          {/* Quick actions */}
          <div>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>
              {getNestedValue(staticData, 'quick_actions.title', 'Chức năng nhanh')}
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '15px' 
            }}>
              {groupedMenus.length > 0 ? (
                groupedMenus.slice(0, 6).map((group) => (
                  group.menus.slice(0, 1).map((menu) => (
                    <button
                      key={menu.path}
                      onClick={() => navigate(menu.path)}
                      style={{
                        background: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '20px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#007bff';
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#ddd';
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{menu.icon}</span>
                      <div>
                        <div style={{ fontWeight: '500', marginBottom: '5px', color: '#333' }}>
                          {menu.label}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {menu.description}
                        </div>
                      </div>
                    </button>
                  ))
                ))
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  color: '#999', 
                  padding: '40px',
                  gridColumn: '1 / -1'
                }}>
                  <p>{getNestedValue(staticData, 'no_permissions', 'Không có quyền truy cập chức năng nào.')}</p>
                  <p style={{ fontSize: '12px', marginTop: '10px' }}>
                    {getNestedValue(staticData, 'contact_admin', 'Vui lòng liên hệ quản trị viên để được cấp quyền.')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
