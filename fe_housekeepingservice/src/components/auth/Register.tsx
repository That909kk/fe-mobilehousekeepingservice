import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { RegisterRequest, RegistrationRole } from '../../types/auth';
import { useStaticData, getNestedValue } from '../../shared/hooks/useStaticData';
import { useLanguage } from '../../shared/hooks/useLanguage';
import TermsModal from '../../shared/components/TermsModal';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { data: staticData } = useStaticData('register', language);
  
  const [formData, setFormData] = useState<RegisterRequest>({
    role: 'CUSTOMER',
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Validate individual fields
  const validateField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case 'role':
        if (!value) {
          return getNestedValue(staticData, 'messages.validation.role_required', 'Vai trò là bắt buộc');
        } else if (!(['CUSTOMER', 'EMPLOYEE'] as RegistrationRole[]).includes(value as RegistrationRole)) {
          return getNestedValue(staticData, 'messages.validation.role_invalid', 'Vai trò không hợp lệ');
        }
        break;

      case 'fullName':
        if (!value.trim()) {
          return getNestedValue(staticData, 'messages.validation.fullName_required', 'Họ và tên là bắt buộc');
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value.trim())) {
          return getNestedValue(staticData, 'messages.validation.fullName_invalid', 'Họ và tên chỉ được chứa chữ cái và khoảng trắng');
        }
        break;

      case 'username':
        if (!value.trim()) {
          return getNestedValue(staticData, 'messages.validation.username_required', 'Tên đăng nhập là bắt buộc');
        } else if (value.length < 3) {
          return getNestedValue(staticData, 'messages.validation.username_min_length', 'Tên đăng nhập phải có ít nhất 3 ký tự');
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return getNestedValue(staticData, 'messages.validation.username_invalid', 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới');
        }
        break;

      case 'email':
        if (!value.trim()) {
          return getNestedValue(staticData, 'messages.validation.email_required', 'Email là bắt buộc');
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          return getNestedValue(staticData, 'messages.validation.email_invalid', 'Email không hợp lệ');
        }
        break;

      case 'phoneNumber':
        if (!value.trim()) {
          return getNestedValue(staticData, 'messages.validation.phoneNumber_required', 'Số điện thoại là bắt buộc');
        } else if (!/^[0-9]{10,11}$/.test(value.replace(/\s/g, ''))) {
          return getNestedValue(staticData, 'messages.validation.phoneNumber_invalid', 'Số điện thoại phải có 10-11 chữ số');
        }
        break;

      case 'password':
        if (!value) {
          return getNestedValue(staticData, 'messages.validation.password_required', 'Mật khẩu là bắt buộc');
        } else if (value.length < 6) {
          return getNestedValue(staticData, 'messages.validation.password_min_length', 'Mật khẩu phải có ít nhất 6 ký tự');
        }
        break;

      case 'confirmPassword':
        if (!value) {
          return getNestedValue(staticData, 'messages.validation.confirm_password_required', 'Xác nhận mật khẩu là bắt buộc');
        } else if (value !== formData.password) {
          return getNestedValue(staticData, 'messages.validation.passwords_not_match', 'Mật khẩu xác nhận không khớp');
        }
        break;

      default:
        return '';
    }
    return '';
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate all fields
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof RegisterRequest]);
      if (error) {
        newErrors[key] = error;
      }
    });

    // Validate confirm password
    const confirmPasswordError = validateField('confirmPassword', confirmPassword);
    if (confirmPasswordError) {
      newErrors.confirmPassword = confirmPasswordError;
    }

    // Validate terms acceptance
    if (!acceptTerms) {
      newErrors.terms = getNestedValue(staticData, 'messages.validation.terms_required', 'Bạn phải đồng ý với điều khoản sử dụng');
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
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // If password changes and confirmPassword has value, validate confirmPassword again
    if (name === 'password' && confirmPassword && errors.confirmPassword) {
      const confirmPasswordError = validateField('confirmPassword', confirmPassword);
      if (!confirmPasswordError) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    
    // Validate field when user leaves the input
    let fieldValue = '';
    if (name === 'confirmPassword') {
      fieldValue = confirmPassword;
    } else if (name in formData) {
      fieldValue = formData[name as keyof RegisterRequest];
    }
    
    const error = validateField(name, fieldValue);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    } else {
      // Remove error if validation passes
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleTermsChange = (checked: boolean) => {
    setAcceptTerms(checked);
    // Clear terms error when user checks/unchecks
    if (errors.terms) {
      setErrors(prev => ({
        ...prev,
        terms: ''
      }));
    }
  };

  // Helper function to evaluate password strength
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
      const response = await authService.register(formData);
      if (response.success) {
        // Show success message
        const successMessage = getNestedValue(staticData, 'messages.register_success', 'Đăng ký thành công! Vui lòng xác thực OTP.');
        alert(successMessage);
        
        // Navigate to OTP verification
        navigate('/verify-otp', {
          state: {
            email: formData.email,
            type: 'register'
          }
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : getNestedValue(staticData, 'messages.register_error', 'Đăng ký thất bại. Vui lòng thử lại.');
      setErrors({
        general: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500">
          {/* Header with improved styling */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
              {getNestedValue(staticData, 'title', 'Đăng ký')}
            </h1>
            <p className="text-gray-600 text-lg">
              {getNestedValue(staticData, 'subtitle', 'Tạo tài khoản mới để bắt đầu')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message with improved styling */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <svg className="flex-shrink-0 h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="ml-3 text-sm text-red-800">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Form Fields with basic styling like Login */}
            <div className="space-y-6">
              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  {getNestedValue(staticData, 'form.role.label', 'Vai trò')}
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`appearance-none relative block w-full px-4 py-3 border ${
                    errors.role ? 'border-red-300' : 'border-gray-300'
                  } text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200`}
                >
                  <option value="CUSTOMER">
                    {getNestedValue(staticData, 'form.role.options.customer', 'Khách hàng')}
                  </option>
                  <option value="EMPLOYEE">
                    {getNestedValue(staticData, 'form.role.options.employee', 'Nhân viên')}
                  </option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role}</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  {getNestedValue(staticData, 'form.fullName.label', 'Họ và tên')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none relative block w-full px-4 py-3 border ${
                      errors.fullName ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200`}
                    placeholder={getNestedValue(staticData, 'form.fullName.placeholder', 'Nhập họ và tên của bạn')}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                </div>
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  {getNestedValue(staticData, 'form.username.label', 'Tên đăng nhập')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none relative block w-full px-4 py-3 border ${
                      errors.username ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200`}
                    placeholder={getNestedValue(staticData, 'form.username.placeholder', 'Nhập tên đăng nhập của bạn')}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {getNestedValue(staticData, 'form.email.label', 'Email')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none relative block w-full px-4 py-3 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200`}
                    placeholder={getNestedValue(staticData, 'form.email.placeholder', 'Nhập địa chỉ email của bạn')}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                    </svg>
                  </div>
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  {getNestedValue(staticData, 'form.phoneNumber.label', 'Số điện thoại')}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none relative block w-full px-4 py-3 border ${
                      errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200`}
                    placeholder={getNestedValue(staticData, 'form.phoneNumber.placeholder', 'Nhập số điện thoại của bạn')}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                </div>
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  {getNestedValue(staticData, 'form.password.label', 'Mật khẩu')}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none relative block w-full px-4 py-3 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200`}
                    placeholder={getNestedValue(staticData, 'form.password.placeholder', 'Tạo mật khẩu mạnh')}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                </div>
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
                <div className="relative">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none relative block w-full px-4 py-3 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-200`}
                    placeholder={getNestedValue(staticData, 'form.confirm_password.placeholder', 'Nhập lại mật khẩu')}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptTerms}
                    onChange={(e) => handleTermsChange(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {getNestedValue(staticData, 'actions.agree_terms', 'Tôi đồng ý với')}{' '}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
                    >
                      {getNestedValue(staticData, 'actions.terms_link', 'Điều khoản sử dụng')}
                    </button>
                  </span>
                </label>
                {errors.terms && (
                  <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !acceptTerms}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {getNestedValue(staticData, 'actions.registering', 'Đang đăng ký...')}
                </>
              ) : (
                getNestedValue(staticData, 'actions.register', 'Tạo tài khoản')
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-gray-600">
              {getNestedValue(staticData, 'messages.have_account', 'Đã có tài khoản?')}{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline">
                {getNestedValue(staticData, 'messages.login_link', 'Đăng nhập ngay')}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      <TermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAgree={() => setAcceptTerms(true)}
      />
    </div>
  );
};

export default Register;
