import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { LoginRequest } from '../../types/auth';
import { useStaticData, getNestedValue } from '../../shared/hooks/useStaticData';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { data: staticData, loading: staticLoading } = useStaticData('login');
  
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Return loading state if static data is still loading
  if (staticLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username) {
      newErrors.username = getNestedValue(staticData, 'messages.validation.username_required', 'Tên đăng nhập là bắt buộc');
    }

    if (!formData.password) {
      newErrors.password = getNestedValue(staticData, 'messages.validation.password_required', 'Mật khẩu là bắt buộc');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Xóa lỗi khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await authService.login(formData);
      localStorage.setItem('token', response.access_token);
      navigate('/dashboard');
    } catch (error: any) {
      setErrors({
        general: error.response?.data?.error || 'Đăng nhập thất bại. Vui lòng thử lại.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-auth p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getNestedValue(staticData, 'title', 'Đăng nhập')}
            </h1>
            <p className="text-gray-600">
              {getNestedValue(staticData, 'subtitle', 'Đăng nhập vào tài khoản của bạn')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-slide-up">
                {errors.general}
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  {getNestedValue(staticData, 'form.username.label', 'Tên đăng nhập')}
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  placeholder={getNestedValue(staticData, 'form.username.placeholder', 'Nhập tên đăng nhập')}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {getNestedValue(staticData, 'form.password.label', 'Mật khẩu')}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  placeholder={getNestedValue(staticData, 'form.password.placeholder', 'Nhập mật khẩu')}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 font-medium flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isLoading ? getNestedValue(staticData, 'actions.logging_in', 'Đang đăng nhập...') : getNestedValue(staticData, 'actions.login', 'Đăng nhập')}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 space-y-4">
            <div className="text-center">
              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
              >
                {getNestedValue(staticData, 'messages.forgot_password', 'Quên mật khẩu?')}
              </Link>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600">
                {getNestedValue(staticData, 'messages.no_account', 'Chưa có tài khoản?')}{' '}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
                  {getNestedValue(staticData, 'messages.register_link', 'Đăng ký ngay')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
