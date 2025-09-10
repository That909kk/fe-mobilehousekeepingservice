import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/hooks/useAuth';
import { useMenuPermissions } from '../shared/hooks/useMenuPermissions';
import { useStaticData, getNestedValue } from '../shared/hooks/useStaticData';
import { useLanguage } from '../shared/hooks/useLanguage';
import Header from '../shared/components/Header';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading } = useAuth();
  const { groupedMenus, loading: permissionsLoading } = useMenuPermissions();
  const { language } = useLanguage();
  const { data: staticData, loading: staticLoading } = useStaticData('dashboard', language);
  const [searchTerm, setSearchTerm] = useState('');

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

          {/* Main Booking Button - Grab Style */}
          {role === 'CUSTOMER' && (
            <div style={{ 
              background: 'linear-gradient(135deg, #00bf63 0%, #00a455 100%)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
              boxShadow: '0 8px 24px rgba(0,191,99,0.3)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                transform: 'translate(30px, -30px)'
              }} />
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h2 style={{ 
                  color: 'white', 
                  margin: '0 0 8px 0',
                  fontSize: '24px',
                  fontWeight: '700'
                }}>
                  🏠 Đặt dịch vụ dọn dẹp
                </h2>
                <p style={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  margin: '0 0 20px 0',
                  fontSize: '16px'
                }}>
                  Nhanh chóng • Chuyên nghiệp • Tiện lợi
                </p>
                <button
                  onClick={() => navigate('/booking')}
                  style={{
                    background: 'white',
                    color: '#00bf63',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px 32px',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                >
                  <span>🚀</span>
                  Đặt dịch vụ ngay
                </button>
              </div>
            </div>
          )}

          {/* Quick Service Categories for Customers */}
          {role === 'CUSTOMER' && (
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ marginBottom: '16px', color: '#333' }}>
                🧹 Dịch vụ phổ biến
              </h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '16px' 
              }}>
                {[
                  { icon: '🧹', name: 'Dọn dẹp nhà', desc: 'Lau dọn, hút bụi hàng ngày', path: '/booking?category=1' },
                  { icon: '👕', name: 'Giặt ủi', desc: 'Giặt sấy, ủi đồ chuyên nghiệp', path: '/booking?category=2' },
                  { icon: '🏠', name: 'Việc nhà khác', desc: 'Nấu ăn, đi chợ, chăm sóc', path: '/booking?category=3' },
                  { icon: '🔧', name: 'Tổng vệ sinh', desc: 'Vệ sinh sâu toàn diện', path: '/booking?service=2' }
                ].map((service, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(service.path)}
                    style={{
                      background: 'white',
                      border: '2px solid #f0f0f0',
                      borderRadius: '12px',
                      padding: '20px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'block',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#00bf63';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,191,99,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#f0f0f0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                      {service.icon}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                      {service.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      {service.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customer Booking History */}
          {role === 'CUSTOMER' && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                color: 'white'
              }}>
                <div style={{ 
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  transform: 'translate(30px, -30px)'
                }} />
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h3 style={{ 
                    color: 'white', 
                    margin: '0 0 8px 0',
                    fontSize: '20px',
                    fontWeight: '600'
                  }}>
                    📋 Lịch sử đặt dịch vụ
                  </h3>
                  <p style={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    margin: '0 0 16px 0',
                    fontSize: '14px'
                  }}>
                    Xem và quản lý các booking của bạn
                  </p>
                  <button
                    onClick={() => navigate('/booking/history')}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '1px solid rgba(255,255,255,0.3)',
                      borderRadius: '8px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                    }}
                  >
                    Xem lịch sử
                  </button>
                </div>
              </div>
            </div>
          )}

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
