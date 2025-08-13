import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { User } from '../types/auth';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        // Token không hợp lệ, chuyển về trang đăng nhập
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_roles');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_roles');
      navigate('/login');
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
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
          marginBottom: '30px' 
        }}>
          <h1 style={{ margin: 0, color: '#333' }}>Dashboard</h1>
          <button 
            onClick={handleLogout}
            style={{
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Đăng xuất
          </button>
        </div>

        {user && (
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            <h2 style={{ marginTop: 0, color: '#333' }}>Thông tin tài khoản</h2>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div><strong>ID:</strong> {user.account_id}</div>
              <div><strong>Tên đăng nhập:</strong> {user.username}</div>
              <div><strong>Họ tên:</strong> {user.full_name}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Số điện thoại:</strong> {user.phone_number}</div>
              <div><strong>Vai trò:</strong> {user.roles}</div>
              <div><strong>Trạng thái:</strong> {user.status}</div>
            </div>
          </div>
        )}

        <div style={{ 
          background: '#e8f5e8', 
          padding: '15px', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#27ae60' }}>
            Chào mừng bạn đến với Housekeeping Service!
          </h3>
          <p style={{ margin: 0, color: '#666' }}>
            Bạn đã đăng nhập thành công vào hệ thống.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
