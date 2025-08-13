import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { RegisterRequest } from '../../types/auth';
import { useStaticData, getNestedValue } from '../../shared/hooks/useStaticData';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { data: staticData, loading: staticLoading } = useStaticData('register');
  
  const [formData, setFormData] = useState<RegisterRequest>({
    username: '',
    password: '',
    full_name: '',
    email: '',
    phone_number: '',
    roles: 'customer'
  });
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (!formData.full_name) {
      newErrors.full_name = getNestedValue(staticData, 'messages.validation.full_name_required', 'Họ và tên là bắt buộc');
    }

    if (!formData.username) {
      newErrors.username = getNestedValue(staticData, 'messages.validation.username_required', 'Tên đăng nhập là bắt buộc');
    } else if (formData.username.length < 3) {
      newErrors.username = getNestedValue(staticData, 'messages.validation.username_min_length', 'Tên đăng nhập phải có ít nhất 3 ký tự');
    }

    if (!formData.email) {
      newErrors.email = getNestedValue(staticData, 'messages.validation.email_required', 'Email là bắt buộc');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = getNestedValue(staticData, 'messages.validation.email_invalid', 'Email không hợp lệ');
    }

    if (!formData.phone_number) {
      newErrors.phone_number = getNestedValue(staticData, 'messages.validation.phone_required', 'Số điện thoại là bắt buộc');
    } else if (!/^[0-9]{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = getNestedValue(staticData, 'messages.validation.phone_invalid', 'Số điện thoại không hợp lệ');
    }

    if (!formData.password) {
      newErrors.password = getNestedValue(staticData, 'messages.validation.password_required', 'Mật khẩu là bắt buộc');
    } else if (formData.password.length < 6) {
      newErrors.password = getNestedValue(staticData, 'messages.validation.password_min_length', 'Mật khẩu phải có ít nhất 6 ký tự');
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = getNestedValue(staticData, 'messages.validation.confirm_password_required', 'Xác nhận mật khẩu là bắt buộc');
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = getNestedValue(staticData, 'messages.validation.passwords_not_match', 'Mật khẩu không khớp');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'confirmPassword') {
      setConfirmPassword(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Xóa lỗi khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Helper function để đánh giá độ mạnh mật khẩu
  const getPasswordStrength = (password: string): string => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score < 2) return 'Yếu';
    if (score < 4) return 'Trung bình';
    return 'Mạnh';
  };

  const getPasswordStrengthClass = (password: string): string => {
    const strength = getPasswordStrength(password);
    if (strength === 'Yếu') return 'bg-red-100 text-red-800';
    if (strength === 'Trung bình') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authService.register(formData);
      alert('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    } catch (error: any) {
      setErrors({
        general: error.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getNestedValue(staticData, 'title', 'Đăng ký')}
            </h1>
            <p className="text-gray-600">
              {getNestedValue(staticData, 'subtitle', 'Tạo tài khoản mới')}
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
              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                  {getNestedValue(staticData, 'form.full_name.label', 'Họ và tên')}
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${errors.full_name ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  placeholder={getNestedValue(staticData, 'form.full_name.placeholder', 'Nhập họ và tên')}
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                )}
              </div>

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

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {getNestedValue(staticData, 'form.email.label', 'Email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  placeholder={getNestedValue(staticData, 'form.email.placeholder', 'Nhập email')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                  {getNestedValue(staticData, 'form.phone_number.label', 'Số điện thoại')}
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${errors.phone_number ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  placeholder={getNestedValue(staticData, 'form.phone_number.placeholder', 'Nhập số điện thoại')}
                />
                {errors.phone_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
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
                {formData.password && (
                  <div className="mt-2">
                    <div className={`text-xs px-3 py-1 rounded-full inline-block font-medium ${getPasswordStrengthClass(formData.password)}`}>
                      Độ mạnh: {getPasswordStrength(formData.password)}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  {getNestedValue(staticData, 'form.confirm_password.label', 'Xác nhận mật khẩu')}
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  placeholder={getNestedValue(staticData, 'form.confirm_password.placeholder', 'Nhập lại mật khẩu')}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="roles" className="block text-sm font-medium text-gray-700 mb-2">
                  Vai trò
                </label>
                <select
                  id="roles"
                  name="roles"
                  value={formData.roles}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${errors.roles ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                >
                  <option value="customer">Khách hàng</option>
                  <option value="provider">Nhà cung cấp</option>
                </select>
                {errors.roles && (
                  <p className="mt-1 text-sm text-red-600">{errors.roles}</p>
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
              {isLoading ? getNestedValue(staticData, 'actions.registering', 'Đang đăng ký...') : getNestedValue(staticData, 'actions.register', 'Đăng ký')}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              {getNestedValue(staticData, 'messages.have_account', 'Đã có tài khoản?')}{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
                {getNestedValue(staticData, 'messages.login_link', 'Đăng nhập ngay')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
