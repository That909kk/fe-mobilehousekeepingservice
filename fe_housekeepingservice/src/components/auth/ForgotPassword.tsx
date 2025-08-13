import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { ForgotPasswordRequest } from '../../types/auth';
import { useStaticData, getNestedValue } from '../../shared/hooks/useStaticData';

const ForgotPassword: React.FC = () => {
  const { data: staticData, loading: staticLoading } = useStaticData('forgot-password');
  
  const [formData, setFormData] = useState<ForgotPasswordRequest>({
    email: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

    if (!formData.email) {
      newErrors.email = getNestedValue(staticData, 'messages.validation.email_required', 'Email là bắt buộc');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = getNestedValue(staticData, 'messages.validation.email_invalid', 'Email không hợp lệ');
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
      await authService.forgotPassword(formData);
      setIsSuccess(true);
    } catch (error: any) {
      setErrors({
        general: error.response?.data?.error || 'Có lỗi xảy ra'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-auth p-8 animate-fade-in">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {getNestedValue(staticData, 'messages.success.title', 'Kiểm tra email của bạn')}
              </h2>
              <p className="text-gray-600">
                {getNestedValue(staticData, 'messages.success.subtitle', 'Chúng tôi đã gửi mã xác nhận đến email của bạn')}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm">
                {getNestedValue(staticData, 'messages.success.description', 'Vui lòng kiểm tra hộp thư của bạn và nhấp vào liên kết để đặt lại mật khẩu.')}
              </p>
            </div>

            <div className="space-y-4 text-center">
              <p className="text-sm text-gray-600">
                {getNestedValue(staticData, 'messages.no_email', 'Không nhận được email?')}{' '}
                <button 
                  type="button" 
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
                  onClick={() => setIsSuccess(false)}
                >
                  {getNestedValue(staticData, 'actions.resend', 'Gửi lại')}
                </button>
              </p>
              <p className="text-sm text-gray-600">
                <Link 
                  to="/login" 
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
                >
                  {getNestedValue(staticData, 'messages.login_link', 'Quay lại đăng nhập')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-auth p-8 animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {getNestedValue(staticData, 'title', 'Quên mật khẩu')}
            </h2>
            <p className="text-gray-600">
              {getNestedValue(staticData, 'subtitle', 'Nhập email của bạn để nhận mã xác nhận')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm animate-slide-up">
                {errors.general}
              </div>
            )}

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
                placeholder={getNestedValue(staticData, 'form.email.placeholder', 'Nhập email của bạn')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
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
              {isLoading ? getNestedValue(staticData, 'actions.sending', 'Đang gửi...') : getNestedValue(staticData, 'actions.send_code', 'Gửi mã xác nhận')}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              {getNestedValue(staticData, 'messages.remember_password', 'Nhớ mật khẩu?')}{' '}
              <Link 
                to="/login" 
                className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
              >
                {getNestedValue(staticData, 'messages.login_link', 'Đăng nhập')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
