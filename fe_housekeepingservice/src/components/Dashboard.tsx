import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useStaticData, getNestedValue } from '../shared/hooks/useStaticData';
import { useLanguage } from '../shared/hooks/useLanguage';
import LanguageSwitcher from '../shared/components/LanguageSwitcher';
import type { User } from '../types/auth';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { data: staticData, loading: staticLoading } = useStaticData('dashboard', language);

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

  if (isLoading || staticLoading) {
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
      {/* Language Switcher */}
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <LanguageSwitcher />
      </div>
      
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
          <h1 style={{ margin: 0, color: '#333' }}>
            {getNestedValue(staticData, 'title', 'Dashboard')}
          </h1>
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
            {getNestedValue(staticData, 'actions.logout', 'Logout')}
          </button>
        </div>

        {user && (
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            <h2 style={{ marginTop: 0, color: '#333' }}>
              {getNestedValue(staticData, 'user_info.title', 'Account Information')}
            </h2>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div><strong>{getNestedValue(staticData, 'user_info.fields.id', 'ID')}:</strong> {user.account_id}</div>
              <div><strong>{getNestedValue(staticData, 'user_info.fields.username', 'Username')}:</strong> {user.username}</div>
              <div><strong>{getNestedValue(staticData, 'user_info.fields.full_name', 'Full Name')}:</strong> {user.full_name}</div>
              <div><strong>{getNestedValue(staticData, 'user_info.fields.email', 'Email')}:</strong> {user.email}</div>
              <div><strong>{getNestedValue(staticData, 'user_info.fields.phone', 'Phone Number')}:</strong> {user.phone_number}</div>
              <div><strong>{getNestedValue(staticData, 'user_info.fields.roles', 'Roles')}:</strong> {user.roles}</div>
              <div><strong>{getNestedValue(staticData, 'user_info.fields.status', 'Status')}:</strong> {user.status}</div>
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
            {getNestedValue(staticData, 'welcome.title', 'Welcome to Housekeeping Service!')}
          </h3>
          <p style={{ margin: 0, color: '#666' }}>
            {getNestedValue(staticData, 'welcome.subtitle', 'You have successfully logged into the system.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
