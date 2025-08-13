import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { ResetPasswordRequest } from '../../types/auth';
import { useStaticData, getNestedValue } from '../../shared/hooks/useStaticData';

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: staticData, loading: staticLoading } = useStaticData('reset-password');
  const email = location.state?.email || '';
  const otp = location.state?.otp || '';

  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
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

  useEffect(() => {
    if (!email || !otp) {
      navigate('/forgot-password');
    }
  }, [email, otp, navigate]);

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.new_password) {
      newErrors.new_password = 'Mật khẩu mới không được để trống';
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.new_password)) {
      newErrors.new_password = 'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Vui lòng xác nhận mật khẩu mới';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const resetData: ResetPasswordRequest = {
        email,
        otp,
        new_password: formData.new_password
      };

      await authService.resetPassword(resetData);
      
      // Thông báo thành công và chuyển đến trang đăng nhập
      alert('Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.');
      navigate('/login');
    } catch (error: any) {
      setErrors({
        general: error.response?.data?.error || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (password.length === 0) return { strength: '', color: '' };
    
    let score = 0;
    if (password.length >= 6) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score < 2) return { strength: 'Yếu', color: '#e74c3c' };
    if (score < 4) return { strength: 'Trung bình', color: '#f39c12' };
    return { strength: 'Mạnh', color: '#27ae60' };
  };

  const passwordStrength = getPasswordStrength(formData.new_password);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-auth p-8 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getNestedValue(staticData, 'title', 'Đặt lại mật khẩu')}
            </h1>
            <p className="text-gray-600">
              {getNestedValue(staticData, 'subtitle', 'Tạo mật khẩu mới cho tài khoản của bạn')}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center animate-slide-up">
                {errors.general}
              </div>
            )}

            <div>
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                {getNestedValue(staticData, 'form.new_password.label', 'Mật khẩu mới')}
              </label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${errors.new_password ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                placeholder={getNestedValue(staticData, 'form.new_password.placeholder', 'Nhập mật khẩu mới')}
              />
              {errors.new_password && (
                <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
              )}
              
              {formData.new_password && (
                <div className="mt-2">
                  <div className={`text-xs px-3 py-1 rounded-full inline-block font-medium ${
                    passwordStrength.color === '#e74c3c' ? 'bg-red-100 text-red-800' :
                    passwordStrength.color === '#f39c12' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    Độ mạnh: {passwordStrength.strength}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu mới
              </label>
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 ${errors.confirm_password ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                placeholder="Nhập lại mật khẩu mới"
              />
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Yêu cầu mật khẩu:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                  Ít nhất 6 ký tự
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                  Có ít nhất 1 chữ hoa (A-Z)
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                  Có ít nhất 1 chữ thường (a-z)
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></span>
                  Có ít nhất 1 số (0-9)
                </li>
              </ul>
            </div>

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
              {isLoading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              <Link 
                to="/login" 
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
              >
                Quay lại đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
